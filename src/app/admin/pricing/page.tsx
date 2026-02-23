"use client";

import { useState, useEffect } from "react";
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
    Loader2,
    AlertCircle,
    CheckCircle2
} from "lucide-react";
import { getAllPricingTiers, savePricingTiers, type PricingTier } from "@/actions/pricing";

const ICON_MAP: Record<string, any> = {
    Sparkles, Crown, Zap, Rocket,
};

const formatPrice = (price: number) => new Intl.NumberFormat("id-ID").format(price);

export default function AdminPricingPage() {
    const [tiers, setTiers] = useState<PricingTier[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [saveError, setSaveError] = useState("");
    const [isFromDB, setIsFromDB] = useState(false);

    useEffect(() => {
        loadTiers();
    }, []);

    const loadTiers = async () => {
        setLoading(true);
        const result = await getAllPricingTiers();
        setTiers(result.tiers);
        setIsFromDB(!result.error);
        setLoading(false);
    };

    const handleChange = (id: string, field: string, value: number | string | null) => {
        setTiers(tiers.map(tier =>
            tier.id === id ? { ...tier, [field]: value } : tier
        ));
        setSaved(false);
        setSaveError("");
    };

    const handleSave = async () => {
        setSaving(true);
        setSaveError("");

        // Auto-calculate totals before saving
        const tiersWithTotals = tiers.map(tier => ({
            ...tier,
            total_monthly: tier.price_monthly,
            total_three_month: tier.price_three_month * 3,
            total_yearly: tier.price_yearly * 12,
        }));

        const result = await savePricingTiers(tiersWithTotals);

        setSaving(false);
        if (result.success) {
            setSaved(true);
            setIsFromDB(true);
            setTiers(tiersWithTotals);
            setTimeout(() => setSaved(false), 3000);
        } else {
            setSaveError(result.error || "Failed to save");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-gray-400" size={32} />
            </div>
        );
    }

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
                            <Loader2 size={18} className="mr-2 animate-spin" />
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

            {/* Status Banner */}
            {isFromDB ? (
                <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-5 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center shrink-0">
                        <CheckCircle2 size={18} className="text-green-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-green-300 mb-1">Database Connected</h3>
                        <p className="text-gray-400 text-[14px] leading-relaxed">
                            Pricing is loaded from database. Changes will be saved and reflected across the app.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-2xl p-5 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center shrink-0">
                        <AlertCircle size={18} className="text-yellow-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-yellow-300 mb-1">Database Migration Required</h3>
                        <p className="text-gray-400 text-[14px] leading-relaxed">
                            Using fallback pricing. Run the SQL migration to enable database-driven pricing management.
                        </p>
                    </div>
                </div>
            )}

            {/* Save Error */}
            {saveError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-300 text-sm">
                    ❌ {saveError}
                </div>
            )}

            {/* Pricing Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {tiers.map((tier) => {
                    const Icon = ICON_MAP[tier.icon] || Sparkles;
                    const yearlyDiscount = tier.price_monthly > 0
                        ? Math.round((1 - tier.price_yearly / tier.price_monthly) * 100)
                        : 0;

                    return (
                        <div
                            key={tier.id}
                            className={`relative bg-white/[0.02] border rounded-2xl overflow-hidden transition-all hover:bg-white/[0.03] ${tier.is_popular ? "border-purple-500/30" : "border-white/[0.06]"
                                }`}
                        >
                            {/* Popular Badge */}
                            {tier.is_popular && (
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
                                            value={tier.max_events || ""}
                                            onChange={(e) => handleChange(tier.id, "max_events", e.target.value ? parseInt(e.target.value) : null)}
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
                                            value={tier.max_photos || ""}
                                            onChange={(e) => handleChange(tier.id, "max_photos", e.target.value ? parseInt(e.target.value) : null)}
                                            placeholder="∞ Unlimited"
                                            className="bg-white/[0.03] border-white/10 h-11 rounded-xl text-[15px]"
                                        />
                                    </div>
                                </div>

                                {/* Pricing */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[12px] font-medium text-gray-400 uppercase tracking-wide">
                                            Pricing (Rp) — per month
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
                                                value={tier.price_monthly}
                                                onChange={(e) => handleChange(tier.id, "price_monthly", parseInt(e.target.value) || 0)}
                                                className="bg-white/[0.03] border-white/10 h-10 rounded-xl text-[14px]"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] text-gray-500">3-Month (per mo)</label>
                                            <Input
                                                type="number"
                                                value={tier.price_three_month}
                                                onChange={(e) => handleChange(tier.id, "price_three_month", parseInt(e.target.value) || 0)}
                                                className="bg-white/[0.03] border-white/10 h-10 rounded-xl text-[14px]"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] text-gray-500">Yearly (per mo)</label>
                                            <Input
                                                type="number"
                                                value={tier.price_yearly}
                                                onChange={(e) => handleChange(tier.id, "price_yearly", parseInt(e.target.value) || 0)}
                                                className="bg-white/[0.03] border-white/10 h-10 rounded-xl text-[14px]"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] text-gray-500">Original (strikethrough)</label>
                                            <Input
                                                type="number"
                                                value={tier.original_monthly}
                                                onChange={(e) => handleChange(tier.id, "original_monthly", parseInt(e.target.value) || 0)}
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
                                                Rp {formatPrice(tier.original_monthly)}
                                            </span>
                                        </div>
                                        <div className="flex items-baseline gap-1 mt-1">
                                            <span className="text-3xl font-bold">
                                                Rp {formatPrice(tier.price_yearly)}
                                            </span>
                                            <span className="text-gray-500 text-sm">/mo</span>
                                        </div>
                                        <p className="text-[12px] text-gray-500 mt-2">
                                            Billed Rp {formatPrice(tier.price_yearly * 12)}/year
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
