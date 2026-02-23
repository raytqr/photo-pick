import { createClient } from "@/lib/supabase-server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { format } from "date-fns";
import { NextResponse } from "next/server";
import { calculateTotalWithFee, createSnapTransaction } from "@/lib/midtrans";

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { tier, cycle, discountCode } = body;

        if (!tier || !cycle) {
            return NextResponse.json({ error: "Missing tier or cycle" }, { status: 400 });
        }

        // 1. Fetch pricing from database
        const adminClient = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { data: pricingTier } = await adminClient
            .from("pricing_tiers")
            .select("*")
            .eq("id", tier.toLowerCase())
            .single();

        // Fallback pricing if DB not available
        const FALLBACK_PRICING: Record<string, { monthly: number; threeMonth: number; yearly: number }> = {
            starter: { monthly: 40000, threeMonth: 105000, yearly: 360000 },
            basic: { monthly: 70000, threeMonth: 180000, yearly: 600000 },
            pro: { monthly: 150000, threeMonth: 360000, yearly: 1200000 },
            unlimited: { monthly: 300000, threeMonth: 720000, yearly: 2400000 },
        };

        let basePrice = 0;
        const tierName = tier.toLowerCase();

        if (pricingTier) {
            // Use DB pricing
            if (cycle === 'monthly') basePrice = pricingTier.total_monthly || pricingTier.price_monthly;
            else if (cycle === '3-month') basePrice = pricingTier.total_three_month;
            else if (cycle === 'yearly') basePrice = pricingTier.total_yearly;
        } else if (FALLBACK_PRICING[tierName]) {
            // Use fallback
            const plan = FALLBACK_PRICING[tierName];
            if (cycle === 'monthly') basePrice = plan.monthly;
            else if (cycle === '3-month') basePrice = plan.threeMonth;
            else if (cycle === 'yearly') basePrice = plan.yearly;
        }

        if (basePrice === 0) {
            return NextResponse.json({ error: "Invalid plan or cycle" }, { status: 400 });
        }

        // 2. Validate and apply discount code (works for both redeem codes and affiliate codes)
        let discountPercentage = 0;
        let discountAmount = 0;
        let validatedCodeId: string | null = null;
        let affiliateCodeId: string | null = null;

        if (discountCode) {
            // Check redeem_codes first
            const { data: redeemCodeData } = await adminClient
                .from("redeem_codes")
                .select("*")
                .eq("code", discountCode.toLowerCase().trim())
                .eq("is_active", true)
                .single();

            if (redeemCodeData) {
                if (redeemCodeData.times_used >= redeemCodeData.max_uses) {
                    return NextResponse.json({ error: "Discount code has reached maximum uses" }, { status: 400 });
                }
                if (!redeemCodeData.discount_percentage || redeemCodeData.discount_percentage <= 0) {
                    return NextResponse.json({ error: "This is not a discount code" }, { status: 400 });
                }
                if (redeemCodeData.tier && redeemCodeData.tier.toLowerCase() !== 'all') {
                    const applicableTiers = redeemCodeData.tier.toLowerCase().split(",").map((t: string) => t.trim());
                    if (!applicableTiers.includes(tierName)) {
                        return NextResponse.json({ error: `Discount code not applicable for ${tier} plan` }, { status: 400 });
                    }
                }
                discountPercentage = redeemCodeData.discount_percentage;
                discountAmount = Math.round(basePrice * discountPercentage / 100);
                validatedCodeId = redeemCodeData.id;
            } else {
                // Check affiliate_codes
                const { data: affCodeData } = await adminClient
                    .from("affiliate_codes")
                    .select("*, affiliates!inner(id, is_active)")
                    .eq("code", discountCode.toLowerCase().trim())
                    .eq("is_active", true)
                    .single();

                if (!affCodeData || !affCodeData.affiliates?.is_active) {
                    return NextResponse.json({ error: "Invalid or expired discount code" }, { status: 400 });
                }

                discountPercentage = affCodeData.discount_percentage || 0;
                discountAmount = Math.round(basePrice * discountPercentage / 100);
                affiliateCodeId = affCodeData.id;
            }
        }

        // 3. Calculate final price
        const priceAfterDiscount = basePrice - discountAmount;
        const { total, fee } = calculateTotalWithFee(priceAfterDiscount);

        // 4. Generate Order ID
        const shortUserId = user.id.substring(0, 8);
        const timestamp = format(new Date(), "yyyyMMddHHmmss");
        const orderId = `PAY-${shortUserId}-${timestamp}`;

        // 5. Create Snap Transaction
        const itemName = discountCode
            ? `${tier.toUpperCase()} Plan (${cycle}) -${discountPercentage}%`
            : `${tier.toUpperCase()} Plan (${cycle})`;

        const snapResult = await createSnapTransaction({
            orderId: orderId,
            amount: total,
            email: user.email,
            itemName: itemName,
        });

        if (snapResult.status_code !== '201') {
            console.error("Snap Error:", JSON.stringify(snapResult));
            return NextResponse.json({
                error: snapResult.status_message || "Failed to create payment",
                details: snapResult
            }, { status: 500 });
        }

        // 6. Save to Database
        const { error: dbError } = await adminClient
            .from('payments')
            .insert({
                user_id: user.id,
                order_id: orderId,
                tier: tier,
                billing_cycle: cycle,
                amount: total,
                base_price: basePrice,
                fee_amount: fee,
                discount_code: discountCode || null,
                discount_percentage: discountPercentage || 0,
                discount_amount: discountAmount || 0,
                affiliate_code_id: affiliateCodeId || null,
                status: 'pending',
                midtrans_response: snapResult,
                qr_url: snapResult.redirect_url
            });

        if (dbError) {
            console.error("DB Error:", dbError);
            return NextResponse.json({ error: "Database error" }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            orderId: orderId,
            amount: total,
            token: snapResult.token,
            redirectUrl: snapResult.redirect_url
        });

    } catch (error: any) {
        console.error("Payment API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
