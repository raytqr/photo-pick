"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { isRestricted, getPlanLimits, PLAN_LIMITS } from "@/lib/subscription-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Cloud, Sparkles, Lock, Crown, AlertTriangle, Check, X, Loader2, Eye, EyeOff, Shield } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { checkSlugAvailability } from "@/actions/check-slug";

export default function CreateEventPage() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(true);
    const [hasSubscription, setHasSubscription] = useState(false);
    const [eventsCount, setEventsCount] = useState(0);
    const [tierLimits, setTierLimits] = useState<typeof PLAN_LIMITS['free']>(PLAN_LIMITS['free']);
    const [subscriptionTier, setSubscriptionTier] = useState<string | null>(null);

    // Form State
    const [name, setName] = useState("");
    const [driveLink, setDriveLink] = useState("");
    const [photoLimit, setPhotoLimit] = useState("50");
    const [slug, setSlug] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    // URL Availability State
    const [slugChecking, setSlugChecking] = useState(false);
    const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
    const [slugError, setSlugError] = useState<string | null>(null);

    // Check subscription status & limits
    useEffect(() => {
        const checkSubscription = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
                return;
            }

            // 1. Get Profile & Subscription
            const { data: profile } = await supabase
                .from('profiles')
                .select('subscription_expires_at, subscription_tier')
                .eq('id', user.id)
                .single();

            if (profile) {
                const restricted = isRestricted(profile.subscription_tier, profile.subscription_expires_at);
                if (restricted) {
                    router.push("/dashboard/pricing");
                    return;
                }
                setHasSubscription(true);
                setSubscriptionTier(profile.subscription_tier);

                // 2. Get Limits
                const limits = getPlanLimits(profile.subscription_tier);
                setTierLimits(limits);

                // Adjust default photo limit if current value exceeds new limit
                if (parseInt(photoLimit) > limits.maxPhotos) {
                    setPhotoLimit(limits.maxPhotos.toString());
                }

                // 3. Check Event Count (Current Month)
                const now = new Date();
                const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

                const { count } = await supabase
                    .from('events')
                    .select('*', { count: 'exact', head: true })
                    .eq('photographer_id', user.id)
                    .gte('created_at', firstDayOfMonth);

                setEventsCount(count || 0);

            } else {
                setHasSubscription(false);
                router.push("/dashboard/pricing");
                return;
            }
            setChecking(false);
        };

        checkSubscription();
    }, [supabase, router]);

    // Check slug availability
    const handleCheckSlug = async () => {
        if (!slug || slug.trim() === "") {
            setSlugError("Please enter a URL slug first");
            setSlugAvailable(null);
            return;
        }

        if (!/^[a-z0-9-]+$/.test(slug)) {
            setSlugError("Invalid format. Use lowercase letters, numbers, and hyphens only.");
            setSlugAvailable(false);
            return;
        }

        setSlugChecking(true);
        setSlugError(null);
        setSlugAvailable(null);

        try {
            const result = await checkSlugAvailability(slug);
            setSlugAvailable(result.available);
            if (!result.available && result.error) {
                setSlugError(result.error);
            }
        } catch (err) {
            setSlugError("Failed to check availability");
            setSlugAvailable(false);
        } finally {
            setSlugChecking(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // If slug is provided but not checked/available, prevent submission
        if (slug && slugAvailable !== true) {
            setSlugError("Please check URL availability first");
            return;
        }

        setLoading(true);

        try {
            // Import Server Action (dynamically or at top level)
            const { createEvent } = await import('@/actions/create-event');

            const result = await createEvent({
                name,
                slug,
                driveLink,
                photoLimit: parseInt(photoLimit),
                password: password.trim() || null,
            });

            if (!result.success) {
                alert(result.error);
                return;
            }

            // Show sync feedback if applicable
            if (result.syncResult) {
                if (result.syncResult.success && 'count' in result.syncResult) {
                    console.log(`Auto-sync complete: ${result.syncResult.count} photos imported`);
                } else if (!result.syncResult.success) {
                    console.warn(`Auto-sync warning: ${result.syncResult.error}`);
                }
            }

            // Success redirect
            if (result.eventId) {
                router.push(`/dashboard/event/${result.eventId}`);
                router.refresh(); // Refresh to update limits in navbar/sidebar
            }

        } catch (err: any) {
            alert(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    if (checking) {
        return (
            <div className="min-h-screen bg-[#030014] flex items-center justify-center">
                <div className="text-gray-400">Loading...</div>
            </div>
        );
    }

    // Subscription Wall (Already handled by redirect, but double check)
    if (!hasSubscription) return null;

    // Limit Wall
    if (eventsCount >= tierLimits.maxEvents) {
        return (
            <div className="min-h-screen bg-[#030014] text-white flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full text-center"
                >
                    <div className="glass rounded-[40px] p-10 border-white/10">
                        <div className="w-20 h-20 mx-auto rounded-full bg-amber-500/20 flex items-center justify-center mb-8 border border-amber-500/30">
                            <AlertTriangle size={40} className="text-amber-400" />
                        </div>

                        <h2 className="text-3xl font-black mb-4">Monthly Limit Reached</h2>
                        <p className="text-gray-400 mb-8">
                            You've used <strong>{eventsCount} / {tierLimits.maxEvents}</strong> events for this month.
                            Upgrade your plan to keep creating.
                        </p>

                        <Link href="/dashboard/pricing">
                            <Button className="w-full h-14 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 font-bold text-lg hover:scale-105 transition-all">
                                <Crown className="mr-2" size={20} /> Upgrade Plan
                            </Button>
                        </Link>

                        <Link href="/dashboard" className="block mt-6 text-sm text-gray-500 hover:text-white transition-colors">
                            ← Back to Dashboard
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#030014] text-white">
            <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                <div className="flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center text-sm font-medium text-gray-500 hover:text-white transition">
                        <ArrowLeft size={16} className="mr-1" /> Back to Overview
                    </Link>
                    <div className="text-xs font-bold px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400">
                        {eventsCount} / {tierLimits.maxEvents === Infinity ? '∞' : tierLimits.maxEvents} Events used
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-black tracking-tight">Create New Gallery</h1>
                    <p className="text-gray-500">Set up the details for your photo selection event.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Event Basics */}
                    <div className="glass rounded-[32px] p-6 space-y-6 border-white/5">
                        <h2 className="font-bold flex items-center gap-2 text-lg">
                            <Sparkles size={18} className="text-amber-400" /> Event Details
                        </h2>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Event Name</label>
                            <Input
                                placeholder="e.g. Wedding of Sarah & Dimas"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="h-14 bg-white/5 border-white/10 rounded-2xl px-6 text-white placeholder:text-gray-600"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">URL Slug</label>
                                <div className="flex gap-2">
                                    <div className="flex flex-1">
                                        <span className="inline-flex items-center px-4 rounded-l-2xl border border-r-0 border-white/10 bg-white/5 text-gray-500 text-sm">
                                            /client/
                                        </span>
                                        <Input
                                            placeholder="wedding-sarah-dimas"
                                            value={slug}
                                            onChange={(e) => {
                                                const val = e.target.value.toLowerCase();
                                                setSlug(val);
                                                // Reset availability when slug changes
                                                setSlugAvailable(null);
                                                setSlugError(null);
                                            }}
                                            className={`rounded-l-none h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-600 ${slugAvailable === false ? "border-red-500 focus-visible:ring-red-500" :
                                                slugAvailable === true ? "border-green-500 focus-visible:ring-green-500" :
                                                    slug && !/^[a-z0-9-]+$/.test(slug) ? "border-red-500 focus-visible:ring-red-500" : ""
                                                }`}
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        onClick={handleCheckSlug}
                                        disabled={slugChecking || !slug || !/^[a-z0-9-]+$/.test(slug)}
                                        className={`h-12 px-4 rounded-2xl font-semibold transition-all ${slugAvailable === true
                                            ? "bg-green-600 hover:bg-green-700"
                                            : slugAvailable === false
                                                ? "bg-red-600 hover:bg-red-700"
                                                : "bg-white/10 hover:bg-white/20"
                                            }`}
                                    >
                                        {slugChecking ? (
                                            <Loader2 size={18} className="animate-spin" />
                                        ) : slugAvailable === true ? (
                                            <Check size={18} />
                                        ) : slugAvailable === false ? (
                                            <X size={18} />
                                        ) : (
                                            "Check"
                                        )}
                                    </Button>
                                </div>
                                {slugError ? (
                                    <p className="text-xs text-red-500 animate-pulse">
                                        {slugError}
                                    </p>
                                ) : slugAvailable === true ? (
                                    <p className="text-xs text-green-500">
                                        ✓ This URL is available!
                                    </p>
                                ) : slug && !/^[a-z0-9-]+$/.test(slug) ? (
                                    <p className="text-xs text-red-500 animate-pulse">
                                        Format invalid: use lowercase letters, numbers, and hyphens only.
                                    </p>
                                ) : (
                                    <p className="text-xs text-gray-500">Leave blank to auto-generate, or enter a custom URL and click Check.</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">Photo Limit</label>
                                <Input
                                    type="number"
                                    value={photoLimit}
                                    onChange={(e) => setPhotoLimit(e.target.value)}
                                    max={tierLimits.maxPhotos}
                                    required
                                    className="h-14 bg-white/5 border-white/10 rounded-2xl px-6 text-white placeholder:text-gray-600"
                                />
                                <p className="text-xs text-gray-500">
                                    Max {tierLimits.maxPhotos === Infinity ? 'Unlimited' : tierLimits.maxPhotos} photos allowed on your plan.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Google Drive Section */}
                    <div className="glass rounded-[32px] p-6 space-y-4 border-blue-500/20 bg-blue-500/5">
                        <h2 className="font-bold text-blue-300 flex items-center gap-2 text-lg">
                            <Cloud size={18} /> Google Drive Source
                        </h2>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-blue-300">Public Folder Link</label>
                            <Input
                                placeholder="https://drive.google.com/drive/folders/..."
                                value={driveLink}
                                onChange={(e) => setDriveLink(e.target.value)}
                                className="h-14 bg-white/5 border-blue-500/20 rounded-2xl px-6 text-white placeholder:text-gray-600"
                            />
                            <p className="text-xs text-blue-400">
                                Ensure the folder is set to <strong>"Anyone with the link"</strong>.
                            </p>
                        </div>
                    </div>

                    {/* Password Protection Section */}
                    <div className="glass rounded-[32px] p-6 space-y-4 border-green-500/20 bg-green-500/5">
                        <h2 className="font-bold text-green-300 flex items-center gap-2 text-lg">
                            <Shield size={18} /> Password Protection (Optional)
                        </h2>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-green-300">Event Password</label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Leave empty for no password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-14 bg-white/5 border-green-500/20 rounded-2xl px-6 pr-12 text-white placeholder:text-gray-600"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            <p className="text-xs text-green-400">
                                {password ? "🔐 Client will need this password to access the gallery." : "Leave empty if you don't need password protection."}
                            </p>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={loading || (slug.length > 0 && (!/^[a-z0-9-]+$/.test(slug) || slugAvailable !== true))}
                        className="w-full h-14 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 font-bold text-lg hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
                    >
                        {loading ? "Creating..." : "Create Event"}
                    </Button>
                    {slug && slugAvailable !== true && slugAvailable !== null && (
                        <p className="text-center text-sm text-amber-400">
                            Please use a different URL or check availability first.
                        </p>
                    )}

                </form>
            </div>
        </div>
    );
}
