"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Check, ArrowLeft, Gift, Sparkles, Crown, Zap, Globe } from "lucide-react";
import { redeemCode } from "@/actions/subscription";
import { useRouter } from "next/navigation";

type BillingCycle = 'monthly' | 'yearly';

// Psychological Pricing Data
const pricingTiers = [
    {
        name: "Starter",
        tagline: "Perfect for getting started",
        icon: Sparkles,
        color: "from-blue-500 to-cyan-500",
        popular: false,
        monthly: {
            price: 49000,
            originalPrice: 79000, // Fake original
        },
        yearly: {
            pricePerMonth: 29000, // What we show
            originalPerMonth: 49000, // Crossed out
            totalPrice: 348000, // 29k x 12
            bonusMonths: 2,
        },
        features: [
            "5 Events per month",
            "Up to 500 photos/event",
            "Google Drive Sync",
            "WhatsApp Integration",
            "Basic Branding",
            "Email Support",
        ],
        cta: "Get Started",
    },
    {
        name: "Pro",
        tagline: "Most popular for professionals",
        icon: Crown,
        color: "from-purple-500 to-pink-500",
        popular: true,
        monthly: {
            price: 99000,
            originalPrice: 149000,
        },
        yearly: {
            pricePerMonth: 59000,
            originalPerMonth: 99000,
            totalPrice: 708000,
            bonusMonths: 3,
        },
        features: [
            "Unlimited Events",
            "Unlimited Photos",
            "Everything in Starter",
            "Priority Sync Speed",
            "Advanced Analytics",
            "Remove Watermark",
            "Priority Support",
            "Custom Domain (Soon)",
        ],
        cta: "Go Pro",
    },
    {
        name: "Studio",
        tagline: "For studios and agencies",
        icon: Zap,
        color: "from-orange-500 to-red-500",
        popular: false,
        hasPortfolio: true, // Unlock Portfolio Website!
        monthly: {
            price: 199000,
            originalPrice: 299000,
        },
        yearly: {
            pricePerMonth: 119000,
            originalPerMonth: 199000,
            totalPrice: 1428000,
            bonusMonths: 4,
        },
        features: [
            "Everything in Pro",
            "Team Management (3 users)",
            "API Access",
            "White Label",
            "Dedicated Account Manager",
        ],
        portfolioFeature: "Portfolio Website Included",
        cta: "Contact Sales",
    },
];

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID').format(price);
};

