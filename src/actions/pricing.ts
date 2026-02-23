"use server";

import { createClient, createAdminClient } from "@/lib/supabase-server";

// =====================
// TYPES
// =====================

export interface PricingTier {
    id: string;
    name: string;
    tagline: string;
    icon: string;
    gradient: string;
    display_order: number;
    is_popular: boolean;
    max_events: number | null;
    max_photos: number | null;
    price_monthly: number;
    price_three_month: number;
    price_yearly: number;
    total_monthly: number;
    total_three_month: number;
    total_yearly: number;
    original_monthly: number;
    features: string[];
    portfolio_feature: string | null;
    cta: string;
    is_active: boolean;
}

// Fallback pricing in case DB is unavailable
const FALLBACK_TIERS: PricingTier[] = [
    {
        id: "starter", name: "Starter", tagline: "Perfect for beginners",
        icon: "Sparkles", gradient: "from-gray-500 to-slate-500",
        display_order: 1, is_popular: false, max_events: 10, max_photos: 300,
        price_monthly: 40000, price_three_month: 35000, price_yearly: 30000,
        total_monthly: 40000, total_three_month: 105000, total_yearly: 360000,
        original_monthly: 50000,
        features: ["10 Events per month", "Up to 300 photos/event", "Google Drive Sync", "WhatsApp Integration", "Email Support"],
        portfolio_feature: null, cta: "Get Started", is_active: true,
    },
    {
        id: "basic", name: "Basic", tagline: "For growing photographers",
        icon: "Crown", gradient: "from-blue-500 to-cyan-500",
        display_order: 2, is_popular: false, max_events: 20, max_photos: 500,
        price_monthly: 70000, price_three_month: 60000, price_yearly: 50000,
        total_monthly: 70000, total_three_month: 180000, total_yearly: 600000,
        original_monthly: 89000,
        features: ["20 Events per month", "Up to 500 photos/event", "Everything in Starter", "Email Support"],
        portfolio_feature: null, cta: "Get Started", is_active: true,
    },
    {
        id: "pro", name: "Pro", tagline: "Most popular choice",
        icon: "Zap", gradient: "from-purple-500 to-pink-500",
        display_order: 3, is_popular: true, max_events: 50, max_photos: null,
        price_monthly: 150000, price_three_month: 120000, price_yearly: 100000,
        total_monthly: 150000, total_three_month: 360000, total_yearly: 1200000,
        original_monthly: 199000,
        features: ["50 Events per month", "Unlimited photos/event", "Everything in Basic", "WhatsApp Support"],
        portfolio_feature: null, cta: "Go Pro", is_active: true,
    },
    {
        id: "unlimited", name: "Unlimited", tagline: "For studios & agencies",
        icon: "Rocket", gradient: "from-orange-500 to-red-500",
        display_order: 4, is_popular: false, max_events: null, max_photos: null,
        price_monthly: 300000, price_three_month: 240000, price_yearly: 200000,
        total_monthly: 300000, total_three_month: 720000, total_yearly: 2400000,
        original_monthly: 399000,
        features: ["Unlimited Events", "Unlimited Photos", "Everything in Pro", "WhatsApp Support"],
        portfolio_feature: "Portfolio Website Included", cta: "Contact Sales", is_active: true,
    },
];

// =====================
// READ OPERATIONS
// =====================

export async function getPricingTiers(): Promise<PricingTier[]> {
    try {
        // Use admin client first (always works, bypasses RLS)
        const adminSupabase = createAdminClient();
        if (adminSupabase) {
            const { data, error } = await adminSupabase
                .from("pricing_tiers")
                .select("*")
                .eq("is_active", true)
                .order("display_order", { ascending: true });

            if (!error && data && data.length > 0) {
                return data as PricingTier[];
            }
        }

        // Fallback to regular client
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("pricing_tiers")
            .select("*")
            .eq("is_active", true)
            .order("display_order", { ascending: true });

        if (error || !data || data.length === 0) {
            console.warn("Failed to fetch pricing from DB, using fallback:", error?.message);
            return FALLBACK_TIERS;
        }

        return data as PricingTier[];
    } catch {
        console.warn("pricing_tiers table may not exist yet, using fallback");
        return FALLBACK_TIERS;
    }
}

export async function getPricingTier(tierId: string): Promise<PricingTier | null> {
    try {
        // Use admin client first (always works, bypasses RLS)
        const adminSupabase = createAdminClient();
        if (adminSupabase) {
            const { data, error } = await adminSupabase
                .from("pricing_tiers")
                .select("*")
                .eq("id", tierId.toLowerCase())
                .single();

            if (!error && data) {
                return data as PricingTier;
            }
        }

        // Fallback to regular client
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("pricing_tiers")
            .select("*")
            .eq("id", tierId.toLowerCase())
            .single();

        if (error || !data) {
            return FALLBACK_TIERS.find(t => t.id === tierId.toLowerCase()) || null;
        }

        return data as PricingTier;
    } catch {
        return FALLBACK_TIERS.find(t => t.id === tierId.toLowerCase()) || null;
    }
}

