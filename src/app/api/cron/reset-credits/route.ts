import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// This is a Vercel Cron Job that runs daily to reset monthly credits
// Configure this in vercel.json with: "crons": [{ "path": "/api/cron/reset-credits", "schedule": "0 0 * * *" }]

export const runtime = "edge";

// Secret to verify cron job is called by Vercel
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: Request) {
    // Verify the request is from Vercel Cron
    const authHeader = request.headers.get("authorization");
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        return NextResponse.json(
            { error: "Missing Supabase credentials" },
            { status: 500 }
        );
    }

    const supabase = createSupabaseClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });

    const today = new Date();
    const currentDay = today.getDate();
    const now = today.toISOString();

    try {
        // Find all users whose billing_day matches today
        // AND subscription is still active (not expired)
        // AND haven't been reset this month yet
        const { data: usersToReset, error: fetchError } = await supabase
            .from("profiles")
            .select("id, monthly_credits, billing_day, last_credit_reset_at, subscription_expires_at")
            .eq("billing_day", currentDay)
            .gt("subscription_expires_at", now) // Only active subscriptions
            .gt("monthly_credits", 0); // Only users with monthly credits configured

        if (fetchError) {
            console.error("Error fetching users:", fetchError);
            return NextResponse.json({ error: fetchError.message }, { status: 500 });
        }

        if (!usersToReset || usersToReset.length === 0) {
            return NextResponse.json({
                message: "No users to reset today",
                day: currentDay,
                processed: 0,
            });
        }

        // Filter out users who were already reset this month
        const usersNeedingReset = usersToReset.filter((user) => {
            if (!user.last_credit_reset_at) return true;
            const lastReset = new Date(user.last_credit_reset_at);
            // Only reset if last reset was in a different month
            return (
                lastReset.getMonth() !== today.getMonth() ||
                lastReset.getFullYear() !== today.getFullYear()
            );
        });

        if (usersNeedingReset.length === 0) {
            return NextResponse.json({
                message: "All eligible users already reset this month",
                day: currentDay,
                processed: 0,
            });
        }

        // Reset credits for each user
        let successCount = 0;
        let errorCount = 0;

        for (const user of usersNeedingReset) {
            const { error: updateError } = await supabase
                .from("profiles")
                .update({
                    events_remaining: user.monthly_credits,
                    last_credit_reset_at: now,
                })
                .eq("id", user.id);

            if (updateError) {
                console.error(`Error resetting user ${user.id}:`, updateError);
                errorCount++;
            } else {
                successCount++;
            }
        }

        return NextResponse.json({
            message: "Credit reset completed",
            day: currentDay,
            processed: successCount,
            errors: errorCount,
            timestamp: now,
        });
    } catch (error) {
        console.error("Cron job error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
