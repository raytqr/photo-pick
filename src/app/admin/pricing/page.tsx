"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Save,
    Sparkles,
    Crown,
    Zap,
    Rocket,
    Check,
    TrendingUp,
    AlertCircle
} from "lucide-react";

// Current pricing (will be migrated to DB in future)
const initialPricingTiers = [
    {
        id: "starter",
        name: "Starter",
        tagline: "Perfect for beginners",
        icon: Sparkles,
        gradient: "from-gray-500 to-slate-500",
        events: 10,
        photosPerEvent: 300,
        monthly: 40000,
        threeMonth: 35000,
        yearly: 30000,
        originalMonthly: 50000,
    },
    {
        id: "basic",
        name: "Basic",
        tagline: "For growing photographers",
        icon: Crown,
        gradient: "from-blue-500 to-cyan-500",
        events: 20,
        photosPerEvent: 500,
        monthly: 70000,
        threeMonth: 60000,
        yearly: 50000,
        originalMonthly: 89000,
    },
    {
        id: "pro",
        name: "Pro",
        tagline: "Most popular choice",
        icon: Zap,
        gradient: "from-purple-500 to-pink-500",
        events: 50,
        photosPerEvent: null, // unlimited
        monthly: 150000,
        threeMonth: 120000,
        yearly: 100000,
        originalMonthly: 199000,
        isPopular: true,
    },
    {
        id: "unlimited",
        name: "Unlimited",
        tagline: "For studios & agencies",
        icon: Rocket,
        gradient: "from-orange-500 to-red-500",
        events: null, // unlimited
        photosPerEvent: null, // unlimited
        monthly: 300000,
        threeMonth: 240000,
        yearly: 200000,
        originalMonthly: 399000,
    },
];

const formatPrice = (price: number) => new Intl.NumberFormat("id-ID").format(price);

