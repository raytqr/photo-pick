"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, Crown, ArrowRight, X } from "lucide-react";
import Link from "next/link";

interface StatusBannerProps {
    type: "expired" | "expiring" | "upgrade";
    expiresAt?: string;
    daysUntilExpiry?: number;
}

function getBannerDismissKey(type: string) {
    return `vibe_banner_${type}_dismissed`;
}

export function DismissibleStatusBanner({ type, expiresAt, daysUntilExpiry }: StatusBannerProps) {
    const [isDismissed, setIsDismissed] = useState(true); // Start hidden to prevent flash

    useEffect(() => {
        const dismissKey = getBannerDismissKey(type);
        const lastDismissed = localStorage.getItem(dismissKey);

        if (lastDismissed) {
            const dismissedDate = new Date(lastDismissed);
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);

            // If dismissed today, keep hidden
            if (dismissedDate >= todayStart) {
                setIsDismissed(true);
                return;
            }
        }

        // Show the banner
        setIsDismissed(false);
    }, [type]);

    const handleDismiss = () => {
        const dismissKey = getBannerDismissKey(type);
        localStorage.setItem(dismissKey, new Date().toISOString());
        setIsDismissed(true);
    };

    if (isDismissed) return null;

    if (type === "expired" && expiresAt) {
        return (
            <div className="glass rounded-2xl border-red-500/30 overflow-hidden relative mt-4">
                <button
                    onClick={handleDismiss}
                    className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-red-500/20 hover:bg-red-500/40 flex items-center justify-center transition-colors"
                    aria-label="Dismiss"
                >
                    <X size={16} className="text-red-300" />
                </button>
                <div className="bg-red-500/10 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 pr-14">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center border border-red-500/30">
                            <AlertTriangle className="text-red-500" size={24} />
                        </div>
                        <div>
                            <p className="font-bold text-red-100">Subscription Expired</p>
                            <p className="text-sm text-red-400">Your pro features were disabled on {new Date(expiresAt).toLocaleDateString()}.</p>
                        </div>
                    </div>
                    <Button asChild className="bg-red-500 hover:bg-red-600 text-white rounded-full px-8 font-bold">
                        <Link href="/pricing">Renew Subscription</Link>
                    </Button>
                </div>
            </div>
        );
    }

    if (type === "expiring" && daysUntilExpiry !== undefined) {
        return (
            <div className="glass rounded-2xl border-amber-500/30 overflow-hidden relative mt-4">
                <button
                    onClick={handleDismiss}
                    className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-amber-500/20 hover:bg-amber-500/40 flex items-center justify-center transition-colors"
                    aria-label="Dismiss"
                >
                    <X size={16} className="text-amber-300" />
                </button>
                <div className="bg-amber-500/10 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 pr-14">
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
        );
    }

    if (type === "upgrade") {
        return (
            <div className="glass rounded-2xl border-purple-500/30 overflow-hidden relative mt-4">
                <button
                    onClick={handleDismiss}
                    className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-purple-500/20 hover:bg-purple-500/40 flex items-center justify-center transition-colors"
                    aria-label="Dismiss"
                >
                    <X size={16} className="text-purple-300" />
                </button>
                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-6 pr-14">
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
        );
    }

    return null;
}
