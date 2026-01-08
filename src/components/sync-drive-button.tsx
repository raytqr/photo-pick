"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { syncPhotosFromDrive } from "@/actions/sync-drive";
import { useRouter } from "next/navigation";

interface SyncDriveButtonProps {
    eventId: string;
    driveLink: string | null;
}

import { reSyncPhotosFromDrive } from "@/actions/sync-drive";
import { RotateCcw } from "lucide-react";

// ... existing imports

export function SyncDriveButton({ eventId, driveLink }: SyncDriveButtonProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSync = async () => {
        if (!driveLink) {
            alert("No Google Drive link is set for this event. Edit the event to add one.");
            return;
        }

        setLoading(true);

        const result = await syncPhotosFromDrive(eventId, driveLink);

        if (result.success) {
            alert(`Successfully synced ${result.count} photos from Google Drive!`);
            router.refresh(); // Refresh page to show new photos
        } else {
            alert(`Sync failed: ${result.error}`);
        }

        setLoading(false);
    };

    const handleReSync = async () => {
        if (!driveLink) return;

        if (!confirm("⚠️ Force Resync will DELETE all current photos and re-import them from Drive.\n\nExisting selections might be affected if filenames changed.\n\nContinue?")) {
            return;
        }

        setLoading(true);
        const result = await reSyncPhotosFromDrive(eventId, driveLink); // Use the Force Resync action

        if (result.success) {
            alert(`Success! Re-synced ${result.count} photos.`);
            router.refresh();
        } else {
            alert(`Resync failed: ${result.error}`);
        }
        setLoading(false);
    };

    return (
        <div className="flex items-center gap-2">
            <Button onClick={handleSync} disabled={loading || !driveLink} className="gap-2 rounded-full shadow-md">
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                {loading ? "Syncing..." : "Sync from Drive"}
            </Button>

            <Button
                onClick={handleReSync}
                disabled={loading || !driveLink}
                variant="outline"
                size="icon"
                className="rounded-full w-10 h-10 border-white/10 hover:bg-white/10 hover:text-red-400"
                title="Force Resync (Delete & Re-import)"
            >
                <RotateCcw size={16} />
            </Button>
        </div>
    );
}
