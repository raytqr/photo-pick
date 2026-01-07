import { createClient } from "@/lib/supabase-server";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Cloud, Image as ImageIcon, Hash, Copy, Check, MessageSquare, ChevronRight, Calendar } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import Image from "next/image";
import { ClientLinkCopy } from "@/components/client-link-copy";
import { SyncDriveButton } from "@/components/sync-drive-button";

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
        return <div className="p-8 text-white">Event not found</div>;
    }

    // Fetch Photos
    const { data: photos } = await supabase
        .from('photos')
        .select('*')
        .eq('event_id', id)
        .order('created_at', { ascending: false });

    // Fetch Submissions (if table exists)
    let submissions: any[] = [];
    try {
        const { data } = await supabase
            .from('submissions')
            .select('*')
            .eq('event_id', id)
            .order('submitted_at', { ascending: false });
        submissions = data || [];
    } catch (e) {
        // Table might not exist yet
    }

    const createdDate = new Date(event.created_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    return (
        <div className="min-h-screen bg-[#030014] text-white p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 animate-in fade-in duration-500">

            {/* Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-purple-900/10 blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-blue-900/10 blur-[120px]" />
            </div>

            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <Link href="/dashboard" className="flex items-center text-sm font-medium text-gray-500 hover:text-white transition mb-2">
                        <ArrowLeft size={16} className="mr-1" /> Back to Overview
                    </Link>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex flex-wrap items-center gap-3">
                        {event.name}
                        <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold">#{event.slug}</span>
                    </h1>
                    <p className="text-gray-500 text-sm mt-1 flex items-center gap-2">
                        <Calendar size={14} /> Created {createdDate}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <ClientLinkCopy slug={event.slug} />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="glass rounded-2xl p-4 border-white/5">
                    <p className="text-gray-500 text-xs font-medium mb-1">Photos</p>
                    <p className="text-2xl font-bold">{photos?.length || 0}</p>
                </div>
                <div className="glass rounded-2xl p-4 border-white/5">
                    <p className="text-gray-500 text-xs font-medium mb-1">Limit</p>
                    <p className="text-2xl font-bold">{event.photo_limit || 50}</p>
                </div>
                <div className="glass rounded-2xl p-4 border-white/5">
                    <p className="text-gray-500 text-xs font-medium mb-1">Submissions</p>
                    <p className="text-2xl font-bold text-purple-400">{submissions.length}</p>
                </div>
                <div className="glass rounded-2xl p-4 border-white/5">
                    <p className="text-gray-500 text-xs font-medium mb-1">WhatsApp</p>
                    <p className="text-sm font-medium truncate">{event.whatsapp_number || '-'}</p>
                </div>
            </div>

            {/* Google Drive Sync Section */}
            <div className="glass rounded-2xl p-4 sm:p-6 border-white/5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                            <Cloud size={20} />
                        </div>
                        <div>
                            <h2 className="font-bold">Google Drive Source</h2>
                            <p className="text-sm text-gray-500 truncate max-w-[200px] sm:max-w-sm">{event.drive_link || "No link set"}</p>
                        </div>
                    </div>

                    <SyncDriveButton eventId={id} driveLink={event.drive_link} />
                </div>
            </div>

            {/* Submission Codes Section */}
            {submissions.length > 0 && (
                <div className="glass rounded-2xl p-4 sm:p-6 border-white/5 space-y-4">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <MessageSquare size={20} className="text-purple-400" />
                        Client Submissions ({submissions.length})
                    </h2>

                    <div className="space-y-3">
                        {submissions.map((sub: any) => (
                            <div key={sub.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                                    <div className="flex items-center gap-2">
                                        <Hash size={16} className="text-purple-400" />
                                        <span className="font-mono font-bold text-purple-300">{sub.submission_code}</span>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        {new Date(sub.submitted_at).toLocaleString('id-ID')}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                                    {sub.super_liked_photos?.length > 0 && (
                                        <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
                                            <p className="text-blue-400 font-medium text-xs mb-1">⭐ Super Like</p>
                                            <p className="text-white font-bold">{sub.super_liked_photos.length} photos</p>
                                        </div>
                                    )}
                                    <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/20">
                                        <p className="text-green-400 font-medium text-xs mb-1">✅ Selected</p>
                                        <p className="text-white font-bold">{sub.selected_photos?.length || 0} photos</p>
                                    </div>
                                    {sub.maybe_photos?.length > 0 && (
                                        <div className="bg-yellow-500/10 rounded-lg p-3 border border-yellow-500/20">
                                            <p className="text-yellow-400 font-medium text-xs mb-1">🤔 Maybe</p>
                                            <p className="text-white font-bold">{sub.maybe_photos.length} photos</p>
                                        </div>
                                    )}
                                </div>

                                {/* Photo Names Preview */}
                                <details className="mt-3">
                                    <summary className="text-xs text-gray-400 cursor-pointer hover:text-white">
                                        View photo filenames
                                    </summary>
                                    <div className="mt-2 bg-black/30 rounded-lg p-3 text-xs font-mono text-gray-400 max-h-32 overflow-y-auto">
                                        {[...(sub.super_liked_photos || []), ...(sub.selected_photos || [])].join('\n')}
                                    </div>
                                </details>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty Submissions State */}
            {submissions.length === 0 && (
                <div className="glass rounded-2xl p-6 border-white/5 text-center">
                    <MessageSquare size={32} className="mx-auto mb-3 text-gray-600" />
                    <p className="text-gray-400 font-medium">No client submissions yet</p>
                    <p className="text-gray-600 text-sm">Submissions will appear here when clients send their selections.</p>
                </div>
            )}

            {/* Photo Grid */}
            <div className="space-y-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                    <ImageIcon size={20} /> Gallery Photos ({photos?.length || 0})
                </h2>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3">
                    {photos?.map((photo: any) => (
                        <div key={photo.id} className="relative aspect-[3/4] bg-gray-900 rounded-xl overflow-hidden group ring-1 ring-white/10">
                            <Image
                                src={photo.url}
                                alt={photo.name || "photo"}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 16vw"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-[10px] text-white/80 truncate">{photo.name}</p>
                            </div>
                        </div>
                    ))}

                    {(!photos || photos.length === 0) && (
                        <div className="col-span-full py-16 text-center text-gray-500 border-2 border-dashed border-gray-800 rounded-2xl bg-gray-900/50">
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
