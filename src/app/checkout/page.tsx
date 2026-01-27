"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, AlertCircle, CreditCard } from "lucide-react";
import Link from "next/link";

// Helper format price
const formatPrice = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);

// 0.7% Fee
const FEE_PERCENT = 0.007;

const PRICING = {
    starter: { name: "Starter", monthly: 40000, threeMonth: 105000, yearly: 360000 },
    basic: { name: "Basic", monthly: 70000, threeMonth: 180000, yearly: 600000 },
    pro: { name: "Pro", monthly: 150000, threeMonth: 360000, yearly: 1200000 },
    unlimited: { name: "Unlimited", monthly: 300000, threeMonth: 720000, yearly: 2400000 },
};

function CheckoutContent() {
    const searchParams = useSearchParams();
    const tierParam = searchParams.get('tier');
    const cycleParam = searchParams.get('cycle');
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Calculate details
    const tier = PRICING[tierParam?.toLowerCase() as keyof typeof PRICING];
    const cycle = cycleParam as 'monthly' | '3-month' | 'yearly';

    let basePrice = 0;
    if (tier && cycle) {
        if (cycle === 'monthly') basePrice = tier.monthly;
        else if (cycle === '3-month') basePrice = tier.threeMonth;
        else if (cycle === 'yearly') basePrice = tier.yearly;
    }

    // Fee calculation
    const total = basePrice > 0 ? Math.ceil(basePrice / (1 - FEE_PERCENT)) : 0;
    const fee = total - basePrice;

    const handlePayment = async () => {
        setLoading(true);
        setError("");

        try {
            const res = await fetch('/api/payment/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tier: tierParam, cycle: cycleParam }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to create payment");

            // Redirect to Midtrans payment page
            if (data.redirectUrl) {
                window.location.href = data.redirectUrl;
            } else {
                throw new Error("No payment URL received");
            }

        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    if (!tier || !basePrice) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
                <div className="text-center">
                    <h1 className="text-xl font-bold mb-4">Invalid Plan Selected</h1>
                    <Link href="/pricing"><Button>Back to Pricing</Button></Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-8">
            <div className="max-w-md mx-auto">
                <Link href="/pricing" className="text-gray-400 hover:text-white flex items-center gap-2 mb-8 text-sm">
                    <ArrowLeft size={16} /> Cancel & Back
                </Link>

                <div className="glass border border-white/10 rounded-3xl p-6 md:p-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-pink-500" />

                    <h1 className="text-2xl font-bold mb-6">Checkout</h1>

                    {/* Order Summary */}
                    <div className="space-y-4 mb-8">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400">Plan</span>
                            <span className="font-bold text-lg">{tier.name}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400">Duration</span>
                            <span className="capitalize">{cycle.replace('-', ' ')}</span>
                        </div>
                        <div className="h-px bg-white/10 my-4" />
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400">Price</span>
                            <span>{formatPrice(basePrice)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400">Admin Fee (0.7%)</span>
                            <span>{formatPrice(fee)}</span>
                        </div>
                        <div className="h-px bg-white/10 my-4" />
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-lg">Total</span>
                            <span className="font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                                {formatPrice(total)}
                            </span>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 flex items-start gap-3">
                            <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={16} />
                            <p className="text-red-200 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Payment Info */}
                    <div className="bg-white/5 rounded-xl p-4 mb-6">
                        <div className="flex items-center gap-3 mb-2">
                            <CreditCard className="text-purple-400" size={20} />
                            <span className="font-bold">Payment Methods</span>
                        </div>
                        <p className="text-gray-400 text-sm">
                            GoPay, ShopeePay, QRIS, Bank Transfer, dan lainnya tersedia di halaman pembayaran.
                        </p>
                    </div>

                    {/* Pay Button */}
                    <Button
                        onClick={handlePayment}
                        disabled={loading}
                        className="w-full h-12 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-900/20"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Redirecting...
                            </>
                        ) : (
                            "Proceed to Payment"
                        )}
                    </Button>

                    <p className="text-center text-gray-500 text-xs mt-4">
                        🔒 Secure payment powered by Midtrans
                    </p>
                </div>
            </div>
        </div>
    );
}

// Wrapper with Suspense for Next.js 14+ compatibility
export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <Loader2 className="animate-spin" size={32} />
            </div>
        }>
            <CheckoutContent />
        </Suspense>
    );
}
