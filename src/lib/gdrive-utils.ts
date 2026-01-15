/**
 * Google Drive URL Utilities
 * Parse and convert GDrive links to usable thumbnail URLs
 */

/**
 * Parse various GDrive link formats to thumbnail URL
 */
export function parseGDriveLink(url: string, size: string = 'w1200'): string | null {
    if (!url) return null;

    // Format 1: https://drive.google.com/file/d/FILE_ID/view
    const fileMatch = url.match(/\/file\/d\/([^/]+)/);
    if (fileMatch) {
        return `https://drive.google.com/thumbnail?id=${fileMatch[1]}&sz=${size}`;
    }

    // Format 2: https://drive.google.com/open?id=FILE_ID
    const openMatch = url.match(/[?&]id=([^&]+)/);
    if (openMatch) {
        return `https://drive.google.com/thumbnail?id=${openMatch[1]}&sz=${size}`;
    }

    // Format 3: Already a thumbnail URL
    if (url.includes('thumbnail?id=')) {
        const idMatch = url.match(/id=([^&]+)/);
        if (idMatch) {
            return `https://drive.google.com/thumbnail?id=${idMatch[1]}&sz=${size}`;
        }
        return url;
    }

    // Format 4: https://lh3.googleusercontent.com/d/FILE_ID
    const lh3Match = url.match(/lh3\.googleusercontent\.com\/d\/([^?/]+)/);
    if (lh3Match) {
        return `https://drive.google.com/thumbnail?id=${lh3Match[1]}&sz=${size}`;
    }

    return null;
}

/**
 * Extract folder ID from GDrive folder URL
 */
export function extractFolderId(url: string): string | null {
    if (!url) return null;
    const match = url.match(/\/folders\/([^?/]+)/);
    return match ? match[1] : null;
}

/**
 * Check if URL is a GDrive folder
 */
export function isGDriveFolder(url: string): boolean {
    return url?.includes('/folders/') ?? false;
}

/**
 * Get a placeholder image URL for missing images
 */
export function getPlaceholderImage(type: 'hero' | 'about' | 'gallery'): string {
    const placeholders = {
        hero: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080"%3E%3Cdefs%3E%3ClinearGradient id="g" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%23000"%3E%3C/stop%3E%3Cstop offset="100%25" style="stop-color:%23333"%3E%3C/stop%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill="url(%23g)" width="1920" height="1080"/%3E%3C/svg%3E',
        about: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="1000"%3E%3Cdefs%3E%3ClinearGradient id="g" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%23111"%3E%3C/stop%3E%3Cstop offset="100%25" style="stop-color:%23222"%3E%3C/stop%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill="url(%23g)" width="800" height="1000"/%3E%3C/svg%3E',
        gallery: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="400"%3E%3Crect fill="%23222" width="600" height="400"/%3E%3C/svg%3E'
    };

    return placeholders[type];
}
