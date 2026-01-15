"use server";

import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { parseGDriveLink, extractFolderId } from "@/lib/gdrive-utils";

// Types
export interface Portfolio {
    id: string;
    user_id: string;
    slug: string;
    photographer_name: string;
    tagline: string | null;
    hero_title: string;
    hero_subtitle: string;
    hero_image_url: string | null;
    about_title: string;
    about_body: string | null;
    about_image_url: string | null;
    whatsapp_number: string | null;
    instagram_handle: string | null;
    email: string | null;
    contact_method: string;
    contact_button_text: string;
    is_published: boolean;
    created_at: string;
    updated_at: string;
}

export interface PortfolioSection {
    id: string;
    portfolio_id: string;
    section_key: string;
    display_order: number;
    is_visible: boolean;
    custom_title: string | null;
}

export interface PortfolioItem {
    id: string;
    portfolio_id: string;
    title: string;
    category: string;
    image_url: string;
    gdrive_link: string | null;
    display_order: number;
    created_at: string;
}

export interface PortfolioPricing {
    id: string;
    portfolio_id: string;
    name: string;
    subtitle: string | null;
    price: string;
    original_price: string | null;
    features: string[];
    category: string;
    is_recommended: boolean;
    display_order: number;
    created_at: string;
}

// ============================================
// PORTFOLIO CRUD
// ============================================

export async function getMyPortfolio(): Promise<Portfolio | null> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
        .from('fg_portfolios')
        .select('*')
        .eq('user_id', user.id)
        .single();

    return data;
}

export async function checkPortfolioSlugAvailability(slug: string): Promise<{ available: boolean; error?: string }> {
    if (!slug || slug.length < 3) {
        return { available: false, error: "Slug must be at least 3 characters" };
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
        return { available: false, error: "Only lowercase letters, numbers, and hyphens allowed" };
    }

    const reserved = ['admin', 'api', 'dashboard', 'login', 'register', 'settings'];
    if (reserved.includes(slug)) {
        return { available: false, error: "This slug is reserved" };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data } = await supabase
        .from('fg_portfolios')
        .select('id, user_id')
        .eq('slug', slug)
        .single();

    if (data && user && data.user_id === user.id) {
        return { available: true };
    }

    return { available: !data, error: data ? "This slug is already taken" : undefined };
}

export async function upsertPortfolio(data: Partial<Portfolio> & { slug: string; photographer_name: string }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const { data: existing } = await supabase
        .from('fg_portfolios')
        .select('id')
        .eq('user_id', user.id)
        .single();

    if (existing) {
        const { error } = await supabase
            .from('fg_portfolios')
            .update({ ...data, updated_at: new Date().toISOString() })
            .eq('id', existing.id);
        if (error) return { success: false, error: error.message };
    } else {
        const { error } = await supabase
            .from('fg_portfolios')
            .insert({ ...data, user_id: user.id });
        if (error) return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/portfolio');
    return { success: true };
}

export async function togglePortfolioPublish(publish: boolean) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const { error } = await supabase
        .from('fg_portfolios')
        .update({ is_published: publish, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);

    if (error) return { success: false, error: error.message };
    revalidatePath('/dashboard/portfolio');
    return { success: true };
}

// ============================================
// SECTIONS
// ============================================

export async function getPortfolioSections(portfolioId: string): Promise<PortfolioSection[]> {
    const supabase = await createClient();
    const { data } = await supabase
        .from('fg_portfolio_sections')
        .select('*')
        .eq('portfolio_id', portfolioId)
        .order('display_order', { ascending: true });
    return data || [];
}

export async function updateSection(sectionId: string, updates: Partial<PortfolioSection>) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('fg_portfolio_sections')
        .update(updates)
        .eq('id', sectionId);
    if (error) return { success: false, error: error.message };
    revalidatePath('/dashboard/portfolio');
    return { success: true };
}

export async function reorderSections(sections: { id: string; display_order: number }[]) {
    const supabase = await createClient();
    for (const section of sections) {
        await supabase
            .from('fg_portfolio_sections')
            .update({ display_order: section.display_order })
            .eq('id', section.id);
    }
    revalidatePath('/dashboard/portfolio');
    return { success: true };
}

// ============================================
// GALLERY ITEMS
// ============================================

export async function getPortfolioItems(portfolioId: string): Promise<PortfolioItem[]> {
    const supabase = await createClient();
    const { data } = await supabase
        .from('fg_portfolio_items')
        .select('*')
        .eq('portfolio_id', portfolioId)
        .order('display_order', { ascending: true });
    return data || [];
}

export async function addPortfolioItem(portfolioId: string, item: {
    title: string;
    category: string;
    gdrive_link: string;
}) {
    const supabase = await createClient();
    const imageUrl = parseGDriveLink(item.gdrive_link);
    if (!imageUrl) return { success: false, error: "Invalid Google Drive link" };

    const { data: maxOrder } = await supabase
        .from('fg_portfolio_items')
        .select('display_order')
        .eq('portfolio_id', portfolioId)
        .order('display_order', { ascending: false })
        .limit(1)
        .single();

    const { error } = await supabase
        .from('fg_portfolio_items')
        .insert({
            portfolio_id: portfolioId,
            title: item.title,
            category: item.category,
            image_url: imageUrl,
            gdrive_link: item.gdrive_link,
            display_order: (maxOrder?.display_order || 0) + 1
        });

    if (error) return { success: false, error: error.message };
    revalidatePath('/dashboard/portfolio/gallery');
    return { success: true };
}

