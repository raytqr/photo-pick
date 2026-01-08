import { createClient } from "@/lib/supabase-server";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    Plus,
    FolderOpen,
    Calendar,
    ArrowRight,
    Image as ImageIcon,
    Crown,
    Lock,
    Sparkles,
    AlertTriangle,
    Clock,
    TrendingUp,
    Layers,
    User,
    Settings,
    ChevronRight,
    Camera
} from "lucide-react";
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

    const totalEvents = events?.length || 0;
    const eventsRemaining = isSubscribed ? (profile?.events_remaining || '∞') : '0';

    return (
        <div className="text-white selection:bg-purple-500/30">

            {/* Mesh Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-purple-900/10 blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-blue-900/10 blur-[120px]" />
            </div>

            <main className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

                {/* Status Banners */}
                <div className="space-y-3">
                    {isExpired && expiresAt && (
                        <div className="glass rounded-2xl border-red-500/30 overflow-hidden">
                            <div className="bg-red-500/10 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center border border-red-500/30">
                                        <AlertTriangle className="text-red-500" size={24} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-red-100">Subscription Expired</p>
                                        <p className="text-sm text-red-400">Your pro features were disabled on {expiresAt.toLocaleDateString()}.</p>
                                    </div>
                                </div>
                                <Button asChild className="bg-red-500 hover:bg-red-600 text-white rounded-full px-8 font-bold">
                                    <Link href="/pricing">Renew Subscription</Link>
                                </Button>
                            </div>
                        </div>
                    )}

                    {isExpiringSoon && !isExpired && (
                        <div className="glass rounded-2xl border-amber-500/30 overflow-hidden">
                            <div className="bg-amber-500/10 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                                        <Clock className="text-amber-500" size={24} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-amber-100">Expiring in {daysUntilExpiry} days</p>
                                        <p className="text-sm text-amber-400">Renew now to keep your unlimited event access.</p>
                                    </div>
                                </div>
                                <Button asChild className="bg-amber-500 hover:bg-amber-600 text-black rounded-full px-8 font-bold">
                                    <Link href="/pricing">Extend Plan</Link>
                                </Button>
                            </div>
                        </div>
                    )}

                    {!expiresAt && (
                        <div className="glass rounded-2xl border-purple-500/30 overflow-hidden">
                            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                                        <Crown className="text-white" size={28} />
                                    </div>
                                    <div>
                                        <p className="text-xl font-black text-white">Go Unlimited with Pro</p>
                                        <p className="text-gray-400">Unlock custom branding, higher photo limits, and priority sync.</p>
                                    </div>
                                </div>
                                <Button asChild className="bg-white text-black hover:bg-gray-200 rounded-full px-8 h-12 font-bold shadow-xl shadow-white/5">
                                    <Link href="/pricing">Explore Plans <ArrowRight className="ml-2" size={18} /></Link>
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Dashboard Header */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border-white/5 text-[10px] font-black uppercase tracking-widest text-purple-400 mb-3">
                            <Sparkles size={12} /> Photographer Hub
                        </div>
                        <h2 className="text-4xl font-black tracking-tight text-white mb-2">Welcome Back, <span className="text-gradient">{profile?.photographer_name || profile?.email}</span></h2>
                        <p className="text-gray-500 font-medium">Manage your event galleries and client selections.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        {isSubscribed ? (
                            <Button asChild size="lg" className="rounded-2xl h-14 px-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-105 transition-all font-bold shadow-xl shadow-purple-500/20 border-none">
                                <Link href="/dashboard/create">
                                    <Plus className="mr-2" size={20} /> Create New Event
                                </Link>
                            </Button>
                        ) : (
                            <Link href="/pricing">
                                <Button size="lg" className="rounded-2xl h-14 px-8 glass border-white/10 text-gray-400 hover:text-white hover:border-purple-500/50 transition-all font-bold">
                                    <Lock className="mr-2" size={18} /> Unlock New Event
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { label: "Active Events", value: totalEvents, icon: Layers, color: "text-blue-500", bg: "bg-blue-500/10" },
                        { label: "Quota Left", value: eventsRemaining, icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-500/10" },
                        { label: "Current Tier", value: tier.toUpperCase(), icon: Crown, color: "text-amber-500", bg: "bg-amber-500/10" },
                    ].map((stat, i) => (
                        <div key={i} className="glass rounded-[32px] p-5 border-white/5 hover:border-white/10 transition-all group overflow-hidden relative">
                            <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.07] group-hover:scale-110 transition-all duration-700">
                                <stat.icon size={120} />
                            </div>
                            <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center mb-4 border border-white/5`}>
                                <stat.icon size={22} className={stat.color} />
                            </div>
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">{stat.label}</p>
                            <div className="text-3xl font-black mt-1">{stat.value}</div>
                        </div>
                    ))}
                </div>

                {/* Events Section */}
                <div className="space-y-6 pt-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-black tracking-tight">Recent Galleries</h3>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-white rounded-xl">View All</Button>
                        </div>
                    </div>

                    {/* Empty State */}
                    {(!events || events.length === 0) && (
                        <div className="relative group overflow-hidden">
                            <div className="p-20 border-2 border-dashed border-white/5 rounded-[40px] glass bg-white/[0.02] text-center">
                                <div className="w-24 h-24 bg-gradient-to-tr from-purple-500/10 to-pink-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-purple-500/20 animate-pulse">
                                    <FolderOpen size={40} className="text-purple-500" />
                                </div>
                                <h3 className="text-2xl font-black mb-4">No Galleries Found</h3>
                                <p className="text-gray-500 max-w-sm mx-auto mb-10 font-medium">
                                    Your dashboard is empty. Ready to wow your first client? 🚀
                                </p>
                                {isSubscribed ? (
                                    <Button asChild size="lg" className="rounded-full px-12 h-14 bg-white text-black hover:bg-gray-200 font-black shadow-2xl">
                                        <Link href="/dashboard/create">Launch First Event</Link>
                                    </Button>
                                ) : (
                                    <Button asChild size="lg" className="rounded-full px-12 h-14 bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-105 transition-all font-black border-none">
                                        <Link href="/pricing">Select Your Plan</Link>
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Event Cards Modern */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {events?.map(event => (
                            <Link href={`/dashboard/event/${event.id}`} key={event.id} className="group flex flex-col">
                                <div className="glass rounded-[40px] p-6 border-white/5 group-hover:border-purple-500/40 group-hover:bg-white/[0.04] transition-all duration-500 flex flex-col h-full relative overflow-hidden">

                                    {/* Background decoration */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-600/10 to-transparent blur-3xl group-hover:opacity-100 opacity-0 transition-opacity duration-500" />

                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-xl shadow-purple-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                            {event.name.substring(0, 1).toUpperCase()}
                                        </div>
                                        <div className="px-3 py-1 rounded-full bg-green-500/10 text-[10px] text-green-400 font-bold tracking-wider uppercase border border-green-500/20 group-hover:bg-green-500 group-hover:text-black transition-colors duration-500">
                                            Active
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="text-xl font-black mb-2 text-white group-hover:text-purple-400 transition-colors duration-500 truncate pr-4">
                                            {event.name}
                                        </h3>

                                        <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
                                            <span className="flex items-center gap-1.5">
                                                <Calendar size={14} className="opacity-50" />
                                                {new Date(event.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                            <span className="w-1 h-1 rounded-full bg-white/10" />
                                            <span className="flex items-center gap-1.5">
                                                <ImageIcon size={14} className="opacity-50" />
                                                {event.photos[0]?.count || 0} Photos
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-white transition-colors">Manage Gallery</p>
                                        <div className="w-8 h-8 rounded-full glass border-white/5 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                                            <ChevronRight size={16} />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Bottom Tip */}
                <div className="pt-10 flex items-center justify-center">
                    <div className="px-6 py-4 glass rounded-full border-white/5 flex items-center gap-4 group cursor-help">
                        <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
                            <Sparkles size={16} />
                        </div>
                        <p className="text-sm font-medium text-gray-400">Pro Tip: Share your gallery link directly to WhatsApp for 30% higher engagement.</p>
                        <Settings size={16} className="text-gray-600 group-hover:rotate-90 transition-transform duration-500" />
                    </div>
                </div>

            </main>
        </div>
    );
}
