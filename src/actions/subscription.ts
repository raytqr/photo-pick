"use server";

import { createClient, createAdminClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

export async function redeemCode(code: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    // Use Admin Client to bypass RLS for redeem codes & profile updates
    const adminSupabase = createAdminClient();
    if (!adminSupabase) {
        return { success: false, error: "Server Configuration Error: Admin client unavailable." };
    }

    // Find the redeem code
    const { data: redeemCode, error: codeError } = await adminSupabase
        .from('redeem_codes')
        .select('*')
        .eq('code', code.toLowerCase().trim())
        .eq('is_active', true)
        .single();

    if (codeError || !redeemCode) {
        return { success: false, error: "Invalid or expired code" };
    }

    // Check if max uses reached
    if (redeemCode.times_used >= redeemCode.max_uses) {
        return { success: false, error: "This code has reached its maximum uses" };
    }

    // Calculate new expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + redeemCode.duration_days);

    // Update user profile with subscription (Bypass RLS)
    const { error: updateError } = await adminSupabase
        .from('profiles')
        .update({
            subscription_tier: redeemCode.tier,
            subscription_expires_at: expiresAt.toISOString(),
            events_remaining: redeemCode.events_granted,
        })
        .eq('id', user.id);

    if (updateError) {
        return { success: false, error: updateError.message };
    }

    // Increment times_used on the code (Bypass RLS)
    await adminSupabase
        .from('redeem_codes')
        .update({ times_used: redeemCode.times_used + 1 })
        .eq('id', redeemCode.id);

    revalidatePath('/dashboard');

    return {
        success: true,
        tier: redeemCode.tier,
        eventsGranted: redeemCode.events_granted,
        expiresAt: expiresAt.toISOString()
    };
}

export async function checkSubscription() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { isActive: false, tier: 'free', eventsRemaining: 0 };
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier, subscription_expires_at, events_remaining')
        .eq('id', user.id)
        .single();

    if (!profile) {
        return { isActive: false, tier: 'free', eventsRemaining: 0 };
    }

    const now = new Date();
    const expiresAt = profile.subscription_expires_at ? new Date(profile.subscription_expires_at) : null;

    const isActive = expiresAt ? now < expiresAt : false;

    return {
        isActive,
        tier: profile.subscription_tier || 'free',
        eventsRemaining: profile.events_remaining || 0,
        expiresAt: profile.subscription_expires_at
    };
}
