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

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex font-sans">
            <DashboardSidebar userEmail={user.email} />

            <div className="flex-1 md:ml-64 transition-all duration-300">
                {children}
            </div>
        </div>
    );
}
