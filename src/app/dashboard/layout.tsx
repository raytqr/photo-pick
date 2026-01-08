import { createClient } from "@/lib/supabase-server";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { FreeTrialPopup } from "@/components/free-trial-popup";
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

            <FreeTrialPopup tier={profile?.subscription_tier} />

            {/* Main content - consistent padding: p-4 mobile, p-6 desktop */}
            <div className="flex-1 md:ml-64 pt-14 md:pt-0 transition-all duration-300 p-4 md:p-6">
                {children}
            </div>
        </div>
    );
}
