"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Check, ArrowLeft, Gift, Sparkles, Crown, Zap, Rocket, Globe } from "lucide-react";
import { redeemCode } from "@/actions/subscription";
import { useRouter } from "next/navigation";

type BillingCycle = 'monthly' | '3-month' | 'yearly';

// New Pricing Structure with Psychology
const pricingTiers = [
    {
        name: "Starter",
        tagline: "Perfect for beginners",
        icon: Sparkles,
        color: "from-gray-500 to-gray-600",
        popular: false,
        events: "10 Events/month",
        monthly: {
            price: 30000,
            originalPrice: 50000,
        },
        threeMonth: {
            pricePerMonth: 27000,
            originalPerMonth: 30000,
            totalPrice: 81000,
            bonusWeeks: 2,
        },
        yearly: {
            pricePerMonth: 20000,
            originalPerMonth: 30000,
            totalPrice: 240000,
            bonusMonths: 2,
        },
        features: [
            "10 Events per month",
            "Up to 300 photos/event",
            "Google Drive Sync",
            "WhatsApp Integration",
            "Email Support",
        ],
        cta: "Get Started",
    },
    {
        name: "Basic",
        tagline: "For growing photographers",
        icon: Crown,
        color: "from-blue-500 to-cyan-500",
        popular: false,
        events: "20 Events/month",
        monthly: {
            price: 50000,
            originalPrice: 79000,
        },
        threeMonth: {
            pricePerMonth: 45000,
            originalPerMonth: 50000,
            totalPrice: 135000,
            bonusWeeks: 2,
        },
        yearly: {
            pricePerMonth: 35000,
            originalPerMonth: 50000,
            totalPrice: 420000,
            bonusMonths: 2,
        },
        features: [
            "20 Events per month",
            "Up to 500 photos/event",
            "Everything in Starter",
            "Custom Branding",
            "Priority Support",
        ],
        cta: "Get Started",
    },
    {
        name: "Pro",
        tagline: "Most popular choice",
        icon: Zap,
        color: "from-purple-500 to-pink-500",
        popular: true,
        events: "50 Events/month",
        monthly: {
            price: 100000,
            originalPrice: 149000,
        },
        threeMonth: {
            pricePerMonth: 85000,
            originalPerMonth: 100000,
            totalPrice: 255000,
            bonusWeeks: 3,
        },
        yearly: {
            pricePerMonth: 65000,
            originalPerMonth: 100000,
            totalPrice: 780000,
            bonusMonths: 3,
        },
        features: [
            "50 Events per month",
            "Unlimited photos/event",
            "Everything in Basic",
            "Advanced Analytics",
            "Remove Watermark",
            "Custom Domain (Soon)",
        ],
        cta: "Go Pro",
    },
    {
        name: "Unlimited",
        tagline: "For studios & agencies",
        icon: Rocket,
        color: "from-orange-500 to-red-500",
        popular: false,
        events: "Unlimited Events",
        hasPortfolio: true,
        monthly: {
            price: 200000,
            originalPrice: 299000,
        },
        threeMonth: {
            pricePerMonth: 170000,
            originalPerMonth: 200000,
            totalPrice: 510000,
            bonusWeeks: 4,
        },
        yearly: {
            pricePerMonth: 130000,
            originalPerMonth: 200000,
            totalPrice: 1560000,
            bonusMonths: 4,
        },
        features: [
            "Unlimited Events",
            "Unlimited Photos",
            "Everything in Pro",
            "Team Management",
            "API Access",
            "White Label",
            "Dedicated Support",
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
    const [billingCycle, setBillingCycle] = useState<BillingCycle>('yearly'); // Default yearly
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

    const getDisplayPrice = (plan: typeof pricingTiers[0]) => {
        if (billingCycle === 'yearly') return plan.yearly.pricePerMonth;
        if (billingCycle === '3-month') return plan.threeMonth.pricePerMonth;
        return plan.monthly.price;
    };

    const getOriginalPrice = (plan: typeof pricingTiers[0]) => {
        if (billingCycle === 'yearly') return plan.yearly.originalPerMonth;
        if (billingCycle === '3-month') return plan.threeMonth.originalPerMonth;
        return plan.monthly.originalPrice;
    };

    const getSavingsPercent = () => {
        if (billingCycle === 'yearly') return '35%';
        if (billingCycle === '3-month') return '15%';
        return '0%';
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white">

            {/* Header */}
            <div className="max-w-7xl mx-auto px-6 py-6">
                <Link href="/dashboard" className="inline-flex items-center text-gray-400 hover:text-white transition text-sm">
                    <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
                </Link>
            </div>

            {/* Hero */}
            <div className="text-center pt-16 pb-12 px-6">
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
                    className="inline-flex items-center gap-1 p-1.5 bg-white/5 rounded-full border border-white/10"
                >
                    <button
                        onClick={() => setBillingCycle('monthly')}
                        className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all ${billingCycle === 'monthly'
                            ? 'bg-white/10 text-white'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setBillingCycle('3-month')}
                        className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${billingCycle === '3-month'
                            ? 'bg-blue-500 text-white'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        3 Months
                        {billingCycle !== '3-month' && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded-full">-15%</span>
                        )}
                    </button>
                    <button
                        onClick={() => setBillingCycle('yearly')}
                        className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${billingCycle === 'yearly'
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Yearly
                        {billingCycle !== 'yearly' && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded-full">-35%</span>
                        )}
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
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {pricingTiers.map((plan, index) => {
                        const displayPrice = getDisplayPrice(plan);
                        const originalPrice = getOriginalPrice(plan);

                        return (
                            <motion.div
                                key={plan.name}
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * index + 0.3 }}
                                className={`relative p-6 rounded-3xl border ${plan.popular
                                    ? 'border-purple-500 bg-gradient-to-br from-purple-500/10 to-pink-500/10 scale-[1.02]'
                                    : 'border-white/10 bg-white/5'
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-xs font-bold">
                                        BEST VALUE
                                    </div>
                                )}

                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
                                    <plan.icon size={24} className="text-white" />
                                </div>

                                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                                <p className="text-gray-400 text-xs mb-1">{plan.tagline}</p>
                                <p className="text-purple-400 text-sm font-bold mb-4">{plan.events}</p>

                                {/* Price Display with Psychology */}
                                <div className="mb-1">
                                    <span className="text-gray-500 line-through text-sm">
                                        Rp {formatPrice(originalPrice)}
                                    </span>
                                </div>
                                <div className="mb-2">
                                    <span className="text-3xl font-black">Rp {formatPrice(displayPrice)}</span>
                                    <span className="text-gray-400 text-sm">/mo</span>
                                </div>

                                {/* Bonus for 3-month */}
                                {billingCycle === '3-month' && (
                                    <div className="mb-4">
                                        <span className="inline-block px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-bold">
                                            +{plan.threeMonth.bonusWeeks} weeks FREE
                                        </span>
                                        <p className="text-[10px] text-gray-500 mt-1">
                                            Billed Rp {formatPrice(plan.threeMonth.totalPrice)}/3mo
                                        </p>
                                    </div>
                                )}

                                {/* Bonus for Yearly */}
                                {billingCycle === 'yearly' && (
                                    <div className="mb-4">
                                        <span className="inline-block px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold">
                                            +{plan.yearly.bonusMonths} months FREE
                                        </span>
                                        <p className="text-[10px] text-gray-500 mt-1">
                                            Billed Rp {formatPrice(plan.yearly.totalPrice)}/year
                                        </p>
                                    </div>
                                )}

                                {billingCycle === 'monthly' && (
                                    <div className="mb-4 h-[44px]" />
                                )}

                                <ul className="space-y-2 mb-6">
                                    {plan.features.slice(0, 5).map((feature) => (
                                        <li key={feature} className="flex items-start gap-2 text-xs">
                                            <Check size={14} className="text-green-400 shrink-0 mt-0.5" />
                                            <span className="text-gray-300">{feature}</span>
                                        </li>
                                    ))}

                                    {plan.hasPortfolio && plan.portfolioFeature && (
                                        <li className="flex items-start gap-2 text-xs">
                                            <Globe size={14} className="text-purple-400 shrink-0 mt-0.5" />
                                            <span className="text-purple-400 font-bold">{plan.portfolioFeature}</span>
                                        </li>
                                    )}
                                </ul>

                                <Button
                                    className={`w-full h-10 rounded-full font-bold text-sm ${plan.popular
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
