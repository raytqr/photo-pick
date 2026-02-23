"use server";

import { createClient, createAdminClient } from "@/lib/supabase-server";
import { cookies } from "next/headers";
import crypto from "crypto";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const AFFILIATE_COOKIE = "affiliate_session";

// =====================
// HELPERS
// =====================

function hashPassword(password: string): string {
    return crypto.createHash("sha256").update(password).digest("hex");
}

async function isAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user?.email === ADMIN_EMAIL;
}

function getAdminSupabase() {
    const client = createAdminClient();
    if (!client) throw new Error("Admin client not configured");
    return client;
}

// =====================
// AFFILIATE LOGIN & SESSION
// =====================

export async function affiliateLogin(email: string, password: string) {
    const adminSupabase = getAdminSupabase();

    const { data: affiliate, error } = await adminSupabase
        .from("affiliates")
        .select("*")
        .eq("email", email.toLowerCase().trim())
        .eq("is_active", true)
        .single();

    if (error || !affiliate) {
        return { success: false, error: "Email tidak ditemukan atau akun tidak aktif" };
    }

    if (affiliate.password_hash !== hashPassword(password)) {
        return { success: false, error: "Password salah" };
    }

    // Set session cookie
    const cookieStore = await cookies();
    const sessionData = JSON.stringify({ id: affiliate.id, email: affiliate.email, name: affiliate.name });
    const encoded = Buffer.from(sessionData).toString("base64");
    cookieStore.set(AFFILIATE_COOKIE, encoded, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
    });

    return { success: true, name: affiliate.name };
}

export async function affiliateLogout() {
    const cookieStore = await cookies();
    cookieStore.delete(AFFILIATE_COOKIE);
    return { success: true };
}

export async function getAffiliateSession(): Promise<{ id: string; email: string; name: string } | null> {
    try {
        const cookieStore = await cookies();
        const cookie = cookieStore.get(AFFILIATE_COOKIE);
        if (!cookie?.value) return null;
        const decoded = JSON.parse(Buffer.from(cookie.value, "base64").toString());
        return decoded;
    } catch {
        return null;
    }
}

// =====================
// AFFILIATE CRUD (Admin only)
// =====================

export interface Affiliate {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    commission_type: "percentage" | "fixed";
    commission_value: number;
    total_earned: number;
    notes: string | null;
    is_active: boolean;
    created_at: string;
}

export interface AffiliateCode {
    id: string;
    affiliate_id: string;
    code: string;
    discount_percentage: number;
    is_active: boolean;
    times_used: number;
    created_at: string;
}

export interface AffiliateTransaction {
    id: string;
    affiliate_id: string;
    affiliate_code_id: string;
    payment_id: string | null;
    order_id: string;
    user_id: string | null;
    tier: string | null;
    billing_cycle: string | null;
    payment_amount: number;
    discount_given: number;
    commission_amount: number;
    status: string;
    created_at: string;
}

export async function getAffiliates(): Promise<{ affiliates: (Affiliate & { codes_count: number })[]; error?: string }> {
    if (!(await isAdmin())) return { affiliates: [], error: "Unauthorized" };

    const db = getAdminSupabase();
    const { data, error } = await db
        .from("affiliates")
        .select("*, affiliate_codes(id)")
        .order("created_at", { ascending: false });

    if (error) return { affiliates: [], error: error.message };

    const result = (data || []).map((a: any) => ({
        ...a,
        codes_count: a.affiliate_codes?.length || 0,
        affiliate_codes: undefined,
    }));

    return { affiliates: result };
}

export async function createAffiliate(formData: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    commission_type: "percentage" | "fixed";
    commission_value: number;
    notes?: string;
}) {
    if (!(await isAdmin())) return { error: "Unauthorized" };

    const db = getAdminSupabase();
    const { error } = await db.from("affiliates").insert({
        name: formData.name,
        email: formData.email.toLowerCase().trim(),
        phone: formData.phone || null,
        password_hash: hashPassword(formData.password),
        commission_type: formData.commission_type,
        commission_value: formData.commission_value,
        notes: formData.notes || null,
    });

    if (error) return { error: error.message };
    return { success: true };
}

export async function updateAffiliate(id: string, updates: Partial<{
    name: string;
    email: string;
    phone: string;
    password: string;
    commission_type: string;
    commission_value: number;
    notes: string;
    is_active: boolean;
}>) {
    if (!(await isAdmin())) return { error: "Unauthorized" };

    const db = getAdminSupabase();
    const updateData: any = { ...updates };

    // Hash password if provided
    if (updates.password) {
        updateData.password_hash = hashPassword(updates.password);
        delete updateData.password;
    }

    const { error } = await db.from("affiliates").update(updateData).eq("id", id);
    if (error) return { error: error.message };
    return { success: true };
}

