import { createClient } from "@/lib/supabase-server";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, FolderOpen, Calendar, ArrowRight, Image as ImageIcon, Crown, Lock, Sparkles, AlertTriangle, Clock } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch Profile with subscription info
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    // Check subscription status
    const now = new Date();
    const expiresAt = profile?.subscription_expires_at ? new Date(profile.subscription_expires_at) : null;
    const isSubscribed = expiresAt ? now < expiresAt : false;
    const tier = profile?.subscription_tier || 'free';

    // Calculate days until expiration
    let daysUntilExpiry = 0;
    let isExpiringSoon = false;
    let isExpired = false;

    if (expiresAt) {
        const diffTime = expiresAt.getTime() - now.getTime();
        daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        isExpiringSoon = daysUntilExpiry > 0 && daysUntilExpiry <= 7;
        isExpired = daysUntilExpiry <= 0;
    }

    // Fetch Events with count of photos
    const { data: events } = await supabase
        .from('events')
        .select(`
            *,
            photos:photos(count)
        `)
        .eq('photographer_id', user.id)
        .order('created_at', { ascending: false });

    return (
        <div className="min-h-screen">

            {/* Expired Subscription Banner (RED) */}
            {isExpired && expiresAt && (
                <div className="bg-gradient-to-r from-red-600 to-rose-600 text-white px-6 py-4">
                    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                <AlertTriangle size={20} />
                            </div>
                            <div>
                                <p className="font-semibold">Subscription Expired</p>
                                <p className="text-sm text-white/80">Your subscription ended on {expiresAt.toLocaleDateString()}. Renew to continue creating events.</p>
                            </div>
                        </div>
                        <Link href="/pricing">
                            <Button className="bg-white text-red-600 hover:bg-gray-100 rounded-full px-6">
                                Renew Now <ArrowRight size={16} className="ml-2" />
                            </Button>
                        </Link>
                    </div>
                </div>
            )}

            {/* Expiring Soon Warning Banner (ORANGE) */}
            {isExpiringSoon && !isExpired && (
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-4">
                    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                <Clock size={20} />
                            </div>
                            <div>
                                <p className="font-semibold">Subscription Expiring Soon</p>
                                <p className="text-sm text-white/90">
                                    Your subscription will expire in <strong>{daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''}</strong>. Renew now to avoid interruption.
                                </p>
                            </div>
                        </div>
                        <Link href="/pricing">
                            <Button className="bg-white text-orange-600 hover:bg-gray-100 rounded-full px-6">
                                Extend Now <ArrowRight size={16} className="ml-2" />
                            </Button>
                        </Link>
                    </div>
                </div>
            )}

            {/* New User / Never Subscribed Banner (PURPLE) */}
            {!expiresAt && (
                <div className="bg-gradient-to-r from-purple-600/90 to-pink-600/90 text-white px-6 py-4">
                    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                <Sparkles size={20} />
                            </div>
                            <div>
                                <p className="font-semibold">Unlock Full Access</p>
                                <p className="text-sm text-white/80">Subscribe to create unlimited galleries for your clients</p>
                            </div>
                        </div>
                        <Link href="/pricing">
                            <Button className="bg-white text-purple-600 hover:bg-gray-100 rounded-full px-6">
                                View Plans <ArrowRight size={16} className="ml-2" />
                            </Button>
                        </Link>
                    </div>
                </div>
            )}

            <div className="p-8 space-y-8 animate-in fade-in duration-500">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Overview</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Welcome back, {profile?.email?.split('@')[0] || 'Photographer'}. Here is what's happening with your galleries.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {isSubscribed && (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 text-purple-600 dark:text-purple-400 text-sm font-medium">
                                <Crown size={14} />
                                {tier.charAt(0).toUpperCase() + tier.slice(1)}
                            </div>
                        )}

                        {/* Locked/Unlocked New Event Button */}
                        {isSubscribed ? (
                            <Button asChild size="lg" className="rounded-full shadow-lg shadow-blue-500/20">
                                <Link href="/dashboard/create">
                                    <Plus className="mr-2" size={18} /> New Event
                                </Link>
                            </Button>
                        ) : (
                            <Link href="/pricing">
                                <Button size="lg" className="rounded-full bg-gray-200 dark:bg-gray-800 text-gray-500 hover:bg-gray-300 dark:hover:bg-gray-700 cursor-pointer">
                                    <Lock className="mr-2" size={16} /> New Event
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border dark:border-gray-800 shadow-sm">
                        <h3 className="text-sm font-medium text-gray-500">Total Events</h3>
                        <div className="text-3xl font-bold mt-2">{events?.length || 0}</div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border dark:border-gray-800 shadow-sm">
                        <h3 className="text-sm font-medium text-gray-500">Events Remaining</h3>
                        <div className="text-3xl font-bold mt-2">{isSubscribed ? (profile?.events_remaining || '∞') : '0'}</div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border dark:border-gray-800 shadow-sm">
                        <h3 className="text-sm font-medium text-gray-500">Subscription</h3>
                        <div className="text-lg font-bold mt-2">
                            {isSubscribed ? (
                                <span className={isExpiringSoon ? "text-orange-500" : "text-green-600"}>
                                    {isExpiringSoon
                                        ? `Expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}`
                                        : `Active until ${expiresAt?.toLocaleDateString()}`
                                    }
                                </span>
                            ) : isExpired ? (
                                <span className="text-red-500">Expired</span>
                            ) : (
                                <Link href="/pricing" className="text-purple-600 hover:underline flex items-center gap-1">
                                    Upgrade Now <ArrowRight size={14} />
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-bold tracking-tight">Recent Events</h2>

                    {/* Empty State */}
                    {(!events || events.length === 0) && (
                        <div className="text-center py-24 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900/50">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                <FolderOpen size={32} />
                            </div>
                            <h3 className="text-lg font-medium">No events yet</h3>
                            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                                {isSubscribed
                                    ? "Create your first event gallery to start sharing photos with clients."
                                    : "Subscribe to start creating beautiful galleries for your clients."
                                }
                            </p>
                            {isSubscribed ? (
                                <Button asChild variant="outline">
                                    <Link href="/dashboard/create">Create Event</Link>
                                </Button>
                            ) : (
                                <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                                    <Link href="/pricing">
                                        <Sparkles size={16} className="mr-2" /> View Plans
                                    </Link>
                                </Button>
                            )}
                        </div>
                    )}

                    {/* Event Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {events?.map(event => (
                            <Link href={`/dashboard/event/${event.id}`} key={event.id} className="group relative block h-full">
                                <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col justify-between">

                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md">
                                                {event.name.substring(0, 1).toUpperCase()}
                                            </div>
                                            <div className="px-2.5 py-1 rounded-full bg-green-50 dark:bg-green-900/20 text-xs text-green-600 font-bold border border-green-100 dark:border-green-800">
                                                Active
                                            </div>
                                        </div>

                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-blue-600 transition truncate">
                                            {event.name}
                                        </h3>
                                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-4">
                                            <span className="flex items-center gap-1">
                                                <Calendar size={14} className="text-gray-400" />
                                                {new Date(event.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-4 border-t dark:border-gray-800 flex justify-between items-center text-sm">
                                        <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 font-medium">
                                            <ImageIcon size={14} /> {event.photos[0]?.count || 0} Photos
                                        </span>
                                        <span className="text-blue-600 group-hover:translate-x-1 transition-transform inline-flex items-center text-xs font-bold uppercase tracking-wider">
                                            Open <ArrowRight size={12} className="ml-1" />
                                        </span>
                                    </div>

                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
