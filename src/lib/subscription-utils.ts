export interface SubscriptionInfo {
    tier: string | null;
    expiresAt: string | null;
    eventsRemaining: number | null;
}

// Extended interface for monthly credit system
export interface ExtendedSubscriptionInfo extends SubscriptionInfo {
    monthlyCredits: number | null;
    lastCreditResetAt: string | null;
    billingDay: number | null;
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

// Calculate days until subscription expires
export function getDaysUntilExpiry(expiresAt: string | null): number {
    if (!expiresAt) return 0;
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffTime = expiry.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Check if subscription is expiring soon (within 7 days)
export function isExpiringSoon(expiresAt: string | null): boolean {
    const days = getDaysUntilExpiry(expiresAt);
    return days > 0 && days <= 7;
}

// Check if credits are running low (less than 2)
export function isCreditsLow(eventsRemaining: number | null | undefined): boolean {
    if (eventsRemaining === null || eventsRemaining === undefined) return false;
    return eventsRemaining < 2;
}

// Check if it's time to reset credits for a user
export function shouldResetCredits(
    billingDay: number | null,
    lastResetAt: string | null
): boolean {
    if (!billingDay) return false;

    const today = new Date();
    const currentDay = today.getDate();

    if (currentDay !== billingDay) return false;

    if (!lastResetAt) return true;

    const lastReset = new Date(lastResetAt);
    // Only reset if last reset was in a different month
    return (
        lastReset.getMonth() !== today.getMonth() ||
        lastReset.getFullYear() !== today.getFullYear()
    );
}

