import { createClient } from "@/lib/supabase-server";
import { Button } from "@/components/ui/button";
import { ArrowRight, Camera } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }) {
    const supabase = await createClient();
    const { slug } = await params;

    const { data: event } = await supabase.from('events').select('name').eq('slug', slug).single();

    return {
        title: event ? `${event.name} - Photo Selection` : 'Event Not Found',
    }
}

export default async function ClientLandingPage({ params }: { params: { slug: string } }) {
    const supabase = await createClient();
    const { slug } = await params;

    // Fetch Event & Photographer Profile
    const { data: event, error } = await supabase
        .from('events')
        .select(`
        *,
        profiles:photographer_id (
            logo_url,
            bio
        )
    `)
        .eq('slug', slug)
        .single();

    if (error || !event) {
        return notFound();
    }

    const profile = event.profiles;

    return (
        <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">

            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-gray-50 to-transparent dark:from-gray-900/50 pointer-events-none" />

            {/* Branding */}
            <div className="z-10 flex flex-col items-center text-center space-y-8 max-w-md w-full animate-in fade-in zoom-in duration-700">

                <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden shadow-2xl border-4 border-white dark:border-gray-800 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    {profile?.logo_url ? (
                        <Image src={profile.logo_url} alt="Logo" fill className="object-cover" />
                    ) : (
                        <Camera size={40} className="text-gray-400" />
                    )}
                </div>

                <div className="space-y-4">
                    <h2 className="text-sm font-medium tracking-widest text-gray-500 uppercase">Gallery Selection</h2>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
                        {event.name}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto text-sm md:text-base">
                        Swipe right to keep your favorite moments.
                    </p>
                </div>

                <Button asChild size="lg" className="rounded-full h-14 px-8 text-lg shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all hover:scale-105 active:scale-95">
                    <Link href={`/client/${slug}/select`}>
                        Start Selecting <ArrowRight className="ml-2" />
                    </Link>
                </Button>
            </div>

            <div className="absolute bottom-6 text-xs text-gray-300 dark:text-gray-700">
                Powered by PhotoPick
            </div>
        </div>
    );
}
