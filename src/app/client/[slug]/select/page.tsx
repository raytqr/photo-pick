import { createClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import { ClientStateWrapper } from "@/components/client-state-wrapper";
import { ClientSelectionApp } from "@/components/client-selection-app";
import { Photo } from "@/store/useAppStore";

export const dynamic = 'force-dynamic';

export default async function ClientSelectPage({ params }: { params: { slug: string } }) {
    const supabase = await createClient();
    const { slug } = await params;

    // 1. Fetch Event with Profile (including WhatsApp)
    const { data: event, error } = await supabase
        .from('events')
        .select(`
        *,
        profiles:photographer_id (
            logo_url,
            bio,
            whatsapp_number
        )
    `)
        .eq('slug', slug)
        .single();

    if (error || !event) {
        return notFound();
    }

    // 2. Fetch Photos
    const { data: photosData } = await supabase
        .from('photos')
        .select('*')
        .eq('event_id', event.id)
        .order('created_at', { ascending: false });

    // Transform DB photos to AppState Photos
    const photos: Photo[] = photosData?.map((p: any) => ({
        id: p.id,
        url: p.url,
        name: p.name,
        width: p.width,
        height: p.height
    })) || [];

    // Prepare Event Details - WhatsApp now comes from PROFILE
    const profile = event.profiles;
    const eventDetails = {
        eventName: event.name,
        driveLink: event.drive_link || '',
        photoLimit: event.photo_limit || 50,
        whatsappNumber: profile?.whatsapp_number || '', // From profile, not event
        logoUrl: profile?.logo_url || null,
        bio: profile?.bio || '',
    };

    return (
        <ClientStateWrapper photos={photos} eventDetails={eventDetails}>
            <ClientSelectionApp />
        </ClientStateWrapper>
    );
}
