import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// This is a Vercel Cron Job that runs daily to:
// 1. Reset monthly credits for users on their billing day
// 2. Restore stacked subscriptions when current subscription expires
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
        let creditResetSuccess = 0;
        let creditResetErrors = 0;
        let stackedRestoreSuccess = 0;
        let stackedRestoreErrors = 0;

        // ============================================
        // PART 1: Restore Stacked Subscriptions
        // ============================================
        // Find users whose current subscription has expired but have a stacked subscription waiting
        const { data: usersWithStacked, error: stackedFetchError } = await supabase
            .from("profiles")
            .select("id, stacked_tier, stacked_expires_at, stacked_events_remaining, stacked_monthly_credits, subscription_expires_at")
            .not("stacked_tier", "is", null)
            .lt("subscription_expires_at", now); // Current subscription has expired

        if (stackedFetchError) {
            console.error("Error fetching stacked subscriptions:", stackedFetchError);
        } else if (usersWithStacked && usersWithStacked.length > 0) {
            for (const user of usersWithStacked) {
                // Only restore if stacked subscription hasn't expired yet
                if (user.stacked_expires_at && new Date(user.stacked_expires_at) > today) {
                    const { error: restoreError } = await supabase
                        .from("profiles")
                        .update({
                            subscription_tier: user.stacked_tier,
                            subscription_expires_at: user.stacked_expires_at,
                            events_remaining: user.stacked_events_remaining,
                            monthly_credits: user.stacked_monthly_credits,
                            // Clear stacked data
                            stacked_tier: null,
                            stacked_expires_at: null,
                            stacked_events_remaining: null,
                            stacked_monthly_credits: null,
                        })
                        .eq("id", user.id);

                    if (restoreError) {
                        console.error(`Error restoring stacked subscription for ${user.id}:`, restoreError);
                        stackedRestoreErrors++;
                    } else {
                        console.log(`Restored ${user.stacked_tier} subscription for user ${user.id}`);
                        stackedRestoreSuccess++;
                    }
                } else {
                    // Stacked subscription also expired, just clear it
                    await supabase
                        .from("profiles")
                        .update({
                            stacked_tier: null,
                            stacked_expires_at: null,
                            stacked_events_remaining: null,
                            stacked_monthly_credits: null,
                        })
                        .eq("id", user.id);
                }
            }
        }

        // ============================================
        // PART 2: Reset Monthly Credits
        // ============================================
        // Find all users whose billing_day matches today
        // AND subscription is still active (not expired)
        // AND have monthly credits configured (not Unlimited)
        const { data: usersToReset, error: fetchError } = await supabase
            .from("profiles")
            .select("id, monthly_credits, billing_day, last_credit_reset_at, subscription_expires_at")
            .eq("billing_day", currentDay)
            .gt("subscription_expires_at", now) // Only active subscriptions
            .not("monthly_credits", "is", null); // Not Unlimited tier

        if (fetchError) {
            console.error("Error fetching users:", fetchError);
            return NextResponse.json({ error: fetchError.message }, { status: 500 });
        }

        if (usersToReset && usersToReset.length > 0) {
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

            // Reset credits for each user
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
                    creditResetErrors++;
                } else {
                    creditResetSuccess++;
                }
            }
        }

        return NextResponse.json({
            message: "Daily cron job completed",
            day: currentDay,
            timestamp: now,
            creditReset: {
                processed: creditResetSuccess,
                errors: creditResetErrors,
            },
            stackedRestore: {
                processed: stackedRestoreSuccess,
                errors: stackedRestoreErrors,
            },
        });
    } catch (error) {
        console.error("Cron job error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
