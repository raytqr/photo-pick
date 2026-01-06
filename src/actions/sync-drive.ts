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

export async function syncPhotosFromDrive(eventId: string, driveFolderUrl: string) {
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

        // Fetch ALL files using pagination (Google limits to 1000 per page max)
        while (true) {
            const url: string = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+(mimeType+contains+'image/')&fields=nextPageToken,files(id,name,mimeType,thumbnailLink)&pageSize=1000&key=${apiKey}${pageToken ? `&pageToken=${pageToken}` : ''}`;

            const res: Response = await fetch(url);
            const json: { files?: DriveFile[]; nextPageToken?: string; error?: { message?: string } } = await res.json();

            if (json.error) {
                return { success: false, error: json.error.message || "Failed to fetch from Google Drive." };
            }

            allFiles = allFiles.concat(json.files || []);
            pageToken = json.nextPageToken;

            if (!pageToken) break;
        }

        if (allFiles.length === 0) {
            return { success: false, error: "No images found in the folder. Make sure it's public." };
        }

        // Prepare records for insertion
        const photosToInsert = allFiles.map(file => {
            // Use high-res thumbnail. Default is small, so we replace size.
            const highResUrl = file.thumbnailLink?.replace(/=s\d+/, '=s2000') ||
                `https://lh3.googleusercontent.com/d/${file.id}=s2000`;

            return {
                event_id: eventId,
                url: highResUrl,
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

