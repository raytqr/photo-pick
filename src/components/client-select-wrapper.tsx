"use client";

import { useState, useEffect } from "react";
import { ClientStateWrapper } from "@/components/client-state-wrapper";
import { ClientSelectionApp } from "@/components/client-selection-app";
import { PasswordGate } from "@/components/password-gate";
import { Photo } from "@/store/useAppStore";

interface ClientSelectWrapperProps {
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
    eventPassword: string | null;
}

export function ClientSelectWrapper({ photos, eventDetails, eventPassword }: ClientSelectWrapperProps) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Check if already authenticated via sessionStorage
        const storedAuth = sessionStorage.getItem(`event-auth-${eventDetails.eventName}`);
        if (storedAuth === "true") {
            setIsAuthenticated(true);
        }
    }, [eventDetails.eventName]);

    // If no password required, show directly
    if (!eventPassword) {
        return (
            <ClientStateWrapper photos={photos} eventDetails={eventDetails}>
                <ClientSelectionApp />
            </ClientStateWrapper>
        );
    }

    // If password required but not authenticated, show gate
    if (!isAuthenticated) {
        return (
            <PasswordGate
                eventName={eventDetails.eventName}
                logoUrl={eventDetails.logoUrl}
                correctPassword={eventPassword}
                onSuccess={() => setIsAuthenticated(true)}
            />
        );
    }

    // Authenticated, show app
    return (
        <ClientStateWrapper photos={photos} eventDetails={eventDetails}>
            <ClientSelectionApp />
        </ClientStateWrapper>
    );
}
