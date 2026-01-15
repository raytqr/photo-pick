import { createClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import { ClientSelectWrapper } from "@/components/client-select-wrapper";
import { Photo } from "@/store/useAppStore";
import { Camera } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function ClientSelectPage({ params }: { params: { slug: string } }) {
    const supabase = await createClient();
    const { slug } = await params;

    // 1. Fetch Event with Profile (including WhatsApp) and password
    const { data: event, error } = await supabase
        .from('events')
        .select(`
        *,
        profiles:photographer_id (
            logo_url,
            bio,
            whatsapp_number,
            wa_header,
            wa_footer
        )
    `)
        .eq('slug', slug)
        .single();

    if (error || !event) {
        return notFound();
    }

    if (!event.is_active) {
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

    // 3. Check if photos exist - show friendly message if empty
    if (photos.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-black flex flex-col items-center justify-center p-6">
                <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center mb-6">
                    <Camera size={32} className="text-gray-400" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Foto Belum Tersedia</h1>
                <p className="text-gray-500 text-center max-w-sm">
                    Fotografer belum mengunggah foto untuk event ini. Silakan hubungi fotografer Anda.
                </p>
            </div>
        );
    }

    // Prepare Event Details - WhatsApp now comes from PROFILE
    const profile = event.profiles;
    const eventDetails = {
        eventName: event.name,
        eventSlug: slug, // For localStorage cache key
        driveLink: event.drive_link || '',
        photoLimit: event.photo_limit || 50,
        whatsappNumber: profile?.whatsapp_number || '', // From profile, not event
        waHeader: profile?.wa_header || 'Halo! Berikut pilihan foto dari client:',
        waFooter: profile?.wa_footer || 'Terima kasih telah memilih kami!',
        logoUrl: profile?.logo_url || null,
        bio: profile?.bio || '',
    };

    return (
        <ClientSelectWrapper
            photos={photos}
            eventDetails={eventDetails}
            eventPassword={event.password}
        />
    );
}
