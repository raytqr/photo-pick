"use client";

import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useState } from "react";

interface LogoutButtonProps {
    onLogout?: () => void;
}

export function LogoutButton({ onLogout }: LogoutButtonProps) {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);

    const handleSignOut = async () => {
        setLoading(true);
        onLogout?.();

        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
    };

    return (
        <button
            onClick={handleSignOut}
            disabled={loading}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 font-medium group"
        >
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10 group-hover:bg-red-500/20 transition-all duration-200">
                <LogOut size={16} />
            </div>
            <span className="text-sm">{loading ? "Logging out..." : "Logout"}</span>
        </button>
    );
}
