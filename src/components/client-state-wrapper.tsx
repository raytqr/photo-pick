"use client";

import { useEffect, useRef } from "react";
import { useAppStore, Photo } from "@/store/useAppStore";

interface ClientStateWrapperProps {
    photos: Photo[];
    eventDetails: {
        eventName: string;
        eventSlug: string;
        driveLink: string;
        photoLimit: number;
        whatsappNumber: string;
        waHeader: string;
        waFooter: string;
        logoUrl: string | null;
        bio: string;
    };
    children: React.ReactNode;
}

export function ClientStateWrapper({ photos, eventDetails, children }: ClientStateWrapperProps) {
    const initialized = useRef(false);
    const initializeWithCache = useAppStore(state => state.initializeWithCache);

    useEffect(() => {
        if (!initialized.current) {
            // Use cache-aware initialization to restore selections on refresh
            initializeWithCache(photos, eventDetails);
            initialized.current = true;
        }
    }, [photos, eventDetails, initializeWithCache]);

    return <>{children}</>;
}
