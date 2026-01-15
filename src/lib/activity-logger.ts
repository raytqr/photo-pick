"use server";

import { createAdminClient } from "@/lib/supabase-server";
import { headers } from "next/headers";

interface LogParams {
    userId?: string | null;
    action: string;
    status?: "success" | "error" | "warning";
    metadata?: Record<string, any>;
    errorMessage?: string;
    durationMs?: number;
}

/**
 * Log an activity to the database for debugging and analytics
 * Uses admin client to bypass RLS
 */
export async function logActivity(params: LogParams) {
    try {
        const adminSupabase = createAdminClient();
        if (!adminSupabase) {
            console.warn("Admin client not available for logging");
            return;
        }

        // Get request headers for IP and user agent
        const headersList = await headers();
        const ipAddress = headersList.get("x-forwarded-for")?.split(",")[0] ||
            headersList.get("x-real-ip") ||
            "unknown";
        const userAgent = headersList.get("user-agent") || "unknown";

        await adminSupabase.from("activity_logs").insert({
            user_id: params.userId || null,
            action: params.action,
            status: params.status || "success",
            metadata: params.metadata || {},
            error_message: params.errorMessage || null,
            ip_address: ipAddress,
            user_agent: userAgent,
            duration_ms: params.durationMs || null,
        });
    } catch (error) {
        // Don't fail the main action if logging fails
        console.error("Failed to log activity:", error);
    }
}

/**
 * Helper to wrap an action with logging
 */
export async function withLogging<T>(
    action: string,
    userId: string | null,
    fn: () => Promise<T>
): Promise<T> {
    const startTime = Date.now();
    try {
        const result = await fn();
        const durationMs = Date.now() - startTime;

        await logActivity({
            userId,
            action,
            status: "success",
            durationMs,
        });

        return result;
    } catch (error: any) {
        const durationMs = Date.now() - startTime;

        await logActivity({
            userId,
            action,
            status: "error",
            errorMessage: error.message || "Unknown error",
            durationMs,
        });

        throw error;
    }
}
