"use server";

import { createClient } from "@/lib/supabase-server";

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
    // 1. SECURITY CHECK: Verify Ownership FIRST
    const isOwner = await verifyEventOwnership(eventId);
    if (!isOwner) {
        return { success: false, error: "Unauthorized: You do not own this event." };
    }

    const supabase = await createClient();
    const apiKey = process.env.GOOGLE_API_KEY;

    if (!apiKey) {
        return { success: false, error: "Google API Key is not configured. Contact admin." };
    }

    const folderId = extractFolderId(driveFolderUrl);
    if (!folderId) {
        return { success: false, error: "Invalid Google Drive folder link." };
    }

    try {
        let allFiles: DriveFile[] = [];
        let pageToken: string | undefined = undefined;
        let pageCount = 0;
        const MAX_PAGES = 50; // Safety break: Max ~50,000 files

        // Fetch ALL files using pagination (Google limits to 1000 per page max)
        while (true) {
            if (pageCount >= MAX_PAGES) {
                console.warn(`Sync stopped after ${MAX_PAGES} pages (possible safety break).`);
                break;
            }

            const url: string = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+(mimeType+contains+'image/')&fields=nextPageToken,files(id,name,mimeType,thumbnailLink)&pageSize=1000&key=${apiKey}${pageToken ? `&pageToken=${pageToken}` : ''}`;

            const res: Response = await fetch(url);
            const json: { files?: DriveFile[]; nextPageToken?: string; error?: { message?: string } } = await res.json();

            if (json.error) {
                return { success: false, error: json.error.message || "Failed to fetch from Google Drive." };
            }

            allFiles = allFiles.concat(json.files || []);
            pageToken = json.nextPageToken;
            pageCount++;

            if (!pageToken) break;
        }

        if (allFiles.length === 0) {
            return { success: false, error: "No images found in the folder. Make sure it's public." };
        }

        // Prepare records for insertion
        const photosToInsert = allFiles.map(file => {
            // Use permanent Google image URL format that doesn't expire
            // Format: https://lh3.googleusercontent.com/d/{FILE_ID}
            // Or: https://drive.google.com/uc?export=view&id={FILE_ID}
            const permanentUrl = `https://drive.google.com/thumbnail?id=${file.id}&sz=w2000`;

            return {
                event_id: eventId,
                url: permanentUrl,
                name: file.name, // Original filename from Google Drive
                width: 1200,
                height: 1800
            };
        });

        // Insert into Supabase
        const { error: insertError } = await supabase.from('photos').insert(photosToInsert);

        if (insertError) {
            return { success: false, error: insertError.message };
        }

        return { success: true, count: photosToInsert.length };

    } catch (err: any) {
        return { success: false, error: err.message || "An unknown error occurred." };
    }
}

// Re-sync: Delete existing photos and import fresh ones with permanent URLs
export async function reSyncPhotosFromDrive(eventId: string, driveFolderUrl: string) {
    // 1. SECURITY CHECK: Verify Ownership FIRST
    const isOwner = await verifyEventOwnership(eventId);
    if (!isOwner) {
        return { success: false, error: "Unauthorized: You do not own this event." };
    }

    const supabase = await createClient();

    // First, delete all existing photos for this event
    const { error: deleteError } = await supabase
        .from('photos')
        .delete()
        .eq('event_id', eventId);

    if (deleteError) {
        return { success: false, error: `Failed to clear old photos: ${deleteError.message}` };
    }

    // Then sync fresh photos (ownership check is redundant but safe)
    return syncPhotosFromDrive(eventId, driveFolderUrl);
}
