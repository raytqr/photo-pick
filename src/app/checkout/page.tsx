"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2, AlertCircle, CreditCard, Tag, Percent, Gift } from "lucide-react";
import { getPricingTier, validateDiscountCode } from "@/actions/pricing";
import Link from "next/link";

// Helper format price
const formatPrice = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);

// 0.7% Fee
const FEE_PERCENT = 0.007;

function CheckoutContent() {
    const searchParams = useSearchParams();
    const tierParam = searchParams.get('tier');
    const cycleParam = searchParams.get('cycle') as 'monthly' | '3-month' | 'yearly';
    const codeParam = searchParams.get('code');
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [error, setError] = useState("");
    const [tierName, setTierName] = useState("");
    const [basePrice, setBasePrice] = useState(0);

    // Discount state
    const [discountCode, setDiscountCode] = useState(codeParam || "");
    const [discountPercentage, setDiscountPercentage] = useState(0);
    const [discountApplied, setDiscountApplied] = useState(false);
    const [discountLoading, setDiscountLoading] = useState(false);
    const [discountError, setDiscountError] = useState("");

    useEffect(() => {
        loadPricing();
    }, [tierParam, cycleParam]);

    // Auto-validate code from URL on load
    useEffect(() => {
        if (codeParam && basePrice > 0) {
            applyDiscountCode(codeParam);
        }
    }, [codeParam, basePrice]);

    const loadPricing = async () => {
        if (!tierParam || !cycleParam) {
            setPageLoading(false);
            return;
        }

        const tier = await getPricingTier(tierParam);
        if (!tier) {
            setPageLoading(false);
            return;
        }

        setTierName(tier.name);

        let price = 0;
        if (cycleParam === 'monthly') price = tier.total_monthly || tier.price_monthly;
        else if (cycleParam === '3-month') price = tier.total_three_month;
        else if (cycleParam === 'yearly') price = tier.total_yearly;

        setBasePrice(price);
        setPageLoading(false);
    };

    const applyDiscountCode = async (code?: string) => {
        const codeToValidate = code || discountCode;
        if (!codeToValidate) return;

        setDiscountLoading(true);
        setDiscountError("");

        try {
            const result = await validateDiscountCode(codeToValidate, tierParam || undefined);
            if (result.valid) {
                setDiscountPercentage(result.discount_percentage);
                setDiscountApplied(true);
                setDiscountCode(result.code);
            } else {
                setDiscountError(result.error || "Invalid code");
                setDiscountApplied(false);
                setDiscountPercentage(0);
            }
        } catch {
            setDiscountError("Failed to validate code");
        } finally {
            setDiscountLoading(false);
        }
    };

    const removeDiscount = () => {
        setDiscountApplied(false);
        setDiscountPercentage(0);
        setDiscountCode("");
        setDiscountError("");
    };

    // Calculate prices
    const discountAmount = discountApplied ? Math.round(basePrice * discountPercentage / 100) : 0;
    const priceAfterDiscount = basePrice - discountAmount;
    const total = priceAfterDiscount > 0 ? Math.ceil(priceAfterDiscount / (1 - FEE_PERCENT)) : 0;
    const fee = total - priceAfterDiscount;

    const handlePayment = async () => {
        setLoading(true);
        setError("");

        try {
            const res = await fetch('/api/payment/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tier: tierParam,
                    cycle: cycleParam,
                    discountCode: discountApplied ? discountCode : undefined,
                }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to create payment");

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

    if (pageLoading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <Loader2 className="animate-spin" size={32} />
            </div>
        );
    }

    if (!tierName || !basePrice) {
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
                <Link href="/dashboard/pricing" className="text-gray-400 hover:text-white flex items-center gap-2 mb-8 text-sm">
                    <ArrowLeft size={16} /> Cancel & Back
                </Link>

                <div className="glass border border-white/10 rounded-3xl p-6 md:p-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-pink-500" />

                    <h1 className="text-2xl font-bold mb-6">Checkout</h1>

                    {/* Order Summary */}
                    <div className="space-y-4 mb-6">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400">Plan</span>
                            <span className="font-bold text-lg">{tierName}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400">Duration</span>
                            <span className="capitalize">{(cycleParam || '').replace('-', ' ')}</span>
                        </div>
                        <div className="h-px bg-white/10 my-4" />
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400">Price</span>
                            <span>{formatPrice(basePrice)}</span>
                        </div>

                        {/* Discount */}
                        {discountApplied && (
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-green-400 flex items-center gap-1.5">
                                    <Tag size={14} />
                                    Discount ({discountPercentage}%)
                                </span>
                                <span className="text-green-400 font-bold">-{formatPrice(discountAmount)}</span>
                            </div>
                        )}

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

                    {/* Discount Code Input */}
                    {!discountApplied ? (
                        <div className="mb-6 bg-white/5 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Gift size={16} className="text-purple-400" />
                                <span className="text-sm font-bold">Discount Code</span>
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Enter discount code"
                                    value={discountCode}
                                    onChange={(e) => {
                                        setDiscountCode(e.target.value);
                                        setDiscountError("");
                                    }}
                                    className="bg-white/5 border-white/10 text-sm"
                                />
                                <Button
                                    onClick={() => applyDiscountCode()}
                                    disabled={discountLoading || !discountCode}
                                    size="sm"
                                    className="bg-purple-600 hover:bg-purple-700 font-bold shrink-0"
                                >
                                    {discountLoading ? <Loader2 size={14} className="animate-spin" /> : "Apply"}
                                </Button>
                            </div>
                            {discountError && (
                                <p className="text-red-400 text-xs mt-2">{discountError}</p>
                            )}
                        </div>
                    ) : (
                        <div className="mb-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Percent size={16} className="text-green-400" />
                                    <span className="text-sm font-bold text-green-300">
                                        {discountPercentage}% discount applied
                                    </span>
                                    <span className="text-xs text-gray-400 bg-white/5 px-2 py-0.5 rounded-full uppercase">
                                        {discountCode}
                                    </span>
                                </div>
                                <button
                                    onClick={removeDiscount}
                                    className="text-xs text-gray-400 hover:text-white"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    )}

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
