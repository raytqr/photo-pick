"use client";

import { useState, useEffect } from "react";
import {
    getRedeemCodes,
    createRedeemCode,
    updateRedeemCode,
    deleteRedeemCode
} from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Plus,
    Trash2,
    Check,
    X,
    Ticket,
    Calendar,
    Users,
    Clock,
    Sparkles,
    Copy,
    Crown
} from "lucide-react";

interface RedeemCode {
    id: string;
    code: string;
    tier: string;
    events_granted: number;
    duration_days: number;
    max_uses: number;
    times_used: number;
    is_active: boolean;
    created_at: string;
}

const TIERS = [
    { value: "Starter", color: "from-gray-500 to-slate-500" },
    { value: "Basic", color: "from-blue-500 to-cyan-500" },
    { value: "Pro", color: "from-purple-500 to-pink-500" },
    { value: "Unlimited", color: "from-orange-500 to-red-500" },
];

function getTierStyle(tier: string) {
    switch (tier.toLowerCase()) {
        case "unlimited":
            return "bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-400 border-orange-500/30";
        case "pro":
            return "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30";
        case "basic":
            return "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-400 border-blue-500/30";
        default:
            return "bg-gradient-to-r from-gray-500/20 to-slate-500/20 text-gray-300 border-gray-500/30";
    }
}

