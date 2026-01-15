"use server";

import { createClient, createAdminClient } from "@/lib/supabase-server";

// Helper to extract Folder ID from Google Drive URL
function extractFolderId(url: string): string | null {
    // Format: https://drive.google.com/drive/folders/FOLDER_ID
    const match = url.match(/\/folders\/([^?/]+)/);
    return match ? match[1] : null;
}

interface DriveFile {
    id: string;
    name: string;
    mimeType: string;
    thumbnailLink?: string;
}

// Helper: Verify Event Ownership to prevent API quota theft
async function verifyEventOwnership(eventId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return false;

    const { data: event } = await supabase
        .from('events')
        .select('photographer_id')
        .eq('id', eventId)
        .single();

    return event && event.photographer_id === user.id;
}

export async function syncPhotosFromDrive(eventId: string, driveFolderUrl: string) {
    // 1. SECURITY CHECK
    const isOwner = await verifyEventOwnership(eventId);
    if (!isOwner) return { success: false, error: "Unauthorized" };

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) return { success: false, error: "Missing API Key" };

    const folderId = extractFolderId(driveFolderUrl);
    if (!folderId) return { success: false, error: "Invalid Link" };

    try {
        const allFiles = await fetchDriveFiles(folderId, apiKey);
        if (allFiles.length === 0) return { success: false, error: "No images found." };

        return insertPhotos(eventId, allFiles);
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

// Helper: Verify Content Continuity (Prevent abusive event recycling)
async function verifyContentContinuity(eventId: string, newDriveFiles: DriveFile[]) {
    const supabase = createAdminClient();
    if (!supabase) return true; // Fail open if admin client fails (avoids blocking valid users on sys error)

    // 1. Get a sample of existing filenames (up to 50)
    const { data: existingPhotos } = await supabase
        .from('photos')
        .select('name')
        .eq('event_id', eventId)
        .limit(50);

    // If no existing photos, it's a fresh sync or empty event -> ALLOW
    if (!existingPhotos || existingPhotos.length === 0) {
        return true;
    }

    // 2. Check for at least ONE match
    // We strictly require that the new batch isn't a 100% replacement of the sample.
    // This allows:
    // - Adding new photos (old names still exist)
    // - Updating some photos (some old names still exist)
    // - Deleting some photos (some old names still exist)
    // But BLOCKS:
    // - Deleting ALL old photos and uploading completely new ones (Event Swap)

    // Create a Set for O(1) lookup
    const newFileNames = new Set(newDriveFiles.map(f => f.name));

    const hasMatch = existingPhotos.some(photo => newFileNames.has(photo.name));

    if (!hasMatch) {
        // Double check: If the sample size was small, maybe we just missed it?
        // But we fetched 50. If user replaced 50/50 files, that's a swap.
        return false;
    }

    return true;
}

// Re-sync: Delete existing photos and import fresh ones with permanent URLs
export async function reSyncPhotosFromDrive(eventId: string, driveFolderUrl: string) {
    // 1. SECURITY CHECK: Verify Ownership FIRST
    const isOwner = await verifyEventOwnership(eventId);
    if (!isOwner) {
        return { success: false, error: "Unauthorized: You do not own this event." };
    }

    // 2. PRE-FETCH DRIVE FILES (Needed for verification before deletion)
    const apiKey = process.env.GOOGLE_API_KEY;
    const folderId = extractFolderId(driveFolderUrl);

    if (!apiKey || !folderId) {
        return { success: false, error: "Configuration Error: Check API Key and Link." };
    }

    let allFiles: DriveFile[] = [];
    try {
        // Reuse the fetch logic? Ideally refactor to shared function, but for now duplicate the fetch part or call a helper.
        // Let's quickly re-implement the fetch loop here to be safe and isolated, or refactor `syncPhotosFromDrive` to accept `files`?
        // Refactoring `syncPhotosFromDrive` is cleaner.
        // Let's modify `syncPhotosFromDrive` to optionally accept `preFetchedFiles`.
        // DOING: Extract fetch logic to helper `fetchDriveFiles`.

        allFiles = await fetchDriveFiles(folderId, apiKey);
        if (allFiles.length === 0) {
            return { success: false, error: "No images found in Drive folder." };
        }

    } catch (e: any) {
        return { success: false, error: "Failed to fetch Drive files: " + e.message };
    }

    // 3. SECURITY CHECK: Content Continuity
    const isContinuous = await verifyContentContinuity(eventId, allFiles);
    if (!isContinuous) {
        return {
            success: false,
            error: "Sync Rejected: It looks like you replaced all photos. To use a different set of photos, please Create a New Event."
        };
    }

    // 4. PROCEED: Delete & Insert
    const adminSupabase = createAdminClient();
    if (!adminSupabase) {
        return { success: false, error: "Server Error: Admin client unavailable." };
    }

    // Delete old
    const { error: deleteError } = await adminSupabase
        .from('photos')
        .delete()
        .eq('event_id', eventId);

    if (deleteError) {
        return { success: false, error: `Failed to clear old photos: ${deleteError.message}` };
    }

    // Insert new (using the pre-fetched files to save API calls)
    return insertPhotos(eventId, allFiles);
}

// --- Helpers to refactor `syncPhotosFromDrive` ---

async function fetchDriveFiles(folderId: string, apiKey: string): Promise<DriveFile[]> {
    let allFiles: DriveFile[] = [];
    let pageToken: string | undefined = undefined;
    let pageCount = 0;
    const MAX_PAGES = 100; // Increased limit to support up to 100k photos

    console.log(`[Drive Sync] Starting fetch for folder: ${folderId}`);

    while (true) {
        if (pageCount >= MAX_PAGES) {
            console.warn(`[Drive Sync] Hit max pages limit (${MAX_PAGES})`);
            break;
        }

        // Use URL object for safe parameter encoding
        const url = new URL('https://www.googleapis.com/drive/v3/files');
        url.searchParams.append('q', `'${folderId}' in parents and (mimeType contains 'image/') and trashed = false`);
        url.searchParams.append('fields', 'nextPageToken,files(id,name,mimeType,thumbnailLink)');
        url.searchParams.append('pageSize', '1000');
        url.searchParams.append('key', apiKey);

        if (pageToken) {
            url.searchParams.append('pageToken', pageToken);
        }

        // Disable cache to ensure fresh results
        const res = await fetch(url.toString(), { cache: 'no-store' });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Drive API Error (${res.status}): ${errorText}`);
        }

        const json = await res.json();

        if (json.error) throw new Error(json.error.message);

        const files = json.files || [];
        allFiles = allFiles.concat(files);

        console.log(`[Drive Sync] Page ${pageCount + 1}: Fetched ${files.length} files. Total so far: ${allFiles.length}`);

        pageToken = json.nextPageToken;
        pageCount++;

        if (!pageToken) {
            console.log(`[Drive Sync] Finished fetching. Total files: ${allFiles.length}`);
            break;
        }
    }
    return allFiles;
}

async function insertPhotos(eventId: string, files: DriveFile[]) {
    const supabase = await createClient();

    // Chunking insertions to be safe with Supabase limits (e.g. 500 at a time)
    const CHUNK_SIZE = 500;
    for (let i = 0; i < files.length; i += CHUNK_SIZE) {
        const chunk = files.slice(i, i + CHUNK_SIZE);
        const photosToInsert = chunk.map(file => {
            // Prefer the API-provided thumbnailLink (usually lh3.googleusercontent.com) which is robust and cached.
            // Ensure we get a large enough version by appending/replacing size param.
            // The default thumbnailLink usually ends with '=s220' (small). We want high res.
            // Force use of drive.google.com/thumbnail endpoint.
            // This redirects to a cached lh3 link with 'Content-Disposition: inline', which allows it to be displayed in <img> tags.
            // Direct lh3.../d/... links are 'attachment' only.
            // Downgraded from w2048 to w1200 to fix "heavy" loading/lag issues reported by user.
            const url = `https://drive.google.com/thumbnail?id=${file.id}&sz=w1200`;

            return {
                event_id: eventId,
                url: url,
                name: file.name,
                width: 1200, // Placeholder
                height: 1800
            };
        });

        const { error } = await supabase.from('photos').insert(photosToInsert);
        if (error) return { success: false, error: error.message };
    }

    return { success: true, count: files.length };
}
