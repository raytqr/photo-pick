"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Gift, Sparkles, Crown, Zap, Rocket, Globe, Loader2, Percent, Tag } from "lucide-react";
import { redeemCode } from "@/actions/subscription";
import { getPricingTiers, validateDiscountCode, type PricingTier } from "@/actions/pricing";
import { useRouter } from "next/navigation";
import Link from "next/link";

type BillingCycle = 'monthly' | '3-month' | 'yearly';

const ICON_MAP: Record<string, any> = {
    Sparkles, Crown, Zap, Rocket,
};

const formatPrice = (price: number) => new Intl.NumberFormat('id-ID').format(price);

export default function PricingPage() {
    const [billingCycle, setBillingCycle] = useState<BillingCycle>('yearly');
    const [promoCode, setPromoCode] = useState("");
    const [redeemLoading, setRedeemLoading] = useState(false);
    const [tiers, setTiers] = useState<PricingTier[]>([]);
    const [loading, setLoading] = useState(true);
    const [discountInfo, setDiscountInfo] = useState<{ percentage: number; code: string } | null>(null);
    const [promoMessage, setPromoMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const router = useRouter();

    useEffect(() => {
        loadPricing();
    }, []);

    const loadPricing = async () => {
        const data = await getPricingTiers();
        setTiers(data);
        setLoading(false);
    };

    const handleRedeem = async () => {
        if (!promoCode) return;
        setRedeemLoading(true);
        setPromoMessage(null);
        setDiscountInfo(null);

        try {
            // First, check if it's a discount code
            const discountResult = await validateDiscountCode(promoCode);

            if (discountResult.valid) {
                // It's a discount code → show discount and apply to checkout
                setDiscountInfo({
                    percentage: discountResult.discount_percentage,
                    code: discountResult.code,
                });
                setPromoMessage({
                    type: 'success',
                    text: `🎉 Discount ${discountResult.discount_percentage}% applied! Select a plan to checkout with discount.`
                });
            } else if (discountResult.error === "This is not a discount code. Use the Redeem Code section instead.") {
                // It's a subscription code → redeem directly
                const result = await redeemCode(promoCode);
                if (result.success) {
                    setPromoMessage({ type: 'success', text: `✅ ${result.message}` });
                    setTimeout(() => router.refresh(), 1500);
                } else {
                    setPromoMessage({ type: 'error', text: result.error || "Failed to redeem" });
                }
            } else {
                setPromoMessage({ type: 'error', text: discountResult.error || "Invalid code" });
            }
        } catch {
            setPromoMessage({ type: 'error', text: "Something went wrong" });
        } finally {
            setRedeemLoading(false);
        }
    };

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

    const getBonusMonths = (plan: PricingTier) => {
        if (billingCycle === 'yearly') {
            const savings = getSavingsPercent(plan);
            if (savings >= 30) return 4;
            if (savings >= 25) return 3;
            return 2;
        }
        return 0;
    };

    const getCheckoutUrl = (plan: PricingTier) => {
        let url = `/checkout?tier=${plan.id}&cycle=${billingCycle}`;
        if (discountInfo) {
            url += `&code=${encodeURIComponent(discountInfo.code)}`;
        }
        return url;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-gray-400" size={32} />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-10 pt-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">

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
                        <h3 className="font-bold">Punya Kode Promo?</h3>
                    </div>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Masukkan kode promo"
                            value={promoCode}
                            onChange={(e) => {
                                setPromoCode(e.target.value);
                                if (promoMessage) setPromoMessage(null);
                                if (discountInfo) setDiscountInfo(null);
                            }}
                            className="bg-white/5 border-white/10"
                        />
                        <Button
                            onClick={handleRedeem}
                            disabled={redeemLoading || !promoCode}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 font-bold"
                        >
                            {redeemLoading ? <Loader2 size={16} className="animate-spin" /> : "Klaim Promo"}
                        </Button>
                    </div>

                    {/* Promo Message */}
                    {promoMessage && (
                        <div className={`mt-3 p-3 rounded-xl text-sm ${promoMessage.type === 'success'
                            ? 'bg-green-500/10 border border-green-500/20 text-green-300'
                            : 'bg-red-500/10 border border-red-500/20 text-red-300'
                            }`}>
                            {promoMessage.text}
                        </div>
                    )}

                    {/* Active Discount Badge */}
                    {discountInfo && (
                        <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl">
                            <Tag size={14} className="text-purple-400" />
                            <span className="text-sm font-bold text-purple-300">
                                {discountInfo.percentage}% OFF
                            </span>
                            <span className="text-xs text-gray-400">
                                applied to all plans below
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {tiers.map((plan, i) => {
                    const Icon = ICON_MAP[plan.icon] || Sparkles;
                    const displayPrice = getDisplayPrice(plan);
                    const totalPrice = getTotalPrice(plan);
                    const savings = getSavingsPercent(plan);
                    const bonusMonths = getBonusMonths(plan);

                    // Apply discount if active
                    const discountedPrice = discountInfo
                        ? Math.round(displayPrice * (1 - discountInfo.percentage / 100))
                        : displayPrice;
                    const discountedTotal = discountInfo
                        ? Math.round(totalPrice * (1 - discountInfo.percentage / 100))
                        : totalPrice;

                    return (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`relative glass rounded-[32px] p-6 border-white/5 flex flex-col h-full ${plan.is_popular ? 'border-purple-500/50 shadow-2xl shadow-purple-500/10 scale-[1.02] z-10' : 'hover:border-white/10'
                                }`}
                        >
                            {plan.is_popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">
                                    BEST VALUE
                                </div>
                            )}

                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                                <Icon size={24} className="text-white" />
                            </div>

                            <h3 className="text-xl font-black mb-1">{plan.name}</h3>
                            <p className="text-purple-400 text-sm font-bold mb-1">
                                {plan.max_events ? `${plan.max_events} Events/month` : 'Unlimited Events'}
                            </p>
                            <p className="text-gray-400 text-xs mb-4">{plan.tagline}</p>

                            {/* Crossed out original price */}
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

                            {/* Savings / Discount badge */}
                            {billingCycle === 'yearly' && (
                                <div className="mb-4">
                                    <span className="inline-block px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold">
                                        +{bonusMonths} months FREE
                                    </span>
                                    <p className="text-[10px] text-gray-500 mt-1">
                                        Billed Rp {formatPrice(discountedTotal)}/year
                                    </p>
                                </div>
                            )}
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
                            {billingCycle === 'monthly' && <div className="mb-4 h-[44px]" />}

                            {discountInfo && (
                                <div className="mb-4 flex items-center gap-1.5">
                                    <Percent size={12} className="text-purple-400" />
                                    <span className="text-xs font-bold text-purple-400">
                                        -{discountInfo.percentage}% discount applied
                                    </span>
                                </div>
                            )}

                            <div className="space-y-2 flex-1 mb-6">
                                {(plan.features as string[]).slice(0, 5).map((feature: string, j: number) => (
                                    <div key={j} className="flex items-start gap-2 text-xs font-medium text-gray-300">
                                        <Check size={14} className="text-green-400 shrink-0 mt-0.5" />
                                        {feature}
                                    </div>
                                ))}
                                {plan.portfolio_feature && (
                                    <div className="flex items-start gap-2 text-xs font-bold text-purple-400">
                                        <Globe size={14} className="shrink-0 mt-0.5" />
                                        {plan.portfolio_feature}
                                    </div>
                                )}
                            </div>

                            <Link href={getCheckoutUrl(plan)} className="block w-full">
                                <Button className={`w-full h-10 rounded-xl font-bold text-sm ${plan.is_popular
                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-105 shadow-lg shadow-purple-500/25'
                                    : 'bg-white/10 hover:bg-white/20'
                                    } transition-all`}>
                                    {plan.id === 'unlimited' ? 'Hubungi Sales 💬' : plan.is_popular ? 'Langganan Sekarang 🚀' : 'Pilih Paket Ini 🚀'}
                                </Button>
                            </Link>
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
