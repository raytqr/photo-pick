"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Check, ArrowLeft, Gift, Sparkles, Crown, Zap, Rocket, Globe, Loader2, Tag, Percent } from "lucide-react";
import { redeemCode } from "@/actions/subscription";
import { getPricingTiers, validateDiscountCode, type PricingTier } from "@/actions/pricing";
import { useRouter } from "next/navigation";

type BillingCycle = 'monthly' | '3-month' | 'yearly';

const ICON_MAP: Record<string, any> = {
    Sparkles, Crown, Zap, Rocket,
};

const formatPrice = (price: number) => new Intl.NumberFormat('id-ID').format(price);

export default function PricingPage() {
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [billingCycle, setBillingCycle] = useState<BillingCycle>('yearly');
    const [tiers, setTiers] = useState<PricingTier[]>([]);
    const [pageLoading, setPageLoading] = useState(true);
    const [discountInfo, setDiscountInfo] = useState<{ percentage: number; code: string } | null>(null);
    const router = useRouter();

    useEffect(() => {
        loadPricing();
    }, []);

    const loadPricing = async () => {
        const data = await getPricingTiers();
        setTiers(data);
        setPageLoading(false);
    };

    const handleRedeem = async () => {
        if (!code.trim()) {
            setError("Please enter a code");
            return;
        }

        setLoading(true);
        setError("");

        try {
            // First check if it's a discount code
            const discountResult = await validateDiscountCode(code);

            if (discountResult.valid) {
                setDiscountInfo({
                    percentage: discountResult.discount_percentage,
                    code: discountResult.code,
                });
                setError("");
            } else if (discountResult.error === "This is not a discount code. Use the Redeem Code section instead.") {
                // It's a subscription code → redeem directly
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
            } else {
                setError(discountResult.error || "Invalid code");
            }
        } catch {
            setError("Something went wrong");
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

    const getDisplayPrice = (plan: PricingTier) => {
        if (billingCycle === 'yearly') return plan.price_yearly;
        if (billingCycle === '3-month') return plan.price_three_month;
        return plan.price_monthly;
    };

    const getTotalPrice = (plan: PricingTier) => {
        if (billingCycle === 'yearly') return plan.total_yearly;
        if (billingCycle === '3-month') return plan.total_three_month;
        return plan.total_monthly || plan.price_monthly;
    };

    const getSavingsPercent = (plan: PricingTier) => {
        const monthlyPrice = plan.price_monthly;
        const currentPrice = getDisplayPrice(plan);
        return Math.round((1 - currentPrice / monthlyPrice) * 100);
    };

    const getCheckoutUrl = (plan: PricingTier) => {
        let url = `/checkout?tier=${plan.id}&cycle=${billingCycle}`;
        if (discountInfo) {
            url += `&code=${encodeURIComponent(discountInfo.code)}`;
        }
        return url;
    };

    if (pageLoading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <Loader2 className="animate-spin text-gray-400" size={32} />
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
                    Start free, upgrade when you&apos;re ready. No hidden fees.
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
                        <span className="font-semibold">Punya Kode Promo?</span>
                    </div>

                    <div className="flex gap-3">
                        <Input
                            placeholder="Masukkan kode promo"
                            value={code}
                            onChange={(e) => {
                                setCode(e.target.value);
                                setError("");
                                if (discountInfo) setDiscountInfo(null);
                            }}
                            className="h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                            onKeyDown={(e) => e.key === 'Enter' && handleRedeem()}
                        />
                        <Button
                            onClick={handleRedeem}
                            disabled={loading}
                            className="h-12 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : "Klaim Promo"}
                        </Button>
                    </div>

                    {error && <p className="text-red-400 text-sm">{error}</p>}

                    {/* Active Discount Badge */}
                    {discountInfo && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl">
                            <Tag size={14} className="text-green-400" />
                            <span className="text-sm font-bold text-green-300">
                                {discountInfo.percentage}% OFF
                            </span>
                            <span className="text-xs text-gray-400">
                                applied to all plans below
                            </span>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Pricing Cards */}
            <div className="max-w-7xl mx-auto px-6 pb-24">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {tiers.map((plan, index) => {
                        const Icon = ICON_MAP[plan.icon] || Sparkles;
                        const displayPrice = getDisplayPrice(plan);
                        const totalPrice = getTotalPrice(plan);
                        const savings = getSavingsPercent(plan);

                        // Apply discount
                        const discountedPrice = discountInfo
                            ? Math.round(displayPrice * (1 - discountInfo.percentage / 100))
                            : displayPrice;
                        const discountedTotal = discountInfo
                            ? Math.round(totalPrice * (1 - discountInfo.percentage / 100))
                            : totalPrice;

                        return (
                            <motion.div
                                key={plan.id}
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * index + 0.3 }}
                                className={`relative p-6 rounded-3xl border ${plan.is_popular
                                    ? 'border-purple-500 bg-gradient-to-br from-purple-500/10 to-pink-500/10 scale-[1.02]'
                                    : 'border-white/10 bg-white/5'
                                    }`}
                            >
                                {plan.is_popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-xs font-bold">
                                        BEST VALUE
                                    </div>
                                )}

                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-4`}>
                                    <Icon size={24} className="text-white" />
                                </div>

                                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                                <p className="text-gray-400 text-xs mb-1">{plan.tagline}</p>
                                <p className="text-purple-400 text-sm font-bold mb-4">
                                    {plan.max_events ? `${plan.max_events} Events/month` : 'Unlimited Events'}
                                </p>

                                {/* Price Display */}
                                <div className="mb-1">
                                    <span className="text-gray-500 line-through text-sm">
                                        Rp {formatPrice(plan.original_monthly)}
                                    </span>
                                </div>
                                <div className="mb-2">
                                    {discountInfo ? (
                                        <>
                                            <span className="text-gray-500 line-through text-lg mr-2">
                                                Rp {formatPrice(displayPrice)}
                                            </span>
                                            <span className="text-3xl font-black text-green-400">Rp {formatPrice(discountedPrice)}</span>
                                        </>
                                    ) : (
                                        <span className="text-3xl font-black">Rp {formatPrice(displayPrice)}</span>
                                    )}
                                    <span className="text-gray-400 text-sm">/mo</span>
                                </div>

                                {/* Billing info */}
                                {billingCycle === '3-month' && (
                                    <div className="mb-4">
                                        <span className="inline-block px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-bold">
                                            Save {savings}%
                                        </span>
                                        <p className="text-[10px] text-gray-500 mt-1">
                                            Billed Rp {formatPrice(discountedTotal)}/3mo
                                        </p>
                                    </div>
                                )}

                                {billingCycle === 'yearly' && (
                                    <div className="mb-4">
                                        <span className="inline-block px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold">
                                            Save {savings}%
                                        </span>
                                        <p className="text-[10px] text-gray-500 mt-1">
                                            Billed Rp {formatPrice(discountedTotal)}/year
                                        </p>
                                    </div>
                                )}

                                {billingCycle === 'monthly' && (
                                    <div className="mb-4 h-[44px]" />
                                )}

                                {discountInfo && (
                                    <div className="mb-3 flex items-center gap-1.5">
                                        <Percent size={12} className="text-purple-400" />
                                        <span className="text-xs font-bold text-purple-400">
                                            -{discountInfo.percentage}% discount applied
                                        </span>
                                    </div>
                                )}

                                <ul className="space-y-2 mb-6">
                                    {(plan.features as string[]).slice(0, 5).map((feature: string) => (
                                        <li key={feature} className="flex items-start gap-2 text-xs">
                                            <Check size={14} className="text-green-400 shrink-0 mt-0.5" />
                                            <span className="text-gray-300">{feature}</span>
                                        </li>
                                    ))}

                                    {plan.portfolio_feature && (
                                        <li className="flex items-start gap-2 text-xs">
                                            <Globe size={14} className="text-purple-400 shrink-0 mt-0.5" />
                                            <span className="text-purple-400 font-bold">{plan.portfolio_feature}</span>
                                        </li>
                                    )}
                                </ul>

                                <Link href={getCheckoutUrl(plan)} className="block w-full">
                                    <Button
                                        className={`w-full h-10 rounded-full font-bold text-sm ${plan.is_popular
                                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                                            : 'bg-white/10 hover:bg-white/20'
                                            }`}
                                    >
                                        {plan.id === 'unlimited' ? 'Hubungi Sales 💬' : plan.is_popular ? 'Langganan Sekarang 🚀' : 'Pilih Paket Ini 🚀'}
                                    </Button>
                                </Link>
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
