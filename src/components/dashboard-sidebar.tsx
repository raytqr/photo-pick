"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, PlusCircle, Settings, LogOut, User } from "lucide-react";
import { SignOutButton } from "@/components/sign-out-button";

interface DashboardSidebarProps {
    userEmail: string | undefined;
}

export function DashboardSidebar({ userEmail }: DashboardSidebarProps) {
    const pathname = usePathname();

    const links = [
        { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
        { href: "/dashboard/create", label: "New Event", icon: PlusCircle },
        { href: "/dashboard/profile", label: "Profile & Branding", icon: User },
    ];

    return (
        <aside className="w-64 bg-white dark:bg-gray-950 border-r dark:border-gray-800 hidden md:flex flex-col h-full fixed left-0 top-0 z-40">
            {/* Branding */}
            <div className="h-16 flex items-center px-6 border-b dark:border-gray-800">
                <div className="font-bold text-xl tracking-tight flex items-center gap-2">
                    <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-black">
                        <span className="font-mono text-sm">V</span>
                    </div>
                    <span>VibeSelect</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">Menu</div>
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-black text-white dark:bg-white dark:text-black"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-100"
                            )}
                        >
                            <Icon size={18} />
                            {link.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer / User Profile */}
            <div className="p-4 border-t dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center font-bold text-sm">
                        {userEmail?.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-medium truncate text-gray-900 dark:text-white">Photographer</p>
                        <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                    </div>
                </div>

                <SignOutButton />
            </div>
        </aside>
    );
}
