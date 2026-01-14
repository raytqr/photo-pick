"use server";

import { checkRateLimit, RateLimitPresets } from "@/lib/rate-limit";
import { headers } from "next/headers";

/**
 * Server action to check rate limit for auth operations
 * Uses client IP as identifier
 */
export async function checkAuthRateLimit(): Promise<{
    allowed: boolean;
    message?: string;
    resetIn?: number;
}> {
    const headersList = await headers();

    // Get client IP from various headers (Vercel, Cloudflare, or fallback)
    const forwardedFor = headersList.get("x-forwarded-for");
    const realIp = headersList.get("x-real-ip");
    const cfConnectingIp = headersList.get("cf-connecting-ip");

    const clientIp = cfConnectingIp || realIp || forwardedFor?.split(",")[0] || "unknown";

    const result = checkRateLimit(`auth:${clientIp}`, RateLimitPresets.auth);

    if (!result.success) {
        return {
            allowed: false,
            message: `Too many attempts. Please try again in ${result.resetIn} seconds.`,
            resetIn: result.resetIn,
        };
    }

    return { allowed: true };
}