export async function addItemsFromFolder(portfolioId: string, folderUrl: string, category: string) {
    const folderId = extractFolderId(folderUrl);
    if (!folderId) return { success: false, error: "Invalid folder URL" };

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) return { success: false, error: "Google API not configured" };

    try {
        const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+(mimeType+contains+'image/')&fields=files(id,name)&pageSize=100&key=${apiKey}`;
        const res = await fetch(url);
        const json = await res.json();

        if (json.error) return { success: false, error: json.error.message };

        const files = json.files || [];
        if (files.length === 0) return { success: false, error: "No images found in folder" };

        const supabase = await createClient();
        const { data: maxOrder } = await supabase
            .from('fg_portfolio_items')
            .select('display_order')
            .eq('portfolio_id', portfolioId)
            .order('display_order', { ascending: false })
            .limit(1)
            .single();

        let order = (maxOrder?.display_order || 0);

        const items = files.map((file: { id: string; name: string }) => ({
            portfolio_id: portfolioId,
            title: file.name.replace(/\.[^/.]+$/, ''),
            category,
            image_url: `https://drive.google.com/thumbnail?id=${file.id}&sz=w1200`,
            gdrive_link: `https://drive.google.com/file/d/${file.id}/view`,
            display_order: ++order
        }));

        const { error } = await supabase.from('fg_portfolio_items').insert(items);
        if (error) return { success: false, error: error.message };

        revalidatePath('/dashboard/portfolio/gallery');
        return { success: true, count: files.length };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function updatePortfolioItem(itemId: string, updates: Partial<PortfolioItem>) {
    const supabase = await createClient();
    if (updates.gdrive_link) {
        const imageUrl = parseGDriveLink(updates.gdrive_link);
        if (imageUrl) updates.image_url = imageUrl;
    }
    const { error } = await supabase
        .from('fg_portfolio_items')
        .update(updates)
        .eq('id', itemId);
    if (error) return { success: false, error: error.message };
    revalidatePath('/dashboard/portfolio/gallery');
    return { success: true };
}

export async function deletePortfolioItem(itemId: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('fg_portfolio_items')
        .delete()
        .eq('id', itemId);
    if (error) return { success: false, error: error.message };
    revalidatePath('/dashboard/portfolio/gallery');
    return { success: true };
}

// ============================================
// PRICING
// ============================================

export async function getPricingPackages(portfolioId: string): Promise<PortfolioPricing[]> {
    const supabase = await createClient();
    const { data } = await supabase
        .from('fg_portfolio_pricing')
        .select('*')
        .eq('portfolio_id', portfolioId)
        .order('display_order', { ascending: true });
    return data || [];
}

export async function addPricingPackage(portfolioId: string, pkg: {
    name: string;
    subtitle?: string;
    price: string;
    original_price?: string;
    features: string[];
    category: string;
    is_recommended?: boolean;
}) {
    const supabase = await createClient();
    const { data: maxOrder } = await supabase
        .from('fg_portfolio_pricing')
        .select('display_order')
        .eq('portfolio_id', portfolioId)
        .order('display_order', { ascending: false })
        .limit(1)
        .single();

    const { error } = await supabase
        .from('fg_portfolio_pricing')
        .insert({
            portfolio_id: portfolioId,
            ...pkg,
            display_order: (maxOrder?.display_order || 0) + 1
        });

    if (error) return { success: false, error: error.message };
    revalidatePath('/dashboard/portfolio/packages');
    return { success: true };
}

export async function updatePricingPackage(packageId: string, updates: Partial<PortfolioPricing>) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('fg_portfolio_pricing')
        .update(updates)
        .eq('id', packageId);
    if (error) return { success: false, error: error.message };
    revalidatePath('/dashboard/portfolio/packages');
    return { success: true };
}

export async function deletePricingPackage(packageId: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('fg_portfolio_pricing')
        .delete()
        .eq('id', packageId);
    if (error) return { success: false, error: error.message };
    revalidatePath('/dashboard/portfolio/packages');
    return { success: true };
}

// ============================================
// PUBLIC DATA FETCHING
// ============================================

export async function getPublicPortfolioData(slug: string) {
    const supabase = await createClient();

    // First get the portfolio
    const { data: portfolio } = await supabase
        .from('fg_portfolios')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

    if (!portfolio) return null;

    // Check owner's subscription status
    const { data: ownerProfile } = await supabase
        .from('profiles')
        .select('subscription_tier, subscription_expires_at')
        .eq('id', portfolio.user_id)
        .single();

    // Check if owner has valid subscription
    if (ownerProfile) {
        const tier = ownerProfile.subscription_tier?.toLowerCase();
        const isPremium = tier === 'pro' || tier === 'unlimited';

        // If not premium tier, don't show portfolio
        if (!isPremium) return null;

        // Check if subscription expired
        if (ownerProfile.subscription_expires_at) {
            const expiresAt = new Date(ownerProfile.subscription_expires_at);
            if (expiresAt < new Date()) return null;
        }
    } else {
        // No profile found, don't show
        return null;
    }

    const [sectionsResult, itemsResult, pricingResult] = await Promise.all([
        supabase.from('fg_portfolio_sections').select('*').eq('portfolio_id', portfolio.id).order('display_order'),
        supabase.from('fg_portfolio_items').select('*').eq('portfolio_id', portfolio.id).order('display_order'),
        supabase.from('fg_portfolio_pricing').select('*').eq('portfolio_id', portfolio.id).order('display_order')
    ]);

    return {
        portfolio,
        sections: sectionsResult.data || [],
        items: itemsResult.data || [],
        pricing: pricingResult.data || []
    };
}
