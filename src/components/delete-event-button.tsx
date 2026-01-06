"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteEvent } from "@/actions/delete-event";
import { useRouter } from "next/navigation";

interface DeleteEventButtonProps {
    eventId: string;
}

export function DeleteEventButton({ eventId }: DeleteEventButtonProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        const confirmed = confirm("Are you sure you want to delete this event? All photos and selections will be permanently removed.");

        if (!confirmed) return;

        setLoading(true);

        const result = await deleteEvent(eventId);

        if (result.success) {
            alert("Event deleted successfully!");
            router.push("/dashboard");
            router.refresh();
        } else {
            alert(`Delete failed: ${result.error}`);
        }

        setLoading(false);
    };

    return (
        <Button
            onClick={handleDelete}
            disabled={loading}
            variant="outline"
            className="text-red-500 border-red-500/30 hover:bg-red-500/10 hover:text-red-600 gap-2"
        >
            <Trash2 size={16} />
            {loading ? "Deleting..." : "Delete Event"}
        </Button>
    );
}
