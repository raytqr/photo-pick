"use server";

import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

export async function toggleEventStatus(eventId: string, isActive: boolean) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    // Verify ownership
    const { data: event } = await supabase
        .from('events')
        .select('id')
        .eq('id', eventId)
        .eq('photographer_id', user.id)
        .single();

    if (!event) {
        return { success: false, error: "Event not found or access denied" };
    }

    const { error } = await supabase
        .from('events')
        .update({ is_active: isActive })
        .eq('id', eventId);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/dashboard');
    return { success: true };
}
