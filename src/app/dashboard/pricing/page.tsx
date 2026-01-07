"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Check, Gift, Sparkles, Crown, Zap } from "lucide-react";
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
                "Unlimited Events",
                "Priority Sync Speed",
                "Advanced Analytics",
                "Remove Watermark",
                "Priority Support",
                "Custom Domain (Soon)"
            ],
            cta: "Go Pro",
            popular: true
        },
        {
            name: "Business",
            basePrice: 199000,
            price: formatPrice(199000),
            period: cycle === 'monthly' ? '/bulan' : cycle === '3-month' ? '/3 bulan' : '/tahun',
            description: "For studios and agencies",
            icon: Zap,
            color: "from-amber-500 to-orange-500",
            features: [
                "Everything in Pro",
                "Team Management",
                "API Access",
                "White Label",
                "Dedicated Account Manager"
            ],
            cta: "Contact Sales",
            popular: false
        }
    ];
};

export default function PricingPage() {
    const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
    const [promoCode, setPromoCode] = useState("");
    const [redeemLoading, setRedeemLoading] = useState(false);
    const router = useRouter();

    const plans = getPricingPlans(billingCycle);

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
        } catch (error) {
            alert("Something went wrong");
        } finally {
            setRedeemLoading(false);
        }
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
                    {(['monthly', '3-month', 'yearly'] as const).map((cycle) => (
                        <button
                            key={cycle}
                            onClick={() => setBillingCycle(cycle)}
                            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${billingCycle === cycle
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {cycle === 'monthly' ? 'Bulanan' : cycle === '3-month' ? '3 Bulan' : 'Tahunan'}
                            {cycle === '3-month' && <span className="ml-2 text-[10px] bg-green-500 text-black px-1.5 py-0.5 rounded-full">-10%</span>}
                            {cycle === 'yearly' && <span className="ml-2 text-[10px] bg-green-500 text-black px-1.5 py-0.5 rounded-full">-25%</span>}
                        </button>
                    ))}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {plans.map((plan, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`relative glass rounded-[40px] p-8 border-white/5 flex flex-col h-full ${plan.popular ? 'border-purple-500/50 shadow-2xl shadow-purple-500/10 scale-105 z-10' : 'hover:border-white/10'
                            }`}
                    >
                        {plan.popular && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">
                                Most Popular
                            </div>
                        )}

                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-6 shadow-lg`}>
                            <plan.icon size={28} className="text-white" />
                        </div>

                        <h3 className="text-2xl font-black mb-2">{plan.name}</h3>
                        <p className="text-gray-400 text-sm mb-6 min-h-[40px]">{plan.description}</p>

                        <div className="mb-8">
                            <span className="text-4xl font-black">Rp {plan.price}</span>
                            <span className="text-gray-500 text-sm font-bold">{plan.period}</span>
                            {billingCycle !== 'monthly' && (
                                <div className="text-xs text-green-400 font-bold mt-1">
                                    {(billingCycle === '3-month' ? 'Save 10%' : 'Save 25%')}
                                </div>
                            )}
                        </div>

                        <div className="space-y-4 flex-1 mb-8">
                            {plan.features.map((feature, j) => (
                                <div key={j} className="flex items-center gap-3 text-sm font-medium text-gray-300">
                                    <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 text-green-400">
                                        <Check size={10} strokeWidth={4} />
                                    </div>
                                    {feature}
                                </div>
                            ))}
                        </div>

                        <Button className={`w-full h-12 rounded-xl font-bold ${plan.popular
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-105 shadow-lg shadow-purple-500/25'
                            : 'bg-white text-black hover:bg-gray-200'
                            } transition-all`}>
                            {plan.cta}
                        </Button>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
