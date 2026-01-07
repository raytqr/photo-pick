"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";
import { Check, ArrowLeft, Gift, Sparkles, Crown, Zap } from "lucide-react";
import { redeemCode } from "@/actions/subscription";
import { useRouter } from "next/navigation";

type BillingCycle = 'monthly' | '3-month' | 'yearly';

const getPricingPlans = (cycle: BillingCycle) => {
    const multiplier = cycle === 'monthly' ? 1 : cycle === '3-month' ? 3 : 12;
    const discount = cycle === 'monthly' ? 0 : cycle === '3-month' ? 0.1 : 0.25; // 10% for 3-month, 25% for yearly

    const formatPrice = (basePrice: number) => {
        const total = basePrice * multiplier * (1 - discount);
        return new Intl.NumberFormat('id-ID').format(total);
    };

    return [
        {
            name: "Starter",
            basePrice: 50000,
            price: formatPrice(50000),
            period: cycle === 'monthly' ? '/bulan' : cycle === '3-month' ? '/3 bulan' : '/tahun',
            description: "Perfect for beginner photographers",
            icon: Sparkles,
            color: "from-blue-500 to-cyan-500",
            features: [
                "10 Events per month",
                "Google Drive Sync",
                "WhatsApp Integration",
                "Custom Branding",
                "Email Support"
            ],
            cta: "Get Started",
            popular: false
        },
        {
            name: "Pro",
            basePrice: 99000,
            price: formatPrice(99000),
            period: cycle === 'monthly' ? '/bulan' : cycle === '3-month' ? '/3 bulan' : '/tahun',
            description: "For professional photographers",
            icon: Crown,
            color: "from-purple-500 to-pink-500",
            features: [
                "50 Events per month",
                "Everything in Starter",
                "Priority Support",
                "Analytics Dashboard",
                "Custom Domain"
            ],
            cta: "Get Started",
            popular: true
        },
        {
            name: "Business",
            basePrice: 199000,
            price: formatPrice(199000),
            period: cycle === 'monthly' ? '/bulan' : cycle === '3-month' ? '/3 bulan' : '/tahun',
            description: "For studios and agencies",
            icon: Zap,
            color: "from-orange-500 to-red-500",
            features: [
                "Unlimited Events",
                "Everything in Pro",
                "Team Collaboration",
                "White Label",
                "Dedicated Support"
            ],
            cta: "Contact Sales",
            popular: false
        }
    ];
};

export default function PricingPage() {
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
    const router = useRouter();

    const pricingPlans = getPricingPlans(billingCycle);

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
            <div className="text-center pt-48 pb-12 px-6">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-5xl font-bold mb-4"
                >
                    Choose Your Plan
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-gray-400 text-lg max-w-xl mx-auto mb-10"
                >
                    Unlock all features and start delivering beautiful galleries to your clients.
                </motion.p>

                {/* Billing Cycle Toggle */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="inline-flex items-center gap-2 p-2 bg-white/5 rounded-full border border-white/10"
                >
                    {[
                        { value: 'monthly', label: 'Bulanan' },
                        { value: '3-month', label: '3 Bulan', badge: '-10%' },
                        { value: 'yearly', label: 'Tahunan', badge: '-25%' }
                    ].map((option) => (
                        <button
                            key={option.value}
                            onClick={() => setBillingCycle(option.value as BillingCycle)}
                            className={`px-6 py-3 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${billingCycle === option.value
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            {option.label}
                            {option.badge && billingCycle !== option.value && (
                                <span className="text-[10px] px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full">
                                    {option.badge}
                                </span>
                            )}
                        </button>
                    ))}
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
                    {pricingPlans.map((plan, index) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index + 0.3 }}
                            className={`relative p-8 rounded-3xl border ${plan.popular
                                ? 'border-purple-500 bg-gradient-to-br from-purple-500/10 to-pink-500/10'
                                : 'border-white/10 bg-white/5'
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-sm font-medium">
                                    Most Popular
                                </div>
                            )}

                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-6`}>
                                <plan.icon size={28} className="text-white" />
                            </div>

                            <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                            <p className="text-gray-400 text-sm mb-6">{plan.description}</p>

                            <div className="mb-8">
                                <span className="text-4xl font-bold">Rp {plan.price}</span>
                                <span className="text-gray-400">{plan.period}</span>
                            </div>

                            <ul className="space-y-4 mb-8">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-center gap-3 text-sm">
                                        <Check size={18} className="text-green-400 shrink-0" />
                                        <span className="text-gray-300">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Button
                                className={`w-full h-12 rounded-full ${plan.popular
                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                                    : 'bg-white/10 hover:bg-white/20'
                                    }`}
                            >
                                {plan.cta}
                            </Button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
