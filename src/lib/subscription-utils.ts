export interface SubscriptionInfo {
    tier: string | null;
    expiresAt: string | null;
    eventsRemaining: number | null;
}

export const PLAN_LIMITS: Record<string, { maxEvents: number; maxPhotos: number }> = {
    'free': { maxEvents: 2, maxPhotos: 100 },
    'Starter': { maxEvents: 10, maxPhotos: 300 },
    'Basic': { maxEvents: 20, maxPhotos: 500 },
    'Pro': { maxEvents: 50, maxPhotos: Infinity },
    'Unlimited': { maxEvents: Infinity, maxPhotos: Infinity },
};

export function getPlanLimits(tier: string | null) {
    if (!tier) return PLAN_LIMITS['free'];
    // Handle case sensitivity just in case
    const normalizedTier = Object.keys(PLAN_LIMITS).find(k => k.toLowerCase() === tier.toLowerCase());
    return PLAN_LIMITS[normalizedTier || 'free'];
}

export function isSubscriptionExpired(expiresAt: string | null): boolean {
    if (!expiresAt) return true;
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

    // For paid tiers, if expired, also restricted
    return isSubscriptionExpired(expiresAt);
}
