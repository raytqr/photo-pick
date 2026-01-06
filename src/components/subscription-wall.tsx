"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Gift, Sparkles, ArrowRight, Check } from "lucide-react";
import { redeemCode } from "@/actions/subscription";
import { useRouter } from "next/navigation";

interface SubscriptionWallProps {
    tier: string;
    eventsRemaining: number;
    expiresAt: string | null;
}

export function SubscriptionWall({ tier, eventsRemaining, expiresAt }: SubscriptionWallProps) {
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleRedeem = async () => {
        if (!code.trim()) {
            setError("Please enter a code");
            return;
        }

        setLoading(true);
        setError("");

        const result = await redeemCode(code);

        if (result.success) {
            setSuccess(true);
            setTimeout(() => {
                router.refresh();
            }, 2000);
        } else {
            setError(result.error || "Failed to redeem code");
        }

        setLoading(false);
    };

    if (success) {
        return (
            <div className="fixed inset-0 z-50 bg-gray-950/90 backdrop-blur-xl flex items-center justify-center p-6">
                <div className="max-w-md w-full text-center space-y-6 animate-in zoom-in duration-300">
                    <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white">
                        <Check size={48} strokeWidth={3} />
                    </div>
                    <h2 className="text-3xl font-bold text-white">You're All Set!</h2>
                    <p className="text-gray-400">Your account has been activated. Redirecting...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-gray-950/95 backdrop-blur-xl flex items-center justify-center p-6">
            <div className="max-w-lg w-full space-y-8">

                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center">
                        <Lock size={36} className="text-purple-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">Unlock Your Dashboard</h1>
                    <p className="text-gray-400 max-w-sm mx-auto">
                        Choose a plan or enter a promo code to start creating beautiful galleries for your clients.
                    </p>
                </div>

                {/* Redeem Code Section */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center gap-3 text-white">
                        <Gift size={20} className="text-pink-400" />
                        <span className="font-semibold">Have a Promo Code?</span>
                    </div>

                    <div className="flex gap-3">
                        <Input
                            placeholder="Enter your code"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                        />
                        <Button
                            onClick={handleRedeem}
                            disabled={loading}
                            className="h-12 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        >
                            {loading ? "..." : "Redeem"}
                        </Button>
                    </div>

                    {error && (
                        <p className="text-red-400 text-sm">{error}</p>
                    )}
                </div>

                {/* Pricing Preview */}
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-semibold text-white">Starter Plan</h3>
                            <p className="text-gray-400 text-sm">10 events/month, all features</p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-white">Rp 50.000</div>
                            <div className="text-gray-400 text-sm">/month</div>
                        </div>
                    </div>

                    <Button className="w-full h-12 rounded-full bg-white text-black hover:bg-gray-200">
                        <Sparkles size={18} className="mr-2" />
                        Subscribe Now
                    </Button>
                </div>

                {/* Back to Home */}
                <div className="text-center">
                    <a href="/" className="text-gray-400 hover:text-white text-sm transition">
                        ← Back to Home
                    </a>
                </div>
            </div>
        </div>
    );
}
