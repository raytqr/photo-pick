"use client";

import { useState, useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { toggleEventStatus } from "@/actions/event-actions";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface EventStatusToggleProps {
    eventId: string;
    initialStatus: boolean;
}

export function EventStatusToggle({ eventId, initialStatus }: EventStatusToggleProps) {
    const [isActive, setIsActive] = useState(initialStatus);
    const [isPending, startTransition] = useTransition();

    const handleToggle = (checked: boolean) => {
        // Optimistic update
        setIsActive(checked);

        startTransition(async () => {
            const result = await toggleEventStatus(eventId, checked);
            if (!result.success) {
                // Revert on failure
                setIsActive(!checked);
                toast.error("Failed to update status");
                console.error(result.error);
            } else {
                toast.success(checked ? "Event activated" : "Event deactivated");
            }
        });
    };

    return (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            {isPending && <Loader2 size={14} className="animate-spin text-gray-500" />}
            <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${isActive ? 'text-green-400' : 'text-gray-500'}`}>
                {isActive ? 'Active' : 'Inactive'}
            </span>
            <Switch
                checked={isActive}
                onCheckedChange={handleToggle}
                disabled={isPending}
                className="data-[state=checked]:bg-green-500"
            />
        </div>
    );
}
