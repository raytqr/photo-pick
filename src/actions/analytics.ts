"use server";

import { createClient, createAdminClient } from "@/lib/supabase-server";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

// Helper to check if current user is admin
async function isAdmin() {
    if (!ADMIN_EMAIL) return false;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user?.email === ADMIN_EMAIL;
}

export interface AnalyticsSummary {
    totalUsers: number;
    totalEvents: number;
    totalPhotos: number;
    activeSubscriptions: number;
    usersByTier: Record<string, number>;
    recentSignups: number; // Last 7 days
    recentEvents: number; // Last 7 days
    redeemCodeUsage: number; // Last 30 days
}

export interface MonthlyRecap {
    month: string;
    newUsers: number;
    newEvents: number;
    redeemCodesUsed: number;
    tierBreakdown: Record<string, number>;
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary | { error: string }> {
    if (!(await isAdmin())) {
        return { error: "Unauthorized" };
    }

    const adminClient = createAdminClient();
    if (!adminClient) {
        return { error: "Admin client not available" };
    }

    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    try {
        // Total counts
        const [usersResult, eventsResult, photosResult] = await Promise.all([
            adminClient.from("profiles").select("id", { count: "exact" }),
            adminClient.from("events").select("id", { count: "exact" }).eq("is_deleted", false),
            adminClient.from("photos").select("id", { count: "exact" }),
        ]);

        // Active subscriptions
        const { count: activeSubsCount } = await adminClient
            .from("profiles")
            .select("*", { count: "exact", head: true })
            .gt("subscription_expires_at", now.toISOString());

        // Users by tier
        const { data: tierData } = await adminClient
            .from("profiles")
            .select("subscription_tier");

        const usersByTier: Record<string, number> = {};
        tierData?.forEach((p) => {
            const tier = p.subscription_tier || "free";
            usersByTier[tier] = (usersByTier[tier] || 0) + 1;
        });

        // Recent signups (7 days)
        const { count: recentSignupsCount } = await adminClient
            .from("profiles")
            .select("*", { count: "exact", head: true })
            .gte("created_at", sevenDaysAgo.toISOString());

        // Recent events (7 days)
        const { count: recentEventsCount } = await adminClient
            .from("events")
            .select("*", { count: "exact", head: true })
            .gte("created_at", sevenDaysAgo.toISOString())
            .eq("is_deleted", false);

        // Redeem code usage (30 days) - from activity logs
        const { count: redeemCount } = await adminClient
            .from("activity_logs")
            .select("*", { count: "exact", head: true })
            .eq("action", "redeem_code")
            .gte("created_at", thirtyDaysAgo.toISOString());

        return {
            totalUsers: usersResult.count || 0,
            totalEvents: eventsResult.count || 0,
            totalPhotos: photosResult.count || 0,
            activeSubscriptions: activeSubsCount || 0,
            usersByTier,
            recentSignups: recentSignupsCount || 0,
            recentEvents: recentEventsCount || 0,
            redeemCodeUsage: redeemCount || 0,
        };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function getMonthlyRecap(year: number, month: number): Promise<MonthlyRecap | { error: string }> {
    if (!(await isAdmin())) {
        return { error: "Unauthorized" };
    }

    const adminClient = createAdminClient();
    if (!adminClient) {
        return { error: "Admin client not available" };
    }

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);
    const monthName = startOfMonth.toLocaleDateString("id-ID", { month: "long", year: "numeric" });

    try {
        // New users this month
        const { count: newUsersCount } = await adminClient
            .from("profiles")
            .select("*", { count: "exact", head: true })
            .gte("created_at", startOfMonth.toISOString())
            .lte("created_at", endOfMonth.toISOString());

        // New events this month
        const { count: newEventsCount } = await adminClient
            .from("events")
            .select("*", { count: "exact", head: true })
            .gte("created_at", startOfMonth.toISOString())
            .lte("created_at", endOfMonth.toISOString())
            .eq("is_deleted", false);

        // Redeem codes used this month
        const { count: redeemCount } = await adminClient
            .from("activity_logs")
            .select("*", { count: "exact", head: true })
            .eq("action", "redeem_code")
            .gte("created_at", startOfMonth.toISOString())
            .lte("created_at", endOfMonth.toISOString());

        // Tier breakdown for users who signed up this month
        const { data: tierData } = await adminClient
            .from("profiles")
            .select("subscription_tier")
            .gte("created_at", startOfMonth.toISOString())
            .lte("created_at", endOfMonth.toISOString());

        const tierBreakdown: Record<string, number> = {};
        tierData?.forEach((p) => {
            const tier = p.subscription_tier || "free";
            tierBreakdown[tier] = (tierBreakdown[tier] || 0) + 1;
        });

        return {
            month: monthName,
            newUsers: newUsersCount || 0,
            newEvents: newEventsCount || 0,
            redeemCodesUsed: redeemCount || 0,
            tierBreakdown,
        };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function getRecentActivityLogs(limit: number = 50) {
    if (!(await isAdmin())) {
        return { error: "Unauthorized", logs: [] };
    }

    const adminClient = createAdminClient();
    if (!adminClient) {
        return { error: "Admin client not available", logs: [] };
    }

    const { data, error } = await adminClient
        .from("activity_logs")
        .select(`
            id,
            action,
            status,
            metadata,
            error_message,
            created_at,
            profiles:user_id (
                email,
                photographer_name
            )
        `)
        .order("created_at", { ascending: false })
        .limit(limit);

    if (error) {
        return { error: error.message, logs: [] };
    }

    return { logs: data || [] };
}
