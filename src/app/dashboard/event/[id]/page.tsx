import { createClient } from "@/lib/supabase-server";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Cloud, ExternalLink, Image as ImageIcon, RefreshCw } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import Image from "next/image";
import { ClientLinkCopy } from "@/components/client-link-copy";
import { SyncDriveButton } from "@/components/sync-drive-button";
import { DeleteEventButton } from "@/components/delete-event-button";

export const dynamic = 'force-dynamic';

export default async function EventDetailPage({ params }: { params: { id: string } }) {
    const supabase = await createClient();
    const { id } = await params;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    // Fetch Event
    const { data: event, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !event) {
        return <div className="p-8">Event not found</div>;
    }

    // Fetch Photos
    const { data: photos } = await supabase
        .from('photos')
        .select('*')
        .eq('event_id', id)
        .order('created_at', { ascending: false });

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <Link href="/dashboard" className="flex items-center text-sm font-medium text-gray-500 hover:text-black dark:hover:text-white transition mb-2">
                        <ArrowLeft size={16} className="mr-1" /> Back to Overview
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        {event.name}
                        <span className="px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 text-xs font-bold">#{event.slug}</span>
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <ClientLinkCopy slug={event.slug} />
                    <DeleteEventButton eventId={id} />
                </div>
            </div>

            {/* Google Drive Sync Section */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center">
                            <Cloud size={20} />
                        </div>
                        <div>
                            <h2 className="font-bold text-lg">Google Drive Source</h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-sm">{event.drive_link || "No link set"}</p>
                        </div>
                    </div>

                    <SyncDriveButton eventId={id} driveLink={event.drive_link} />
                </div>
            </div>

            {/* Photo Grid */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <ImageIcon size={20} /> Gallery Photos ({photos?.length || 0})
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {photos?.map((photo: any) => (
                        <div key={photo.id} className="relative aspect-[3/4] bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden group shadow-sm hover:shadow-lg transition-shadow">
                            <Image
                                src={photo.url}
                                alt="photo"
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 50vw, 20vw"
                            />
                        </div>
                    ))}

                    {(!photos || photos.length === 0) && (
                        <div className="col-span-full py-16 text-center text-gray-400 border-2 border-dashed rounded-2xl bg-white dark:bg-gray-900">
                            <Cloud size={40} className="mx-auto mb-3 opacity-50" />
                            <p className="font-medium">No photos synced yet.</p>
                            <p className="text-sm">Click "Sync from Drive" to import your photos.</p>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}
