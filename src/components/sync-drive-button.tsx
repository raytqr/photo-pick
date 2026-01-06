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

    return (
        <Button onClick={handleSync} disabled={loading || !driveLink} className="gap-2 rounded-full shadow-md">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            {loading ? "Syncing..." : "Sync from Drive"}
        </Button>
    );
}
