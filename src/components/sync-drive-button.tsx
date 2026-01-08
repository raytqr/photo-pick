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

        // Warning for data replacement
        if (!confirm("⚠️ This will DELETE current photos and re-import them from Drive to ensure everything is up to date.\n\nContinue?")) {
            return;
        }

        setLoading(true);

        // Use reSyncPhotosFromDrive to clean old data and fetch fresh
        const result = await reSyncPhotosFromDrive(eventId, driveLink);

        if (result.success) {
            alert(`Sync Complete! ${result.count} photos imported.`);
            router.refresh();
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