export default function AdminRedeemCodesPage() {
    const [codes, setCodes] = useState<RedeemCode[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        code: "",
        tier: "Starter",
        events_granted: 5,
        duration_days: 30,
        max_uses: 1,
    });

    const loadCodes = async () => {
        setLoading(true);
        const result = await getRedeemCodes();
        if (!result.error) {
            setCodes(result.codes);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadCodes();
    }, []);

    const handleCreate = async () => {
        if (!formData.code.trim()) return;

        setSaving(true);
        const result = await createRedeemCode(formData);

        if (result.error) {
            alert(result.error);
        } else {
            setShowForm(false);
            setFormData({
                code: "",
                tier: "Starter",
                events_granted: 5,
                duration_days: 30,
                max_uses: 1,
            });
            loadCodes();
        }
        setSaving(false);
    };

    const handleToggleActive = async (id: string, currentActive: boolean) => {
        await updateRedeemCode(id, { is_active: !currentActive });
        loadCodes();
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this code?")) return;
        await deleteRedeemCode(id);
        loadCodes();
    };

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopied(code);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="space-y-6 max-w-6xl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Redeem Codes</h1>
                    <p className="text-gray-500 text-[15px]">
                        {codes.length} codes available
                    </p>
                </div>
                <Button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl h-11 px-5 font-semibold shadow-lg shadow-purple-500/20"
                >
                    <Plus size={18} className="mr-2" />
                    Create Code
                </Button>
            </div>

            {/* Create Form */}
            {showForm && (
                <div className="bg-gradient-to-br from-purple-500/5 to-pink-500/5 border border-purple-500/20 rounded-2xl p-6 space-y-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                            <Sparkles size={18} />
                        </div>
                        <div>
                            <h2 className="font-semibold">Create New Code</h2>
                            <p className="text-gray-500 text-sm">Configure your promo code settings</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Code</label>
                            <Input
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                placeholder="e.g. PROMO2024"
                                className="bg-white/[0.03] border-white/10 h-11 rounded-xl font-mono"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Tier</label>
                            <div className="grid grid-cols-2 gap-2">
                                {TIERS.map((tier) => (
                                    <button
                                        key={tier.value}
                                        onClick={() => setFormData({ ...formData, tier: tier.value })}
                                        className={`h-11 rounded-xl text-sm font-medium transition-all ${formData.tier === tier.value
                                                ? `bg-gradient-to-r ${tier.color} text-white shadow-lg`
                                                : "bg-white/[0.03] border border-white/10 text-gray-400 hover:bg-white/[0.06]"
                                            }`}
                                    >
                                        {tier.value}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Events Granted</label>
                            <Input
                                type="number"
                                value={formData.events_granted}
                                onChange={(e) => setFormData({ ...formData, events_granted: parseInt(e.target.value) || 0 })}
                                className="bg-white/[0.03] border-white/10 h-11 rounded-xl"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Duration (Days)</label>
                            <Input
                                type="number"
                                value={formData.duration_days}
                                onChange={(e) => setFormData({ ...formData, duration_days: parseInt(e.target.value) || 0 })}
                                className="bg-white/[0.03] border-white/10 h-11 rounded-xl"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Max Uses</label>
                            <Input
                                type="number"
                                value={formData.max_uses}
                                onChange={(e) => setFormData({ ...formData, max_uses: parseInt(e.target.value) || 1 })}
                                className="bg-white/[0.03] border-white/10 h-11 rounded-xl"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button
                            onClick={handleCreate}
                            disabled={saving || !formData.code.trim()}
                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-xl h-11 px-6 font-semibold"
                        >
                            {saving ? "Creating..." : "Create Code"}
                        </Button>
                        <Button
                            onClick={() => setShowForm(false)}
                            variant="outline"
                            className="border-white/10 hover:bg-white/[0.03] rounded-xl h-11 px-6"
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            )}

            {/* Codes Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : codes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center mb-4">
                        <Ticket size={28} className="text-gray-600" />
                    </div>
                    <p className="text-gray-400 font-medium">No codes yet</p>
                    <p className="text-gray-600 text-sm">Create your first promo code above</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {codes.map((code) => {
                        const usagePercent = (code.times_used / code.max_uses) * 100;

                        return (
                            <div
                                key={code.id}
                                className={`group bg-white/[0.02] hover:bg-white/[0.04] border rounded-2xl p-5 transition-all duration-300 ${code.is_active ? "border-white/[0.06] hover:border-white/10" : "border-red-500/20 opacity-60"
                                    }`}
                            >
                                <div className="flex items-center gap-5">
                                    {/* Code Icon */}
                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${code.tier === "Unlimited" ? "from-orange-500 to-red-500" :
                                            code.tier === "Pro" ? "from-purple-500 to-pink-500" :
                                                code.tier === "Basic" ? "from-blue-500 to-cyan-500" :
                                                    "from-gray-500 to-slate-500"
                                        } flex items-center justify-center shrink-0 shadow-lg`}>
                                        <Ticket size={24} className="text-white" />
                                    </div>

                                    {/* Code Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <button
                                                onClick={() => copyCode(code.code)}
                                                className="group/copy flex items-center gap-2 bg-white/[0.05] hover:bg-white/[0.08] px-3 py-1.5 rounded-lg transition-colors"
                                            >
                                                <code className="font-mono font-bold text-lg tracking-wide">
                                                    {code.code.toUpperCase()}
                                                </code>
                                                {copied === code.code ? (
                                                    <Check size={14} className="text-green-400" />
                                                ) : (
                                                    <Copy size={14} className="text-gray-500 group-hover/copy:text-gray-300" />
                                                )}
                                            </button>

                                            <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${getTierStyle(code.tier)}`}>
                                                <Crown size={10} className="inline mr-1 -mt-0.5" />
                                                {code.tier}
                                            </span>
                                        </div>

                                        {/* Stats */}
                                        <div className="flex items-center gap-6 text-[13px] text-gray-400">
                                            <span className="flex items-center gap-1.5">
                                                <Sparkles size={13} className="text-purple-400" />
                                                {code.events_granted.toLocaleString()} events
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Clock size={13} className="text-blue-400" />
                                                {code.duration_days} days
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Users size={13} className="text-orange-400" />
                                                {code.times_used}/{code.max_uses} used
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            onClick={() => handleToggleActive(code.id, code.is_active)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all ${code.is_active
                                                    ? "bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20"
                                                    : "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
                                                }`}
                                        >
                                            {code.is_active ? <Check size={14} /> : <X size={14} />}
                                            {code.is_active ? "Active" : "Inactive"}
                                        </button>

                                        <button
                                            onClick={() => handleDelete(code.id)}
                                            className="p-2.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* Usage Bar */}
                                <div className="mt-4 pt-4 border-t border-white/[0.04]">
                                    <div className="flex items-center justify-between text-[12px] mb-2">
                                        <span className="text-gray-500">Usage</span>
                                        <span className="text-gray-400">{usagePercent.toFixed(0)}%</span>
                                    </div>
                                    <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all ${usagePercent >= 90 ? "bg-red-500" :
                                                    usagePercent >= 50 ? "bg-yellow-500" :
                                                        "bg-green-500"
                                                }`}
                                            style={{ width: `${Math.min(usagePercent, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
