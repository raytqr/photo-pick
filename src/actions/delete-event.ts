"use server";

import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

export async function deleteEvent(eventId: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    // Verify ownership
    const { data: event } = await supabase
        .from('events')
        .select('photographer_id')
        .eq('id', eventId)
        .single();

    if (!event || event.photographer_id !== user.id) {
        return { success: false, error: "Unauthorized" };
    }

    // Delete event (cascade will delete photos too)
    const { error } = await supabase.from('events').delete().eq('id', eventId);

    if (error) {
        return { success: false, error: error.message };
    }

    // Revalidate dashboard cache so deleted event disappears
    revalidatePath('/dashboard');

    return { success: true };
}
