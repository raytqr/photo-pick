"use server";

import { createClient, createAdminClient } from "@/lib/supabase-server";

const ADMIN_EMAIL = "rayhanwahyut27@gmail.com";

// Helper to check if current user is admin
async function isAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user?.email === ADMIN_EMAIL;
}

// =======================
// STATS & USERS
// =======================

export async function getAdminStats() {
    if (!(await isAdmin())) {
        return { error: "Unauthorized" };
    }

    // Use admin client to bypass RLS
    const supabase = createAdminClient();

    const [usersResult, eventsResult, photosResult] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact" }),
        supabase.from("events").select("id", { count: "exact" }).eq("is_deleted", false),
        supabase.from("photos").select("id", { count: "exact" }),
    ]);

    return {
        totalUsers: usersResult.count || 0,
        totalEvents: eventsResult.count || 0,
        totalPhotos: photosResult.count || 0,
    };
}

export async function getAllUsers() {
    if (!(await isAdmin())) {
        return { error: "Unauthorized", users: [] };
    }

    // Use admin client to bypass RLS
    const supabase = createAdminClient();

    // Get all profiles
    const { data: profiles, error } = await supabase
        .from("profiles")
        .select(`
            id,
            email,
            photographer_name,
            logo_url,
            subscription_tier,
            subscription_expires_at,
            events_remaining,
            created_at
        `)
        .order("created_at", { ascending: false });

    if (error) {
        return { error: error.message, users: [] };
    }

    // Get events and photos count for each user
    const usersWithStats = await Promise.all(
        (profiles || []).map(async (profile) => {
            const [eventsResult, photosResult] = await Promise.all([
                supabase
                    .from("events")
                    .select("id, name")
                    .eq("photographer_id", profile.id)
                    .eq("is_deleted", false),
                supabase
                    .from("photos")
                    .select("id", { count: "exact" })
                    .in(
                        "event_id",
                        (await supabase
                            .from("events")
                            .select("id")
                            .eq("photographer_id", profile.id)
                            .eq("is_deleted", false))
                            .data?.map((e) => e.id) || []
                    ),
            ]);

            return {
                ...profile,
                events: eventsResult.data || [],
                eventsCount: eventsResult.data?.length || 0,
                photosCount: photosResult.count || 0,
                total_events_created: eventsResult.data?.length || 0,
            };
        })
    );

    return { users: usersWithStats };
}

// =======================
// REDEEM CODES
// =======================

export async function getRedeemCodes() {
    if (!(await isAdmin())) {
        return { error: "Unauthorized", codes: [] };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
        .from("redeem_codes")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        return { error: error.message, codes: [] };
    }

    return { codes: data || [] };
}

export async function createRedeemCode(formData: {
    code: string;
    tier: string;
    events_granted: number;
    duration_days: number;
    max_uses: number;
    discount_percentage?: number;
}) {
    if (!(await isAdmin())) {
        return { error: "Unauthorized" };
    }

    const supabase = await createClient();
    const { error } = await supabase.from("redeem_codes").insert({
        code: formData.code.toLowerCase().replace(/\s/g, ""),
        tier: formData.tier,
        events_granted: formData.events_granted,
        duration_days: formData.duration_days,
        max_uses: formData.max_uses,
        discount_percentage: formData.discount_percentage || 0,
        is_active: true,
        times_used: 0,
    });

    if (error) {
        return { error: error.message };
    }

    return { success: true };
}

export async function updateRedeemCode(
    id: string,
    updates: Partial<{
        code: string;
        tier: string;
        events_granted: number;
        duration_days: number;
        max_uses: number;
        is_active: boolean;
        discount_percentage: number;
    }>
) {
    if (!(await isAdmin())) {
        return { error: "Unauthorized" };
    }

    const supabase = await createClient();
    const { error } = await supabase
        .from("redeem_codes")
        .update(updates)
        .eq("id", id);

    if (error) {
        return { error: error.message };
    }

    return { success: true };
}

export async function deleteRedeemCode(id: string) {
    if (!(await isAdmin())) {
        return { error: "Unauthorized" };
    }

    const supabase = await createClient();
    const { error } = await supabase.from("redeem_codes").delete().eq("id", id);

    if (error) {
        return { error: error.message };
    }

    return { success: true };
}
