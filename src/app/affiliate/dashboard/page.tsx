"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    getAffiliateSession,
    getMyAffiliateData,
    affiliateLogout,
    type Affiliate,
    type AffiliateCode,
    type AffiliateTransaction,
} from "@/actions/affiliate";
import { Button } from "@/components/ui/button";
import {
    DollarSign, Link2, TrendingUp, LogOut, Copy, Check, Clock, ShoppingCart, Percent, Users,
} from "lucide-react";

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);

export default function AffiliateDashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
    const [codes, setCodes] = useState<AffiliateCode[]>([]);
    const [transactions, setTransactions] = useState<AffiliateTransaction[]>([]);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const session = await getAffiliateSession();
        if (!session) {
            router.push("/affiliate/login");
            return;
        }

        const res = await getMyAffiliateData();
        if (res.error) {
            router.push("/affiliate/login");
            return;
        }

        setAffiliate(res.affiliate!);
        setCodes(res.codes!);
        setTransactions(res.transactions!);
        setLoading(false);
    };

    const handleLogout = async () => {
        await affiliateLogout();
        router.push("/affiliate/login");
    };

    const copyToClipboard = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-gray-400">Loading...</div>
            </div>
        );
    }

    if (!affiliate) return null;

    const totalUsed = codes.reduce((sum, c) => sum + c.times_used, 0);
    const pendingCommission = transactions.filter(t => t.status === "pending").reduce((sum, t) => sum + t.commission_amount, 0);
    const paidCommission = transactions.filter(t => t.status === "paid").reduce((sum, t) => sum + t.commission_amount, 0);

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-black">
                            Halo, <span className="bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">{affiliate.name}</span> 👋
                        </h1>
                        <p className="text-gray-400 text-sm mt-1">Affiliate Dashboard</p>
                    </div>
                    <Button variant="outline" onClick={handleLogout} className="border-white/10 text-gray-400 hover:text-white">
                        <LogOut size={16} className="mr-2" /> Logout
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="glass border border-white/10 rounded-2xl p-4">
                        <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
                            <DollarSign size={14} className="text-green-400" /> Total Komisi
                        </div>
                        <div className="text-xl font-black text-green-400">{formatCurrency(affiliate.total_earned)}</div>
                    </div>
                    <div className="glass border border-white/10 rounded-2xl p-4">
                        <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
                            <Clock size={14} className="text-yellow-400" /> Pending
                        </div>
                        <div className="text-xl font-black text-yellow-400">{formatCurrency(pendingCommission)}</div>
                    </div>
                    <div className="glass border border-white/10 rounded-2xl p-4">
                        <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
                            <ShoppingCart size={14} className="text-blue-400" /> Total Transaksi
                        </div>
                        <div className="text-xl font-black">{transactions.length}</div>
                    </div>
                    <div className="glass border border-white/10 rounded-2xl p-4">
                        <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
                            <TrendingUp size={14} className="text-purple-400" /> Kode Dipakai
                        </div>
                        <div className="text-xl font-black">{totalUsed}x</div>
                    </div>
                </div>

                {/* Commission Info */}
                <div className="glass border border-white/10 rounded-2xl p-4 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-600/20 flex items-center justify-center">
                            <Percent size={20} className="text-purple-400" />
                        </div>
                        <div>
                            <div className="font-bold text-sm">Komisi Anda</div>
                            <div className="text-gray-400 text-xs">
                                {affiliate.commission_type === "percentage"
                                    ? `${affiliate.commission_value}% dari setiap pembayaran yang menggunakan kode Anda`
                                    : `${formatCurrency(affiliate.commission_value)} per transaksi yang menggunakan kode Anda`
                                }
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* My Codes */}
                    <div>
                        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Link2 size={18} className="text-purple-400" /> Kode Anda
                        </h2>
                        {codes.length === 0 ? (
                            <div className="glass border border-white/10 rounded-2xl p-6 text-center text-gray-400">
                                <Link2 size={32} className="mx-auto mb-2 opacity-50" />
                                <p className="text-sm">Belum ada kode. Hubungi admin untuk mendapatkan kode affiliate.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {codes.map((c) => (
                                    <div key={c.id} className="glass border border-white/10 rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <span className="font-mono font-black text-lg text-purple-300 tracking-wider">{c.code.toUpperCase()}</span>
                                                <button
                                                    onClick={() => copyToClipboard(c.code)}
                                                    className="text-gray-400 hover:text-white transition-colors"
                                                >
                                                    {copiedCode === c.code ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                                                </button>
                                            </div>
                                            <span className={`text-xs px-2 py-1 rounded-full font-bold ${c.is_active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                                                {c.is_active ? "Aktif" : "Nonaktif"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-gray-400">
                                            <span>Diskon: <span className="text-white font-bold">{c.discount_percentage}%</span></span>
                                            <span>Dipakai: <span className="text-white font-bold">{c.times_used}x</span></span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Recent Transactions */}
                    <div>
                        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <ShoppingCart size={18} className="text-green-400" /> Riwayat Transaksi
                        </h2>
                        {transactions.length === 0 ? (
                            <div className="glass border border-white/10 rounded-2xl p-6 text-center text-gray-400">
                                <ShoppingCart size={32} className="mx-auto mb-2 opacity-50" />
                                <p className="text-sm">Belum ada transaksi. Bagikan kode affiliate Anda untuk mulai menghasilkan!</p>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                                {transactions.map((tx) => (
                                    <div key={tx.id} className="glass border border-white/10 rounded-xl p-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="text-xs font-mono text-gray-500">{tx.order_id}</div>
                                                <div className="text-sm mt-0.5">
                                                    <span className="capitalize font-bold">{tx.tier}</span>
                                                    <span className="text-gray-400 text-xs ml-1">({tx.billing_cycle})</span>
                                                </div>
                                                <div className="text-xs text-gray-500 mt-0.5">
                                                    {new Date(tx.created_at).toLocaleDateString("id-ID", {
                                                        day: "numeric", month: "short", year: "numeric",
                                                        hour: "2-digit", minute: "2-digit"
                                                    })}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-green-400">{formatCurrency(tx.commission_amount)}</div>
                                                <div className="text-xs text-gray-500">dari {formatCurrency(tx.payment_amount)}</div>
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${tx.status === "paid" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                                                    {tx.status === "paid" ? "Dibayar" : "Pending"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
