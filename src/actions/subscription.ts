"use server";

import { createClient, createAdminClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/activity-logger";

// Tier hierarchy - higher number = higher tier
const TIER_HIERARCHY: Record<string, number> = {
    'free': 0,
    'starter': 1,
    'basic': 2,
    'pro': 3,
    'unlimited': 4,
};

function getTierLevel(tier: string | null): number {
    if (!tier) return 0;
    return TIER_HIERARCHY[tier.toLowerCase()] ?? 0;
}

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

    // Get current user profile
    const { data: profile } = await adminSupabase
        .from('profiles')
        .select('subscription_tier, subscription_expires_at, events_remaining, monthly_credits, stacked_tier, stacked_expires_at')
        .eq('id', user.id)
        .single();

    const currentTier = profile?.subscription_tier;
    const currentExpiresAt = profile?.subscription_expires_at ? new Date(profile.subscription_expires_at) : null;
    const newTier = redeemCode.tier;
    const now = new Date();

    // Check if current subscription is still active
    const isCurrentActive = currentExpiresAt && currentExpiresAt > now;

    // Determine tier levels
    const currentLevel = getTierLevel(currentTier);
    const newLevel = getTierLevel(newTier);

    // Calculate billing day (cap at 28 to be safe across all months)
    const billingDay = Math.min(now.getDate(), 28);
    const isUnlimited = newTier?.toLowerCase() === 'unlimited';

    let updateData: Record<string, any>;
    let actionType: 'extend' | 'upgrade' | 'downgrade' | 'new' = 'new';

    if (isCurrentActive) {
        if (newLevel === currentLevel) {
            // SAME TIER: Extend from current expiry
            actionType = 'extend';
            const newExpiresAt = new Date(currentExpiresAt!);
            newExpiresAt.setDate(newExpiresAt.getDate() + redeemCode.duration_days);

            updateData = {
                subscription_expires_at: newExpiresAt.toISOString(),
                // Add credits to existing
                events_remaining: isUnlimited ? null : (profile?.events_remaining || 0) + redeemCode.events_granted,
                monthly_credits: isUnlimited ? null : (profile?.monthly_credits || 0) + redeemCode.events_granted,
            };
        } else if (newLevel > currentLevel) {
            // UPGRADE: Stack current subscription, activate new one
            actionType = 'upgrade';

            // Check if user already has a stacked subscription (prevent double-stack)
            if (profile?.stacked_tier) {
                return {
                    success: false,
                    error: `Anda sudah memiliki subscription ${profile.stacked_tier} yang menunggu. Tidak bisa melakukan upgrade lagi sampai subscription saat ini (${currentTier}) berakhir. Hubungi support jika butuh bantuan.`
                };
            }

            const newExpiresAt = new Date();
            newExpiresAt.setDate(newExpiresAt.getDate() + redeemCode.duration_days);

            updateData = {
                // Stack the current subscription
                stacked_tier: currentTier,
                stacked_expires_at: currentExpiresAt!.toISOString(),
                stacked_events_remaining: profile?.events_remaining,
                stacked_monthly_credits: profile?.monthly_credits,
                // Activate new subscription
                subscription_tier: newTier,
                subscription_expires_at: newExpiresAt.toISOString(),
                events_remaining: isUnlimited ? null : redeemCode.events_granted,
                monthly_credits: isUnlimited ? null : redeemCode.events_granted,
                billing_day: billingDay,
                last_credit_reset_at: now.toISOString(),
            };
        } else {
            // DOWNGRADE: Block - cannot downgrade while subscription is active
            actionType = 'downgrade';
            return {
                success: false,
                error: `Tidak bisa downgrade dari ${currentTier} ke ${newTier} selama subscription masih aktif. Silakan tunggu sampai subscription Anda berakhir atau pilih paket yang sama atau lebih tinggi.`
            };
        }
    } else {
        // No active subscription - treat as new
        actionType = 'new';
        const newExpiresAt = new Date();
        newExpiresAt.setDate(newExpiresAt.getDate() + redeemCode.duration_days);

        updateData = {
            subscription_tier: newTier,
            subscription_expires_at: newExpiresAt.toISOString(),
            events_remaining: isUnlimited ? null : redeemCode.events_granted,
            monthly_credits: isUnlimited ? null : redeemCode.events_granted,
            billing_day: billingDay,
            last_credit_reset_at: now.toISOString(),
            // Clear any stacked subscription
            stacked_tier: null,
            stacked_expires_at: null,
            stacked_events_remaining: null,
            stacked_monthly_credits: null,
        };
    }

    // Update user profile with subscription (Bypass RLS)
    const { error: updateError } = await adminSupabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

    if (updateError) {
        return { success: false, error: updateError.message };
    }

    // Increment times_used on the code (Bypass RLS)
    await adminSupabase
        .from('redeem_codes')
        .update({ times_used: redeemCode.times_used + 1 })
        .eq('id', redeemCode.id);

    // Log activity
    await logActivity({
        userId: user.id,
        action: "redeem_code",
        status: "success",
        metadata: {
            tier: newTier,
            actionType,
            code: code.substring(0, 3) + "***", // Partial code for privacy
            eventsGranted: redeemCode.events_granted,
        },
    });

    revalidatePath('/dashboard');

    return {
        success: true,
        tier: newTier,
        eventsGranted: redeemCode.events_granted,
        expiresAt: updateData.subscription_expires_at,
        actionType,
        message: actionType === 'extend'
            ? `Subscription ${currentTier} diperpanjang!`
            : actionType === 'upgrade'
                ? `Upgrade ke ${newTier}! Subscription ${currentTier} akan dilanjutkan setelah ${newTier} berakhir.`
                : `Subscription ${newTier} aktif!`
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
