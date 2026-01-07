import { createClient } from "@/lib/supabase-server";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch profile with photographer name and subscription info
    const { data: profile } = await supabase
        .from('profiles')
        .select('photographer_name, logo_url, subscription_tier, subscription_expires_at')
        .eq('id', user.id)
        .single();

    return (
        <div className="min-h-screen bg-[#030014] flex font-sans">
            <DashboardSidebar
                userEmail={user.email}
                photographerName={profile?.photographer_name}
                photographerLogo={profile?.logo_url}
                subscriptionTier={profile?.subscription_tier}
                subscriptionExpiresAt={profile?.subscription_expires_at}
            />

            {/* Add padding top on mobile for fixed header */}
            <div className="flex-1 md:ml-64 pt-16 md:pt-0 transition-all duration-300">
                {children}
            </div>
        </div>
    );
}
