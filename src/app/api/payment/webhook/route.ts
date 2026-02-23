import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
import crypto from "crypto";

// We need to duplicate the "activate subscription" logic here or import it.
// Since redeemCode is tightly coupled with "codes", let's make a new helper or just write it here.
// For safety, let's write the activation logic here using the Admin Client.

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // 1. Verify Signature
        // atomic: signature_key = SHA512(order_id + status_code + gross_amount + ServerKey)
        const signatureKey = body.signature_key;
        const orderId = body.order_id;
        const statusCode = body.status_code;
        const grossAmount = body.gross_amount;
        const serverKey = process.env.MIDTRANS_SERVER_KEY || "";

        const mySignature = crypto
            .createHash("sha512")
            .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
            .digest("hex");

        if (mySignature !== signatureKey) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
        }

        // 2. Check Status
        // fraud_status exists for card, but for QRIS usually strict.
        const transactionStatus = body.transaction_status;
        const fraudStatus = body.fraud_status;
        let isSuccess = false;

        if (transactionStatus == 'capture') {
            if (fraudStatus == 'challenge') {
                // challenge
            } else if (fraudStatus == 'accept') {
                isSuccess = true;
            }
        } else if (transactionStatus == 'settlement') {
            isSuccess = true;
        }

        if (!isSuccess) {
            return NextResponse.json({ message: "Transaction not success yet, ignored" });
        }

        // 3. Activate Subscription
        // Need to get the Payment record to know User, Tier, and Cycle
        const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
        const adminClient = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { data: payment, error: fetchError } = await adminClient
            .from('payments')
            .select('*')
            .eq('order_id', orderId)
            .single();

        if (fetchError || !payment) {
            console.error("Payment not found for order:", orderId);
            return NextResponse.json({ error: "Payment not found" }, { status: 404 });
        }

        if (payment.status === 'success') {
            return NextResponse.json({ message: "Already processed" });
        }

        // Update Payment Status
        await adminClient
            .from('payments')
            .update({
                status: 'success',
                midtrans_response: body,
                updated_at: new Date().toISOString()
            })
            .eq('id', payment.id);

        // --- ACTIVATE SUBSCRIPTION LOGIC ---
        // Calculate Duration
        let durationDays = 30; // Default
        if (payment.billing_cycle === 'monthly') durationDays = 30;
        else if (payment.billing_cycle === '3-month') durationDays = 90;
        else if (payment.billing_cycle === 'yearly') durationDays = 365;

        // Calculate Events/Credits from DB
        let eventsGranted = 0;
        let isUnlimited = false;

        const { data: tierData } = await adminClient
            .from("pricing_tiers")
            .select("max_events")
            .eq("id", payment.tier.toLowerCase())
            .single();

        if (tierData) {
            if (tierData.max_events === null) {
                isUnlimited = true;
                eventsGranted = 9999;
            } else {
                eventsGranted = tierData.max_events;
            }
        } else {
            // Fallback if DB not available
            switch (payment.tier.toLowerCase()) {
                case 'starter': eventsGranted = 10; break;
                case 'basic': eventsGranted = 20; break;
                case 'pro': eventsGranted = 50; break;
                case 'unlimited': isUnlimited = true; eventsGranted = 9999; break;
                default: eventsGranted = 0;
            }
        }

        // Bonuses?
        if (payment.billing_cycle === 'yearly') {
            // Logic in pricing page says "Bonus Months", effectively cheaper price.
            // Usually duration is just 1 year. The "Bonus" is in the price discount.
            // But if specific bonus logic exists, add here. 
            // Currently existing logic relies on `events_remaining` replenishment.
            // For simplicity, we give the tier limits.
            // Wait, current system limit is "Per Month".
            // If I buy Yearly, do I get 12 * 10 events now? Or 10 events reset every month?
            // `reset-credits` cron handles monthly reset.
            // So we just need to set the Tier and Expiry.
        }

        // Fetch Profile
        const { data: profile } = await adminClient
            .from('profiles')
            .select('*')
            .eq('id', payment.user_id)
            .single();

        const now = new Date();
        const currentExpiresAt = profile?.subscription_expires_at ? new Date(profile.subscription_expires_at) : null;
        const isCurrentActive = currentExpiresAt && currentExpiresAt > now;

        // Determine Updates
        let updateData: any = {};
        const billingDay = Math.min(now.getDate(), 28);

        if (isCurrentActive) {
            // Extend or Upgrade?
            // Simple logic: Just Extend for now, or Overwrite if Upgrade?
            // Let's assume Overwrite/Extend based on expiry.

            // If same tier, extend.
            // If different, we might be overwriting.
            // For safety in this quick implementation: EXTEND if same tier, OVERWRITE if different (Upgrade).

            const newExpiresAt = new Date(currentExpiresAt!);
            newExpiresAt.setDate(newExpiresAt.getDate() + durationDays);

            updateData = {
                subscription_tier: payment.tier,
                subscription_expires_at: newExpiresAt.toISOString(),
                // Reset/Add credits
                events_remaining: isUnlimited ? null : (profile.events_remaining || 0) + eventsGranted,
                monthly_credits: isUnlimited ? null : (profile.monthly_credits || 0) + eventsGranted,
                billing_day: billingDay, // Update billing day to payment day? maybe keep original if extending.
            };
        } else {
            // New Subscription
            const newExpiresAt = new Date();
            newExpiresAt.setDate(newExpiresAt.getDate() + durationDays);

            updateData = {
                subscription_tier: payment.tier,
                subscription_expires_at: newExpiresAt.toISOString(),
                events_remaining: isUnlimited ? null : eventsGranted,
                monthly_credits: isUnlimited ? null : eventsGranted,
                billing_day: billingDay,
                last_credit_reset_at: now.toISOString(),
                // Clear stack
                stacked_tier: null,
            };
        }

        // Update Profile
        await adminClient.from('profiles').update(updateData).eq('id', payment.user_id);

        // Increment discount code usage if one was used
        if (payment.discount_code) {
            // Check if it's a redeem code
            const { data: codeData } = await adminClient
                .from('redeem_codes')
                .select('times_used')
                .eq('code', payment.discount_code)
                .single();

            if (codeData) {
                await adminClient
                    .from('redeem_codes')
                    .update({ times_used: (codeData.times_used || 0) + 1 })
                    .eq('code', payment.discount_code);
            }
        }

        // Handle affiliate commission if affiliate code was used
        if (payment.affiliate_code_id) {
            // Get affiliate code details
            const { data: affCode } = await adminClient
                .from('affiliate_codes')
                .select('*, affiliates!inner(id, commission_type, commission_value, total_earned)')
                .eq('id', payment.affiliate_code_id)
                .single();

            if (affCode && affCode.affiliates) {
                // Calculate commission
                let commissionAmount = 0;
                const paymentAmount = payment.base_price || payment.amount;
                const discountGiven = payment.discount_amount || 0;

                if (affCode.affiliates.commission_type === 'percentage') {
                    commissionAmount = Math.round(paymentAmount * affCode.affiliates.commission_value / 100);
                } else {
                    commissionAmount = affCode.affiliates.commission_value;
                }

                // Insert affiliate transaction
                await adminClient.from('affiliate_transactions').insert({
                    affiliate_id: affCode.affiliates.id,
                    affiliate_code_id: affCode.id,
                    payment_id: payment.id,
                    order_id: orderId,
                    user_id: payment.user_id,
                    tier: payment.tier,
                    billing_cycle: payment.billing_cycle,
                    payment_amount: paymentAmount,
                    discount_given: discountGiven,
                    commission_amount: commissionAmount,
                    status: 'pending',
                });

                // Update affiliate total_earned
                await adminClient
                    .from('affiliates')
                    .update({ total_earned: (affCode.affiliates.total_earned || 0) + commissionAmount })
                    .eq('id', affCode.affiliates.id);

                // Increment affiliate code usage
                await adminClient
                    .from('affiliate_codes')
                    .update({ times_used: (affCode.times_used || 0) + 1 })
                    .eq('id', affCode.id);
            }
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