export default function AdminPricingPage() {
    const [tiers, setTiers] = useState(initialPricingTiers);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleChange = (id: string, field: string, value: number | string | null) => {
        setTiers(tiers.map(tier =>
            tier.id === id ? { ...tier, [field]: value } : tier
        ));
        setSaved(false);
    };

    const handleSave = async () => {
        setSaving(true);
        // TODO: Save to database when pricing_tiers table is created
        await new Promise(resolve => setTimeout(resolve, 500));
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="space-y-6 max-w-6xl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Pricing</h1>
                    <p className="text-gray-500 text-[15px]">
                        Configure subscription plans
                    </p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className={`rounded-xl h-11 px-6 font-semibold shadow-lg transition-all ${saved
                            ? "bg-green-600 shadow-green-500/20"
                            : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-green-500/20"
                        }`}
                >
                    {saving ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Saving...
                        </>
                    ) : saved ? (
                        <>
                            <Check size={18} className="mr-2" />
                            Saved!
                        </>
                    ) : (
                        <>
                            <Save size={18} className="mr-2" />
                            Save Changes
                        </>
                    )}
                </Button>
            </div>

            {/* Info Banner */}
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-2xl p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center shrink-0">
                    <AlertCircle size={18} className="text-yellow-400" />
                </div>
                <div>
                    <h3 className="font-semibold text-yellow-300 mb-1">Database Migration Required</h3>
                    <p className="text-gray-400 text-[14px] leading-relaxed">
                        Pricing is currently hardcoded. Run the SQL migration to enable database-driven pricing management.
                    </p>
                </div>
            </div>

            {/* Pricing Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {tiers.map((tier) => {
                    const Icon = tier.icon;
                    const yearlyDiscount = Math.round((1 - tier.yearly / tier.monthly) * 100);

                    return (
                        <div
                            key={tier.id}
                            className={`relative bg-white/[0.02] border rounded-2xl overflow-hidden transition-all hover:bg-white/[0.03] ${tier.isPopular ? "border-purple-500/30" : "border-white/[0.06]"
                                }`}
                        >
                            {/* Popular Badge */}
                            {tier.isPopular && (
                                <div className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-[11px] font-bold tracking-wide shadow-lg">
                                    POPULAR
                                </div>
                            )}

                            {/* Header */}
                            <div className={`bg-gradient-to-r ${tier.gradient} p-5`}>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                                        <Icon size={24} className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">{tier.name}</h3>
                                        <p className="text-white/70 text-sm">{tier.tagline}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-5 space-y-5">
                                {/* Limits */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[12px] font-medium text-gray-400 uppercase tracking-wide">
                                            Events/month
                                        </label>
                                        <Input
                                            type="number"
                                            value={tier.events || ""}
                                            onChange={(e) => handleChange(tier.id, "events", e.target.value ? parseInt(e.target.value) : null)}
                                            placeholder="∞ Unlimited"
                                            className="bg-white/[0.03] border-white/10 h-11 rounded-xl text-[15px]"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[12px] font-medium text-gray-400 uppercase tracking-wide">
                                            Photos/event
                                        </label>
                                        <Input
                                            type="number"
                                            value={tier.photosPerEvent || ""}
                                            onChange={(e) => handleChange(tier.id, "photosPerEvent", e.target.value ? parseInt(e.target.value) : null)}
                                            placeholder="∞ Unlimited"
                                            className="bg-white/[0.03] border-white/10 h-11 rounded-xl text-[15px]"
                                        />
                                    </div>
                                </div>

                                {/* Pricing */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[12px] font-medium text-gray-400 uppercase tracking-wide">
                                            Pricing (Rp)
                                        </label>
                                        <span className="text-[11px] px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full font-medium">
                                            -{yearlyDiscount}% yearly
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] text-gray-500">Monthly</label>
                                            <Input
                                                type="number"
                                                value={tier.monthly}
                                                onChange={(e) => handleChange(tier.id, "monthly", parseInt(e.target.value) || 0)}
                                                className="bg-white/[0.03] border-white/10 h-10 rounded-xl text-[14px]"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] text-gray-500">3-Month (per mo)</label>
                                            <Input
                                                type="number"
                                                value={tier.threeMonth}
                                                onChange={(e) => handleChange(tier.id, "threeMonth", parseInt(e.target.value) || 0)}
                                                className="bg-white/[0.03] border-white/10 h-10 rounded-xl text-[14px]"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] text-gray-500">Yearly (per mo)</label>
                                            <Input
                                                type="number"
                                                value={tier.yearly}
                                                onChange={(e) => handleChange(tier.id, "yearly", parseInt(e.target.value) || 0)}
                                                className="bg-white/[0.03] border-white/10 h-10 rounded-xl text-[14px]"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] text-gray-500">Original (strikethrough)</label>
                                            <Input
                                                type="number"
                                                value={tier.originalMonthly}
                                                onChange={(e) => handleChange(tier.id, "originalMonthly", parseInt(e.target.value) || 0)}
                                                className="bg-white/[0.03] border-white/10 h-10 rounded-xl text-[14px]"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Preview */}
                                <div className="pt-4 border-t border-white/[0.06]">
                                    <div className="flex items-center gap-2 mb-3">
                                        <TrendingUp size={14} className="text-gray-500" />
                                        <span className="text-[12px] font-medium text-gray-400 uppercase tracking-wide">Preview</span>
                                    </div>
                                    <div className="bg-white/[0.03] rounded-xl p-4">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-gray-500 line-through text-sm">
                                                Rp {formatPrice(tier.originalMonthly)}
                                            </span>
                                        </div>
                                        <div className="flex items-baseline gap-1 mt-1">
                                            <span className="text-3xl font-bold">
                                                Rp {formatPrice(tier.yearly)}
                                            </span>
                                            <span className="text-gray-500 text-sm">/mo</span>
                                        </div>
                                        <p className="text-[12px] text-gray-500 mt-2">
                                            Billed Rp {formatPrice(tier.yearly * 12)}/year
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
