export interface SubscriptionInfo {
    tier: string | null;
    expiresAt: string | null;
    eventsRemaining: number | null;
}

export function isSubscriptionExpired(expiresAt: string | null): boolean {
    if (!expiresAt) return true; // No expiry date usually means no plan, or unlimited? 
    // Actually for 'free' trial it has expiry. 'unlimited' might be null? 
    // Let's assume if it has expiry, we check it. If null, we might need to check tier.
    // If tier is 'unlimited'/'pro' etc with auto-renew, does it have expiry? Usually yes.

    // Safer check:
    const date = new Date(expiresAt);
    const now = new Date();
    return date.getTime() < now.getTime();
}

export function isRestricted(tier: string | null, expiresAt: string | null): boolean {
    // If no tier, restricted.
    if (!tier || tier === 'none') return true;

    // If tier is free and expired, restricted.
    if (tier === 'free') {
        return isSubscriptionExpired(expiresAt);
    }

    // For paid tiers, if expired, also restricted (grace period logic?)
    // For now, assume strict expiry.
    return isSubscriptionExpired(expiresAt);
}
