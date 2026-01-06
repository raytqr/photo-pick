"use client";

import { createClient } from "@/lib/supabase";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function SignOutButton() {
    const router = useRouter();
    const supabase = createClient();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/login"); // Middleware effectively handles this too but explicit is good
        router.refresh();
    };

    return (
        <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-2">
            <LogOut size={14} /> Sign Out
        </Button>
    );
}
