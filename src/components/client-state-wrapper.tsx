"use client";

import { useEffect, useRef } from "react";
import { useAppStore, Photo } from "@/store/useAppStore";

interface ClientStateWrapperProps {
    photos: Photo[];
    eventDetails: {
        eventName: string;
        driveLink: string;
        photoLimit: number;
        whatsappNumber: string;
        logoUrl: string | null;
        bio: string;
    };
    children: React.ReactNode;
}

export function ClientStateWrapper({ photos, eventDetails, children }: ClientStateWrapperProps) {
    const initialized = useRef(false);
    const initializeRealData = useAppStore(state => state.initializeRealData);

    useEffect(() => {
        if (!initialized.current) {
            initializeRealData(photos, eventDetails);
            initialized.current = true;
        }
    }, [photos, eventDetails, initializeRealData]);

    // Optional: Show loading state until store matches? 
    // Since initializeRealData is synchronous in Zustand, it should be fine.

    return <>{children}</>;
}
