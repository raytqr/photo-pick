"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Cloud, Sparkles, Lock, Crown } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function CreateEventPage() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(true);
    const [hasSubscription, setHasSubscription] = useState(false);

    // Form State
    const [name, setName] = useState("");
    const [driveLink, setDriveLink] = useState("");
    const [photoLimit, setPhotoLimit] = useState("50");
    const [slug, setSlug] = useState("");

    // Check subscription status
    useEffect(() => {
        const checkSubscription = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
                return;
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('subscription_expires_at, subscription_tier')
                .eq('id', user.id)
                .single();

            if (profile?.subscription_expires_at) {
                const expiresAt = new Date(profile.subscription_expires_at);
                const now = new Date();
                setHasSubscription(expiresAt > now);
            } else {
                setHasSubscription(false);
            }
            setChecking(false);
        };

        checkSubscription();
    }, [supabase, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const { data, error } = await supabase.from('events').insert({
                photographer_id: user.id,
                name,
                slug: slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                drive_link: driveLink,
                photo_limit: parseInt(photoLimit),
            }).select().single();

            if (error) throw error;

            router.push(`/dashboard/event/${data.id}`);
            router.refresh();

        } catch (err: any) {
            alert(err.message);
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

    // Subscription Wall
    if (!hasSubscription) {
        return (
            <div className="min-h-screen bg-[#030014] text-white flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full text-center"
                >
                    <div className="glass rounded-[40px] p-10 border-white/10">
                        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center mb-8 border border-purple-500/30">
                            <Lock size={40} className="text-purple-400" />
                        </div>

                        <h2 className="text-3xl font-black mb-4">Subscription Required</h2>
                        <p className="text-gray-400 mb-8">
                            You need an active subscription to create new events. Unlock unlimited creativity with a VibeSelect plan.
                        </p>

                        <Link href="/pricing">
                            <Button className="w-full h-14 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 font-bold text-lg hover:scale-105 transition-all">
                                <Crown className="mr-2" size={20} /> View Pricing Plans
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

                <Link href="/dashboard" className="flex items-center text-sm font-medium text-gray-500 hover:text-white transition">
                    <ArrowLeft size={16} className="mr-1" /> Back to Overview
                </Link>

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
                                <div className="flex">
                                    <span className="inline-flex items-center px-4 rounded-l-2xl border border-r-0 border-white/10 bg-white/5 text-gray-500 text-sm">
                                        /client/
                                    </span>
                                    <Input
                                        placeholder="wedding-sarah-dimas"
                                        value={slug}
                                        onChange={(e) => setSlug(e.target.value)}
                                        className="rounded-l-none h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-600"
                                    />
                                </div>
                                <p className="text-xs text-gray-500">Leave blank to auto-generate.</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">Photo Limit</label>
                                <Input
                                    type="number"
                                    value={photoLimit}
                                    onChange={(e) => setPhotoLimit(e.target.value)}
                                    required
                                    className="h-14 bg-white/5 border-white/10 rounded-2xl px-6 text-white placeholder:text-gray-600"
                                />
                                <p className="text-xs text-gray-500">Maximum photos client can select.</p>
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

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-14 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 font-bold text-lg hover:scale-105 transition-all"
                    >
                        {loading ? "Creating..." : "Create Event"}
                    </Button>

                </form>
            </div>
        </div>
    );
}