export async function deleteAffiliate(id: string) {
    if (!(await isAdmin())) return { error: "Unauthorized" };

    const db = getAdminSupabase();
    const { error } = await db.from("affiliates").delete().eq("id", id);
    if (error) return { error: error.message };
    return { success: true };
}

// =====================
// AFFILIATE CODES (Admin only)
// =====================

export async function getAffiliateCodes(affiliateId: string): Promise<{ codes: AffiliateCode[]; error?: string }> {
    if (!(await isAdmin())) return { codes: [], error: "Unauthorized" };

    const db = getAdminSupabase();
    const { data, error } = await db
        .from("affiliate_codes")
        .select("*")
        .eq("affiliate_id", affiliateId)
        .order("created_at", { ascending: false });

    if (error) return { codes: [], error: error.message };
    return { codes: data || [] };
}

export async function createAffiliateCode(formData: {
    affiliate_id: string;
    code: string;
    discount_percentage: number;
}) {
    if (!(await isAdmin())) return { error: "Unauthorized" };

    const db = getAdminSupabase();
    const { error } = await db.from("affiliate_codes").insert({
        affiliate_id: formData.affiliate_id,
        code: formData.code.toLowerCase().replace(/\s/g, ""),
        discount_percentage: formData.discount_percentage,
    });

    if (error) return { error: error.message };
    return { success: true };
}

export async function deleteAffiliateCode(id: string) {
    if (!(await isAdmin())) return { error: "Unauthorized" };

    const db = getAdminSupabase();
    const { error } = await db.from("affiliate_codes").delete().eq("id", id);
    if (error) return { error: error.message };
    return { success: true };
}

// =====================
// AFFILIATE TRANSACTIONS & REPORTING
// =====================

export async function getAffiliateTransactions(affiliateId?: string): Promise<{ transactions: AffiliateTransaction[]; error?: string }> {
    if (!(await isAdmin())) return { transactions: [], error: "Unauthorized" };

    const db = getAdminSupabase();
    let query = db
        .from("affiliate_transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

    if (affiliateId) {
        query = query.eq("affiliate_id", affiliateId);
    }

    const { data, error } = await query;
    if (error) return { transactions: [], error: error.message };
    return { transactions: data || [] };
}

export async function getAffiliateReport() {
    if (!(await isAdmin())) return { error: "Unauthorized" };

    const db = getAdminSupabase();

    const { data: affiliates } = await db
        .from("affiliates")
        .select("id, name, email, total_earned, is_active, commission_type, commission_value")
        .order("total_earned", { ascending: false });

    const { data: transactions } = await db
        .from("affiliate_transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

    const totalCommission = (affiliates || []).reduce((sum: number, a: any) => sum + (a.total_earned || 0), 0);
    const totalTransactions = (transactions || []).length;

    return {
        affiliates: affiliates || [],
        transactions: transactions || [],
        totalCommission,
        totalTransactions,
    };
}

// =====================
// AFFILIATE DASHBOARD (for logged-in affiliates)
// =====================

export async function getMyAffiliateData() {
    const session = await getAffiliateSession();
    if (!session) return { error: "Not logged in" };

    const db = getAdminSupabase();

    const [affiliateRes, codesRes, transactionsRes] = await Promise.all([
        db.from("affiliates").select("*").eq("id", session.id).single(),
        db.from("affiliate_codes").select("*").eq("affiliate_id", session.id).order("created_at", { ascending: false }),
        db.from("affiliate_transactions").select("*").eq("affiliate_id", session.id).order("created_at", { ascending: false }).limit(50),
    ]);

    if (affiliateRes.error) return { error: "Affiliate not found" };

    return {
        affiliate: affiliateRes.data as Affiliate,
        codes: (codesRes.data || []) as AffiliateCode[],
        transactions: (transactionsRes.data || []) as AffiliateTransaction[],
    };
}

// =====================
// VALIDATE AFFILIATE CODE (used at checkout)
// =====================

export async function validateAffiliateCode(code: string): Promise<{
    valid: boolean;
    discount_percentage: number;
    affiliate_code_id: string;
    affiliate_id: string;
    error?: string;
}> {
    const db = getAdminSupabase();

    const { data, error } = await db
        .from("affiliate_codes")
        .select("*, affiliates!inner(id, is_active)")
        .eq("code", code.toLowerCase().trim())
        .eq("is_active", true)
        .single();

    if (error || !data) {
        return { valid: false, discount_percentage: 0, affiliate_code_id: "", affiliate_id: "", error: "Code not found" };
    }

    // Check if affiliate is active
    if (!data.affiliates?.is_active) {
        return { valid: false, discount_percentage: 0, affiliate_code_id: "", affiliate_id: "", error: "Affiliate inactive" };
    }

    return {
        valid: true,
        discount_percentage: data.discount_percentage || 0,
        affiliate_code_id: data.id,
        affiliate_id: data.affiliates.id,
    };
}