// Get plan limits (replaces hardcoded PLAN_LIMITS)
export async function getPlanLimitsFromDB(tier: string | null): Promise<{ maxEvents: number; maxPhotos: number }> {
    const fallback = { maxEvents: 2, maxPhotos: 100 }; // free tier default
    if (!tier || tier === 'free') return fallback;

    const tierData = await getPricingTier(tier);
    if (!tierData) return fallback;

    return {
        maxEvents: tierData.max_events ?? Infinity,
        maxPhotos: tierData.max_photos ?? Infinity,
    };
}

// =====================
// ADMIN OPERATIONS
// =====================

export async function getAllPricingTiers(): Promise<{ tiers: PricingTier[]; error?: string }> {
    const adminSupabase = createAdminClient();
    if (!adminSupabase) {
        return { tiers: FALLBACK_TIERS, error: "Admin client not configured" };
    }

    const { data, error } = await adminSupabase
        .from("pricing_tiers")
        .select("*")
        .order("display_order", { ascending: true });

    if (error || !data || data.length === 0) {
        return { tiers: FALLBACK_TIERS, error: error?.message || "No data" };
    }

    return { tiers: data as PricingTier[] };
}

export async function updatePricingTier(
    id: string,
    updates: Partial<Omit<PricingTier, "id" | "created_at" | "is_active">>
): Promise<{ success: boolean; error?: string }> {
    const adminSupabase = createAdminClient();
    if (!adminSupabase) {
        return { success: false, error: "Admin client not configured" };
    }

    const { error } = await adminSupabase
        .from("pricing_tiers")
        .update(updates)
        .eq("id", id);

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true };
}

export async function savePricingTiers(
    tiers: PricingTier[]
): Promise<{ success: boolean; error?: string }> {
    const adminSupabase = createAdminClient();
    if (!adminSupabase) {
        return { success: false, error: "Admin client not configured" };
    }

    // Upsert all tiers
    for (const tier of tiers) {
        const { error } = await adminSupabase
            .from("pricing_tiers")
            .upsert({
                id: tier.id,
                name: tier.name,
                tagline: tier.tagline,
                icon: tier.icon,
                gradient: tier.gradient,
                display_order: tier.display_order,
                is_popular: tier.is_popular,
                max_events: tier.max_events,
                max_photos: tier.max_photos,
                price_monthly: tier.price_monthly,
                price_three_month: tier.price_three_month,
                price_yearly: tier.price_yearly,
                total_monthly: tier.total_monthly,
                total_three_month: tier.total_three_month,
                total_yearly: tier.total_yearly,
                original_monthly: tier.original_monthly,
                features: tier.features,
                portfolio_feature: tier.portfolio_feature,
                cta: tier.cta,
            }, { onConflict: "id" });

        if (error) {
            return { success: false, error: `Failed to save ${tier.name}: ${error.message}` };
        }
    }

    return { success: true };
}

// =====================
// DISCOUNT CODE VALIDATION
// =====================

export interface DiscountValidation {
    valid: boolean;
    discount_percentage: number;
    code_id: string;
    code: string;
    type: "redeem" | "affiliate";
    affiliate_code_id?: string;
    affiliate_id?: string;
    error?: string;
}

export async function validateDiscountCode(
    code: string,
    tier?: string
): Promise<DiscountValidation> {
    const adminSupabase = createAdminClient();
    if (!adminSupabase) {
        return { valid: false, discount_percentage: 0, code_id: "", code: "", type: "redeem", error: "Server error" };
    }

    const trimmedCode = code.toLowerCase().trim();

    // 1. Check redeem_codes first
    const { data: redeemCode } = await adminSupabase
        .from("redeem_codes")
        .select("*")
        .eq("code", trimmedCode)
        .eq("is_active", true)
        .single();

    if (redeemCode) {
        if (redeemCode.times_used >= redeemCode.max_uses) {
            return { valid: false, discount_percentage: 0, code_id: "", code: "", type: "redeem", error: "Code has reached maximum uses" };
        }
        if (!redeemCode.discount_percentage || redeemCode.discount_percentage <= 0) {
            return { valid: false, discount_percentage: 0, code_id: "", code: "", type: "redeem", error: "This is not a discount code. Use the Redeem Code section instead." };
        }
        if (tier && redeemCode.tier && redeemCode.tier.toLowerCase() !== 'all') {
            const applicableTiers = redeemCode.tier.toLowerCase().split(",").map((t: string) => t.trim());
            if (!applicableTiers.includes(tier.toLowerCase())) {
                return { valid: false, discount_percentage: 0, code_id: "", code: "", type: "redeem", error: `This code is not applicable for the ${tier} plan.` };
            }
        }
        return {
            valid: true,
            discount_percentage: redeemCode.discount_percentage,
            code_id: redeemCode.id,
            code: redeemCode.code,
            type: "redeem",
        };
    }

    // 2. Check affiliate_codes
    const { data: affCode } = await adminSupabase
        .from("affiliate_codes")
        .select("*, affiliates!inner(id, is_active)")
        .eq("code", trimmedCode)
        .eq("is_active", true)
        .single();

    if (affCode && affCode.affiliates?.is_active) {
        return {
            valid: true,
            discount_percentage: affCode.discount_percentage || 0,
            code_id: affCode.id,
            code: affCode.code,
            type: "affiliate",
            affiliate_code_id: affCode.id,
            affiliate_id: affCode.affiliates.id,
        };
    }

    return { valid: false, discount_percentage: 0, code_id: "", code: "", type: "redeem", error: "Invalid or expired code" };
}
