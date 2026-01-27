import { createClient } from "@/lib/supabase-server";
import { format } from "date-fns";
import { NextResponse } from "next/server";
import { calculateTotalWithFee, createQrisTransaction } from "@/lib/midtrans";

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
        // Format: PAY-USERID_PREFIX-TIMESTAMP
        const shortUserId = user.id.substring(0, 8);
        const timestamp = format(new Date(), "yyyyMMddHHmmss");
        const orderId = `PAY-${shortUserId}-${timestamp}`;

        // 3. Create Transaction in Midtrans
        const midtransResult = await createQrisTransaction({
            orderId: orderId,
            amount: total,
            email: user.email,
            itemName: `${tier.toUpperCase()} Plan (${cycle})`,
        });

        if (midtransResult.status_code !== '201') {
            console.error("Midtrans Error:", midtransResult);
            return NextResponse.json({ error: "Failed to create transaction with Midtrans" }, { status: 500 });
        }

        // 4. Save to Database
        // Use service role to write to payments table if needed, strictly we can use authenticated user
        // but let's be safe with DB policies. Assuming user has insert rights? 
        // We defined policy 'Service role can manage all payments'.
        // If user policy only SELECT, we need admin client here.
        // Let's assume we need admin client for insert to be safe or update policy.
        // For now, let's try with user client if policy allows INSERT?
        // Wait, migration only had SELECT policy for user. 
        // So we MUST use admin client to insert.

        // Dynamic import to avoid circular dep issues in some setups, but here it's fine.
        /* 
           Using simple supabase client (user context) might fail INSERT if policy not set.
           Let's use a quick admin client if available in context or just use createClient() and ensure RLS allows INSERT.
           Actually, let's update migration to allow INSERT for auth.users?
           Or just use Service Role key.
        */

        // Since we don't have easy ad-hoc admin client here without importing, 
        // and 'supabase-server' usually returns user client...
        // Let's create a temporary admin client using process.env
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
                midtrans_response: midtransResult,
                qr_url: midtransResult.actions?.[0]?.url // Midtrans usually returns actions list for QR
            });

        if (dbError) {
            console.error("DB Error:", dbError);
            return NextResponse.json({ error: "Database error" }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            orderId: orderId,
            amount: total,
            qrUrl: midtransResult.actions?.[0]?.url
        });

    } catch (error: any) {
        console.error("Payment API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
