"use client";

import { useState, useEffect } from "react";
import {
    getAffiliates,
    createAffiliate,
    updateAffiliate,
    deleteAffiliate,
    getAffiliateCodes,
    createAffiliateCode,
    deleteAffiliateCode,
    getAffiliateTransactions,
    type Affiliate,
    type AffiliateCode,
    type AffiliateTransaction,
} from "@/actions/affiliate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Plus, Trash2, Users, DollarSign, Copy, Eye, X, Check, Link2, Percent, Hash, ChevronDown, ChevronUp,
} from "lucide-react";

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);

export default function AdminAffiliatesPage() {
    const [affiliates, setAffiliates] = useState<(Affiliate & { codes_count: number })[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [saving, setSaving] = useState(false);

    // Create form state
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [commissionType, setCommissionType] = useState<"percentage" | "fixed">("percentage");
    const [commissionValue, setCommissionValue] = useState(10);
    const [notes, setNotes] = useState("");

    // Expanded affiliate (to show codes & transactions)
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [codes, setCodes] = useState<AffiliateCode[]>([]);
    const [transactions, setTransactions] = useState<AffiliateTransaction[]>([]);
    const [detailLoading, setDetailLoading] = useState(false);

    // New code form
    const [newCode, setNewCode] = useState("");
    const [newDiscountPct, setNewDiscountPct] = useState(10);

    useEffect(() => { loadAffiliates(); }, []);

    const loadAffiliates = async () => {
        setLoading(true);
        const res = await getAffiliates();
        setAffiliates(res.affiliates || []);
        setLoading(false);
    };

    const handleCreate = async () => {
        if (!name || !email || !password) return;
        setSaving(true);
        const res = await createAffiliate({ name, email, phone, password, commission_type: commissionType, commission_value: commissionValue, notes });
        if (res.error) alert(res.error);
        else {
            setShowCreate(false);
            setName(""); setEmail(""); setPhone(""); setPassword(""); setNotes("");
            loadAffiliates();
        }
        setSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Hapus affiliate ini? Semua kode dan transaksinya akan ikut terhapus.")) return;
        await deleteAffiliate(id);
        loadAffiliates();
    };

    const handleToggleActive = async (id: string, currentActive: boolean) => {
        await updateAffiliate(id, { is_active: !currentActive });
        loadAffiliates();
    };

    const toggleExpand = async (affiliateId: string) => {
        if (expandedId === affiliateId) {
            setExpandedId(null);
            return;
        }
        setExpandedId(affiliateId);
        setDetailLoading(true);
        const [codesRes, txRes] = await Promise.all([
            getAffiliateCodes(affiliateId),
            getAffiliateTransactions(affiliateId),
        ]);
        setCodes(codesRes.codes);
        setTransactions(txRes.transactions);
        setDetailLoading(false);
    };

    const handleCreateCode = async (affiliateId: string) => {
        if (!newCode) return;
        const res = await createAffiliateCode({ affiliate_id: affiliateId, code: newCode, discount_percentage: newDiscountPct });
        if (res.error) alert(res.error);
        else {
            setNewCode(""); setNewDiscountPct(10);
            const codesRes = await getAffiliateCodes(affiliateId);
            setCodes(codesRes.codes);
            loadAffiliates();
        }
    };

    const handleDeleteCode = async (codeId: string, affiliateId: string) => {
        if (!confirm("Hapus kode ini?")) return;
        await deleteAffiliateCode(codeId);
        const codesRes = await getAffiliateCodes(affiliateId);
        setCodes(codesRes.codes);
        loadAffiliates();
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const totalEarned = affiliates.reduce((sum, a) => sum + (a.total_earned || 0), 0);
    const totalCodes = affiliates.reduce((sum, a) => sum + (a.codes_count || 0), 0);

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
                            Affiliate Program
                        </h1>
                        <p className="text-gray-400 text-sm mt-1">Kelola affiliate, kode, dan komisi</p>
                    </div>
                    <Button
                        onClick={() => setShowCreate(!showCreate)}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 font-bold"
                    >
                        <Plus size={16} className="mr-2" /> Tambah Affiliate
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="glass border border-white/10 rounded-2xl p-4">
                        <div className="text-gray-400 text-xs mb-1">Total Affiliates</div>
                        <div className="text-2xl font-black flex items-center gap-2">
                            <Users size={20} className="text-purple-400" /> {affiliates.length}
                        </div>
                    </div>
                    <div className="glass border border-white/10 rounded-2xl p-4">
                        <div className="text-gray-400 text-xs mb-1">Total Kode</div>
                        <div className="text-2xl font-black flex items-center gap-2">
                            <Link2 size={20} className="text-blue-400" /> {totalCodes}
                        </div>
                    </div>
                    <div className="glass border border-white/10 rounded-2xl p-4">
                        <div className="text-gray-400 text-xs mb-1">Total Komisi</div>
                        <div className="text-2xl font-black flex items-center gap-2">
                            <DollarSign size={20} className="text-green-400" /> {formatCurrency(totalEarned)}
                        </div>
                    </div>
                </div>

                {/* Create Form */}
                {showCreate && (
                    <div className="glass border border-purple-500/30 rounded-2xl p-6 mb-8">
                        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Plus size={18} className="text-purple-400" /> Buat Affiliate Baru
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Nama *</label>
                                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama affiliate" className="bg-white/5 border-white/10" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Email *</label>
                                <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" className="bg-white/5 border-white/10" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Phone</label>
                                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08xxx" className="bg-white/5 border-white/10" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Password *</label>
                                <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password untuk login" className="bg-white/5 border-white/10" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Jenis Komisi</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setCommissionType("percentage")}
                                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${commissionType === "percentage" ? "bg-purple-600" : "bg-white/5 text-gray-400"}`}
                                    >
                                        <Percent size={14} className="inline mr-1" /> Persentase
                                    </button>
                                    <button
                                        onClick={() => setCommissionType("fixed")}
                                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${commissionType === "fixed" ? "bg-purple-600" : "bg-white/5 text-gray-400"}`}
                                    >
                                        <Hash size={14} className="inline mr-1" /> Fixed
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">
                                    Nilai Komisi {commissionType === "percentage" ? "(%)" : "(Rp per transaksi)"}
                                </label>
                                <Input
                                    type="number"
                                    value={commissionValue}
                                    onChange={(e) => setCommissionValue(Number(e.target.value))}
                                    className="bg-white/5 border-white/10"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs text-gray-400 mb-1 block">Catatan</label>
                                <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Catatan opsional" className="bg-white/5 border-white/10" />
                            </div>
                        </div>
                        <div className="flex gap-2 mt-4 justify-end">
                            <Button variant="outline" onClick={() => setShowCreate(false)} className="border-white/10">Batal</Button>
                            <Button onClick={handleCreate} disabled={saving || !name || !email || !password} className="bg-gradient-to-r from-purple-600 to-pink-600 font-bold">
                                {saving ? "Menyimpan..." : "Simpan"}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Affiliates List */}
                {loading ? (
                    <div className="text-center py-12 text-gray-400">Loading...</div>
                ) : affiliates.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <Users size={48} className="mx-auto mb-4 opacity-50" />
                        <p>Belum ada affiliate</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {affiliates.map((aff) => (
                            <div key={aff.id} className="glass border border-white/10 rounded-2xl overflow-hidden">
                                {/* Affiliate Row */}
                                <div className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${aff.is_active ? "bg-purple-600" : "bg-gray-700"}`}>
                                            {aff.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-bold flex items-center gap-2">
                                                {aff.name}
                                                {!aff.is_active && (
                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">Nonaktif</span>
                                                )}
                                            </div>
                                            <div className="text-sm text-gray-400">{aff.email}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <div className="text-xs text-gray-400">Komisi</div>
                                            <div className="font-bold text-sm">
                                                {aff.commission_type === "percentage" ? `${aff.commission_value}%` : formatCurrency(aff.commission_value)}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-gray-400">Total Earned</div>
                                            <div className="font-bold text-green-400 text-sm">{formatCurrency(aff.total_earned || 0)}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-gray-400">Kode</div>
                                            <div className="font-bold text-sm">{aff.codes_count}</div>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button size="sm" variant="ghost" onClick={() => toggleExpand(aff.id)} className="text-gray-400 hover:text-white">
                                                {expandedId === aff.id ? <ChevronUp size={16} /> : <Eye size={16} />}
                                            </Button>
                                            <Button size="sm" variant="ghost" onClick={() => handleToggleActive(aff.id, aff.is_active)} className={aff.is_active ? "text-green-400" : "text-red-400"}>
                                                {aff.is_active ? <Check size={16} /> : <X size={16} />}
                                            </Button>
                                            <Button size="sm" variant="ghost" onClick={() => handleDelete(aff.id)} className="text-red-400 hover:text-red-300">
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Detail */}
                                {expandedId === aff.id && (
                                    <div className="border-t border-white/10 p-4 bg-white/[0.02]">
                                        {detailLoading ? (
                                            <div className="text-center py-4 text-gray-400">Loading...</div>
                                        ) : (
                                            <div className="grid md:grid-cols-2 gap-6">
                                                {/* Codes Section */}
                                                <div>
                                                    <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                                                        <Link2 size={14} className="text-purple-400" /> Kode Affiliate
                                                    </h3>

                                                    {/* Add Code Form */}
                                                    <div className="flex gap-2 mb-3">
                                                        <Input
                                                            value={newCode}
                                                            onChange={(e) => setNewCode(e.target.value)}
                                                            placeholder="Kode baru"
                                                            className="bg-white/5 border-white/10 text-sm flex-1"
                                                        />
                                                        <Input
                                                            type="number"
                                                            value={newDiscountPct}
                                                            onChange={(e) => setNewDiscountPct(Number(e.target.value))}
                                                            className="bg-white/5 border-white/10 text-sm w-20"
                                                            placeholder="%"
                                                        />
                                                        <Button size="sm" onClick={() => handleCreateCode(aff.id)} className="bg-purple-600 shrink-0">
                                                            <Plus size={14} />
                                                        </Button>
                                                    </div>

                                                    {codes.length === 0 ? (
                                                        <p className="text-gray-500 text-xs">Belum ada kode</p>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            {codes.map((c) => (
                                                                <div key={c.id} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                                                                    <div>
                                                                        <span className="font-mono font-bold text-purple-300 text-sm">{c.code}</span>
                                                                        <span className="text-xs text-gray-400 ml-2">Diskon {c.discount_percentage}%</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-xs text-gray-400">{c.times_used}x dipakai</span>
                                                                        <button onClick={() => copyToClipboard(c.code)} className="text-gray-400 hover:text-white">
                                                                            <Copy size={12} />
                                                                        </button>
                                                                        <button onClick={() => handleDeleteCode(c.id, aff.id)} className="text-red-400 hover:text-red-300">
                                                                            <Trash2 size={12} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Transactions Section */}
                                                <div>
                                                    <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                                                        <DollarSign size={14} className="text-green-400" /> Riwayat Transaksi
                                                    </h3>
                                                    {transactions.length === 0 ? (
                                                        <p className="text-gray-500 text-xs">Belum ada transaksi</p>
                                                    ) : (
                                                        <div className="space-y-2 max-h-60 overflow-y-auto">
                                                            {transactions.map((tx) => (
                                                                <div key={tx.id} className="bg-white/5 rounded-lg px-3 py-2">
                                                                    <div className="flex justify-between items-center">
                                                                        <div>
                                                                            <div className="text-xs font-mono text-gray-400">{tx.order_id}</div>
                                                                            <div className="text-xs text-gray-500">
                                                                                {tx.tier} • {tx.billing_cycle} • {new Date(tx.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                                                                            </div>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <div className="text-sm font-bold text-green-400">{formatCurrency(tx.commission_amount)}</div>
                                                                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${tx.status === "paid" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                                                                                {tx.status}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
