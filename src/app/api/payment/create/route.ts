import { createClient } from "@/lib/supabase-server";
import { format } from "date-fns";
import { NextResponse } from "next/server";
import { calculateTotalWithFee, createSnapTransaction } from "@/lib/midtrans";

// Pricing configuration (Must match frontend!)
const PRICING = {
    starter: { monthly: 40000, threeMonth: 105000, yearly: 360000 },
    basic: { monthly: 70000, threeMonth: 180000, yearly: 600000 },
    pro: { monthly: 150000, threeMonth: 360000, yearly: 1200000 },
    unlimited: { monthly: 300000, threeMonth: 720000, yearly: 2400000 },
};

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { tier, cycle } = body;

        if (!tier || !cycle) {
            return NextResponse.json({ error: "Missing tier or cycle" }, { status: 400 });
        }

        // 1. Calculate Price
        const tierName = tier.toLowerCase();
        let basePrice = 0;

        if (PRICING[tierName as keyof typeof PRICING]) {
            const plan = PRICING[tierName as keyof typeof PRICING];
            if (cycle === 'monthly') basePrice = plan.monthly;
            else if (cycle === '3-month') basePrice = plan.threeMonth;
            else if (cycle === 'yearly') basePrice = plan.yearly;
        }

        if (basePrice === 0) {
            return NextResponse.json({ error: "Invalid plan or cycle" }, { status: 400 });
        }

        const { total, fee } = calculateTotalWithFee(basePrice);

        // 2. Generate Order ID
        const shortUserId = user.id.substring(0, 8);
        const timestamp = format(new Date(), "yyyyMMddHHmmss");
        const orderId = `PAY-${shortUserId}-${timestamp}`;

        // 3. Create Snap Transaction
        const snapResult = await createSnapTransaction({
            orderId: orderId,
            amount: total,
            email: user.email,
            itemName: `${tier.toUpperCase()} Plan (${cycle})`,
        });

        if (snapResult.status_code !== '201') {
            console.error("Snap Error:", JSON.stringify(snapResult));
            return NextResponse.json({
                error: snapResult.status_message || "Failed to create payment",
                details: snapResult
            }, { status: 500 });
        }

        // 4. Save to Database
        const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
        const adminClient = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

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
                status: 'pending',
                midtrans_response: snapResult,
                qr_url: snapResult.redirect_url // Store redirect URL
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
