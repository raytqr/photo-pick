"use server";

import { createClient } from "@/lib/supabase-server";
import { getPlanLimits, isRestricted, PLAN_LIMITS } from "@/lib/subscription-utils";
import { revalidatePath } from "next/cache";

export async function createEvent(formData: {
    name: string;
    slug: string;
    driveLink: string;
    photoLimit: number;
}) {
    const supabase = await createClient();

    // 1. Authentication Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    // 2. Fetch Profile & Subscription
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (!profile) {
        return { success: false, error: "Profile not found" };
    }

    // 3. Subscription Status Check
    // Handle expired subscription
    if (isRestricted(profile.subscription_tier, profile.subscription_expires_at)) {
        return { success: false, error: "Subscription expired. Please renew to create events." };
    }

    // 4. Quota Enforcement (Server-Side)
    const tierLimits = getPlanLimits(profile.subscription_tier);
    const isUnlimited = profile.subscription_tier?.toLowerCase() === 'unlimited';

    // 4a. Photo Limit Check
    if (formData.photoLimit > tierLimits.maxPhotos && !isUnlimited) {
        return {
            success: false,
            error: `Photo limit ${formData.photoLimit} exceeds your plan's maximum (${tierLimits.maxPhotos}).`
        };
    }

    // 4b. Events Remaining Check (skip for Unlimited tier)
    if (!isUnlimited) {
        const eventsRemaining = profile.events_remaining ?? 0;
        if (eventsRemaining <= 0) {
            return {
                success: false,
                error: `No events remaining in your monthly quota. Please wait for reset or upgrade your plan.`
            };
        }
    }

    // 5. Slug Validation
    const safeSlug = formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    // Check slug uniqueness
    const { data: existingSlug } = await supabase
        .from('events')
        .select('id')
        .eq('slug', safeSlug)
        .single();

    if (existingSlug) {
        return { success: false, error: "This URL slug is already taken. Please choose another." };
    }

    // 6. Insert Event
    const { data: event, error: insertError } = await supabase.from('events').insert({
        photographer_id: user.id,
        name: formData.name,
        slug: safeSlug,
        drive_link: formData.driveLink,
        photo_limit: formData.photoLimit,
    }).select().single();

    if (insertError) {
        return { success: false, error: insertError.message };
    }

    // 7. Decrement events_remaining (skip for Unlimited tier)
    if (!isUnlimited && profile.events_remaining !== null) {
        const newEventsRemaining = Math.max(0, (profile.events_remaining || 0) - 1);
        await supabase
            .from('profiles')
            .update({ events_remaining: newEventsRemaining })
            .eq('id', user.id);
    }

    // 8. Success
    revalidatePath('/dashboard');
    return { success: true, eventId: event.id };
}

