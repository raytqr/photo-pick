import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
import { checkTransactionStatus } from "@/lib/midtrans";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('order_id');

    if (!orderId) {
        return NextResponse.json({ error: "Order ID required" }, { status: 400 });
    }

    try {
        // 1. Check Midtrans
        const statusData = await checkTransactionStatus(orderId);
        const transactionStatus = statusData.transaction_status;
        const fraudStatus = statusData.fraud_status;

        // 2. Determine simpler status
        let localStatus = 'pending';
        if (transactionStatus == 'capture') {
            if (fraudStatus == 'challenge') {
                localStatus = 'challenge';
            } else if (fraudStatus == 'accept') {
                localStatus = 'success';
            }
        } else if (transactionStatus == 'settlement') {
            localStatus = 'success';
        } else if (transactionStatus == 'cancel' || transactionStatus == 'deny' || transactionStatus == 'expire') {
            localStatus = 'failed';
        } else if (transactionStatus == 'pending') {
            localStatus = 'pending';
        }

        // 3. Update DB if changed (Using Admin Client)
        const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
        const adminClient = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Get current DB status to compare
        const { data: currentPayment } = await adminClient
            .from('payments')
            .select('status')
            .eq('order_id', orderId)
            .single();

        if (currentPayment && currentPayment.status !== localStatus) {
            await adminClient
                .from('payments')
                .update({
                    status: localStatus,
                    updated_at: new Date().toISOString()
                })
                .eq('order_id', orderId);

            // IF SUCCESS, we must ACTIVATE SUBSCRIPTION here as well?
            // Usually Webhook handles this reliably. Frontend polling is secondary.
            // But if user is staring at screen, this is faster.
            // Let's implement activation here too, BUT be careful of double activation.
            // Ideally, extract "activateSubscription" logic to a shared function.
            // For now, let's rely on Webhook for activation to avoid race conditions,
            // OR checks if subscription already extended.
            // Let's just return status for now. Frontend will show "Success, redirecting..."
            // and we can trigger a generic "refresh subscription" call.
        }

        return NextResponse.json({
            status: localStatus,
            transaction_status: transactionStatus
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
