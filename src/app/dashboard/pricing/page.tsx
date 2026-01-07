"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Gift, Sparkles, Crown, Zap, Rocket, Globe } from "lucide-react";
import { redeemCode } from "@/actions/subscription";
import { useRouter } from "next/navigation";

type BillingCycle = 'monthly' | '3-month' | 'yearly';

// Correct pricing: Yearly per-month is the BASE (discounted), Monthly/3-Month are MORE expensive
const pricingTiers = [
    {
        name: "Starter",
        tagline: "Perfect for beginners",
        icon: Sparkles,
        color: "from-gray-500 to-gray-600",
        popular: false,
        events: "10 Events/month",
        // Yearly is BASE: 30k/mo, Monthly is MORE expensive
        yearly: { pricePerMonth: 30000, totalPrice: 360000, bonusMonths: 2 },
        threeMonth: { pricePerMonth: 35000, totalPrice: 105000, bonusWeeks: 1 },
        monthly: { price: 40000 },
        originalMonthly: 50000, // Crossed out "original" price
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
        yearly: { pricePerMonth: 50000, totalPrice: 600000, bonusMonths: 2 },
        threeMonth: { pricePerMonth: 60000, totalPrice: 180000, bonusWeeks: 1 },
        monthly: { price: 70000 },
        originalMonthly: 89000,
        features: [
            "20 Events per month",
            "Up to 500 photos/event",
            "Everything in Starter",
            "Email Support",
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
        yearly: { pricePerMonth: 100000, totalPrice: 1200000, bonusMonths: 3 },
        threeMonth: { pricePerMonth: 120000, totalPrice: 360000, bonusWeeks: 2 },
        monthly: { price: 150000 },
        originalMonthly: 199000,
        features: [
            "50 Events per month",
            "Unlimited photos/event",
            "Everything in Basic",
            "WhatsApp Support",
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
        yearly: { pricePerMonth: 200000, totalPrice: 2400000, bonusMonths: 4 },
        threeMonth: { pricePerMonth: 240000, totalPrice: 720000, bonusWeeks: 2 },
        monthly: { price: 300000 },
        originalMonthly: 399000,
        features: [
            "Unlimited Events",
            "Unlimited Photos",
            "Everything in Pro",
            "WhatsApp Support",
        ],
        portfolioFeature: "Portfolio Website Included",
        cta: "Contact Sales",
    },
];

const formatPrice = (price: number) => new Intl.NumberFormat('id-ID').format(price);

export default function PricingPage() {
    const [billingCycle, setBillingCycle] = useState<BillingCycle>('yearly'); // Default yearly
    const [promoCode, setPromoCode] = useState("");
    const [redeemLoading, setRedeemLoading] = useState(false);
    const router = useRouter();

    const handleRedeem = async () => {
        if (!promoCode) return;
        setRedeemLoading(true);
        try {
            const result = await redeemCode(promoCode);
            if (result.success) {
                alert("Code redeemed successfully!");
                router.refresh();
            } else {
                alert(result.error);
            }
        } catch {
            alert("Something went wrong");
        } finally {
            setRedeemLoading(false);
        }
    };

    const getDisplayPrice = (plan: typeof pricingTiers[0]) => {
        if (billingCycle === 'yearly') return plan.yearly.pricePerMonth;
        if (billingCycle === '3-month') return plan.threeMonth.pricePerMonth;
        return plan.monthly.price;
    };

    const getSavingsPercent = (plan: typeof pricingTiers[0]) => {
        const monthlyPrice = plan.monthly.price;
        const currentPrice = getDisplayPrice(plan);
        return Math.round((1 - currentPrice / monthlyPrice) * 100);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">

            <div className="text-center space-y-4">
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
                    Choose Your Plan
                </h1>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                    Unlock all features and start delivering beautiful galleries to your clients.
                </p>
            </div>

            {/* Billing Cycle Toggle */}
            <div className="flex justify-center">
                <div className="glass p-1.5 rounded-full border-white/10 flex items-center gap-1">
                    <button
                        onClick={() => setBillingCycle('monthly')}
                        className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${billingCycle === 'monthly'
                            ? 'bg-white/10 text-white'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setBillingCycle('3-month')}
                        className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${billingCycle === '3-month'
                            ? 'bg-blue-500 text-white'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        3 Months
                        {billingCycle !== '3-month' && <span className="text-[10px] px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded-full">-20%</span>}
                    </button>
                    <button
                        onClick={() => setBillingCycle('yearly')}
                        className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${billingCycle === 'yearly'
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Yearly
                        {billingCycle !== 'yearly' && <span className="text-[10px] px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded-full">-35%</span>}
                    </button>
                </div>
            </div>

            {/* Promo Code Section */}
            <div className="max-w-md mx-auto">
                <div className="glass rounded-2xl p-6 border-white/10">
                    <div className="flex items-center gap-2 mb-4">
                        <Gift className="text-pink-500" size={20} />
                        <h3 className="font-bold">Have a Promo Code?</h3>
                    </div>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Enter your code"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                            className="bg-white/5 border-white/10"
                        />
                        <Button
                            onClick={handleRedeem}
                            disabled={redeemLoading}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 font-bold"
                        >
                            {redeemLoading ? "..." : "Redeem"}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {pricingTiers.map((plan, i) => {
                    const displayPrice = getDisplayPrice(plan);
                    const savings = getSavingsPercent(plan);

                    return (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`relative glass rounded-[32px] p-6 border-white/5 flex flex-col h-full ${plan.popular ? 'border-purple-500/50 shadow-2xl shadow-purple-500/10 scale-[1.02] z-10' : 'hover:border-white/10'
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">
                                    BEST VALUE
                                </div>
                            )}

                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4 shadow-lg`}>
                                <plan.icon size={24} className="text-white" />
                            </div>

                            <h3 className="text-xl font-black mb-1">{plan.name}</h3>
                            <p className="text-purple-400 text-sm font-bold mb-1">{plan.events}</p>
                            <p className="text-gray-400 text-xs mb-4">{plan.tagline}</p>

                            {/* Crossed out original price */}
                            <div className="mb-1">
                                <span className="text-gray-500 line-through text-sm">
                                    Rp {formatPrice(plan.originalMonthly)}
                                </span>
                            </div>
                            <div className="mb-2">
                                <span className="text-3xl font-black">Rp {formatPrice(displayPrice)}</span>
                                <span className="text-gray-400 text-sm">/mo</span>
                            </div>

                            {/* Savings badge */}
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
                            {billingCycle === '3-month' && (
                                <div className="mb-4">
                                    <span className="inline-block px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-bold">
                                        Save {savings}%
                                    </span>
                                    <p className="text-[10px] text-gray-500 mt-1">
                                        Billed Rp {formatPrice(plan.threeMonth.totalPrice)}/3mo
                                    </p>
                                </div>
                            )}
                            {billingCycle === 'monthly' && <div className="mb-4 h-[44px]" />}

                            <div className="space-y-2 flex-1 mb-6">
                                {plan.features.slice(0, 5).map((feature, j) => (
                                    <div key={j} className="flex items-start gap-2 text-xs font-medium text-gray-300">
                                        <Check size={14} className="text-green-400 shrink-0 mt-0.5" />
                                        {feature}
                                    </div>
                                ))}
                                {plan.hasPortfolio && plan.portfolioFeature && (
                                    <div className="flex items-start gap-2 text-xs font-bold text-purple-400">
                                        <Globe size={14} className="shrink-0 mt-0.5" />
                                        {plan.portfolioFeature}
                                    </div>
                                )}
                            </div>

                            <Button className={`w-full h-10 rounded-xl font-bold text-sm ${plan.popular
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-105 shadow-lg shadow-purple-500/25'
                                : 'bg-white/10 hover:bg-white/20'
                                } transition-all`}>
                                {plan.cta}
                            </Button>
                        </motion.div>
                    );
                })}
            </div>

            {/* Trust Badge */}
            <p className="text-center text-gray-500 text-sm">
                🔒 Secure payment · Cancel anytime · 7-day money-back guarantee
            </p>
        </div>
    );
}