export default function PricingPage() {
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [billingCycle, setBillingCycle] = useState<BillingCycle>('yearly'); // Default to yearly!
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
                router.push("/dashboard");
                router.refresh();
            }, 1500);
        } else {
            setError(result.error || "Failed to redeem code");
        }

        setLoading(false);
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center space-y-4"
                >
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white">
                        <Check size={40} strokeWidth={3} />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Code Redeemed!</h2>
                    <p className="text-gray-400">Redirecting to dashboard...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white">

            {/* Header */}
            <div className="max-w-7xl mx-auto px-6 py-6">
                <Link href="/dashboard" className="inline-flex items-center text-gray-400 hover:text-white transition text-sm">
                    <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
                </Link>
            </div>

            {/* Hero */}
            <div className="text-center pt-24 pb-12 px-6">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-5xl font-bold mb-4"
                >
                    Simple, Transparent Pricing
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-gray-400 text-lg max-w-xl mx-auto mb-10"
                >
                    Start free, upgrade when you're ready. No hidden fees.
                </motion.p>

                {/* Billing Cycle Toggle */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="inline-flex items-center gap-2 p-2 bg-white/5 rounded-full border border-white/10"
                >
                    <button
                        onClick={() => setBillingCycle('monthly')}
                        className={`px-6 py-3 rounded-full font-bold text-sm transition-all ${billingCycle === 'monthly'
                            ? 'bg-white/10 text-white'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setBillingCycle('yearly')}
                        className={`px-6 py-3 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${billingCycle === 'yearly'
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Yearly
                        <span className="text-[10px] px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full">
                            Save 40%
                        </span>
                    </button>
                </motion.div>
            </div>

            {/* Redeem Code Section */}
            <div className="max-w-md mx-auto px-6 mb-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4"
                >
                    <div className="flex items-center gap-3">
                        <Gift size={20} className="text-pink-400" />
                        <span className="font-semibold">Have a Promo Code?</span>
                    </div>

                    <div className="flex gap-3">
                        <Input
                            placeholder="Enter your code"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                            onKeyDown={(e) => e.key === 'Enter' && handleRedeem()}
                        />
                        <Button
                            onClick={handleRedeem}
                            disabled={loading}
                            className="h-12 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        >
                            {loading ? "..." : "Redeem"}
                        </Button>
                    </div>

                    {error && <p className="text-red-400 text-sm">{error}</p>}
                </motion.div>
            </div>

            {/* Pricing Cards */}
            <div className="max-w-7xl mx-auto px-6 pb-24">
                <div className="grid md:grid-cols-3 gap-8">
                    {pricingTiers.map((plan, index) => {
                        const isYearly = billingCycle === 'yearly';
                        const displayPrice = isYearly ? plan.yearly.pricePerMonth : plan.monthly.price;
                        const originalPrice = isYearly ? plan.yearly.originalPerMonth : plan.monthly.originalPrice;
                        const yearlyData = plan.yearly;

                        return (
                            <motion.div
                                key={plan.name}
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * index + 0.3 }}
                                className={`relative p-8 rounded-3xl border ${plan.popular
                                    ? 'border-purple-500 bg-gradient-to-br from-purple-500/10 to-pink-500/10 scale-105'
                                    : 'border-white/10 bg-white/5'
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-sm font-bold">
                                        MOST POPULAR
                                    </div>
                                )}

                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-6`}>
                                    <plan.icon size={28} className="text-white" />
                                </div>

                                <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
                                <p className="text-gray-400 text-sm mb-6">{plan.tagline}</p>

                                {/* Price Display with Psychology */}
                                <div className="mb-2">
                                    <span className="text-gray-500 line-through text-lg">
                                        Rp {formatPrice(originalPrice)}
                                    </span>
                                </div>
                                <div className="mb-2">
                                    <span className="text-4xl font-black">Rp {formatPrice(displayPrice)}</span>
                                    <span className="text-gray-400">/month</span>
                                </div>

                                {/* Bonus for Yearly */}
                                {isYearly && (
                                    <div className="mb-6">
                                        <span className="inline-block px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-bold">
                                            +{yearlyData.bonusMonths} months FREE
                                        </span>
                                        <p className="text-xs text-gray-500 mt-2">
                                            Billed Rp {formatPrice(yearlyData.totalPrice)}/year
                                        </p>
                                    </div>
                                )}

                                {billingCycle === 'monthly' && (
                                    <div className="mb-6 h-[52px]" /> // Spacer for alignment
                                )}

                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex items-center gap-3 text-sm">
                                            <Check size={18} className="text-green-400 shrink-0" />
                                            <span className="text-gray-300">{feature}</span>
                                        </li>
                                    ))}

                                    {/* Portfolio Feature Highlight */}
                                    {plan.hasPortfolio && plan.portfolioFeature && (
                                        <li className="flex items-center gap-3 text-sm">
                                            <Globe size={18} className="text-purple-400 shrink-0" />
                                            <span className="text-purple-400 font-bold">{plan.portfolioFeature}</span>
                                        </li>
                                    )}
                                </ul>

                                <Button
                                    className={`w-full h-12 rounded-full font-bold ${plan.popular
                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                                        : 'bg-white/10 hover:bg-white/20'
                                        }`}
                                >
                                    {plan.cta}
                                </Button>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Trust Badge */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-center text-gray-500 text-sm mt-12"
                >
                    🔒 Secure payment · Cancel anytime · 7-day money-back guarantee
                </motion.p>
            </div>
        </div>
    );
}
