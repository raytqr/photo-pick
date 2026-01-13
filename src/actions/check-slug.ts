"use server";

import { createClient } from "@/lib/supabase-server";

export async function checkSlugAvailability(slug: string) {
    if (!slug || slug.trim() === "") {
        return { available: false, error: "Slug cannot be empty" };
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(slug)) {
        return { available: false, error: "Invalid format. Use lowercase letters, numbers, and hyphens only." };
    }

    const supabase = await createClient();

    // Check if slug exists
    const { data: existingEvent, error } = await supabase
        .from('events')
        .select('id')
        .eq('slug', slug)
        .single();

    if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows found (which is good - slug is available)
        console.error("Slug check error:", error);
        return { available: false, error: "Failed to check availability" };
    }

    if (existingEvent) {
        return { available: false, error: "This URL is already taken. Please choose another." };
    }

    return { available: true, error: null };
}
