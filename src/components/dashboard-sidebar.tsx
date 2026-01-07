"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    PlusCircle,
    User,
    LogOut,
    Camera,
    Sparkles,
    Settings,
    Grid,
    Plus
} from "lucide-react";
import { SignOutButton } from "@/components/sign-out-button";
import Image from "next/image";

interface DashboardSidebarProps {
    userEmail: string | undefined;
}

export function DashboardSidebar({ userEmail }: DashboardSidebarProps) {
    const pathname = usePathname();

    const links = [
        { href: "/dashboard", label: "Overview", icon: Grid },
        { href: "/dashboard/create", label: "New Event", icon: PlusCircle },
        { href: "/dashboard/profile", label: "Profile & Branding", icon: User },
    ];

    return (
        <aside className="w-64 bg-[#030014] border-r border-white/5 hidden md:flex flex-col h-full fixed left-0 top-0 z-40">
            {/* Branding */}
            <div className="h-24 flex items-center px-6">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-12 h-12 rounded-xl glass border-white/10 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-all duration-500">
                        <Image src="/logo-premium.png" alt="VibeSelect" width={48} height={48} className="rounded-lg object-contain" />
                    </div>
                    <span className="text-xl font-black tracking-tighter text-white">VibeSelect</span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-6">
                <div>
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4 px-2">Menu</div>
                    <div className="space-y-2">
                        {links.map((link) => {
                            const Icon = link.icon;
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300",
                                        isActive
                                            ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                                            : "text-gray-400 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    <Icon size={18} className={isActive ? "text-black" : "text-gray-500"} />
                                    {link.label}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </nav>

            {/* User Profile */}
            <div className="p-4 border-t border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-3 mb-6 p-2 rounded-2xl glass border-white/5">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-600 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-purple-500/10">
                        {userEmail?.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-black truncate text-white">Photographer</p>
                        <p className="text-[10px] text-gray-500 truncate font-medium">{userEmail}</p>
                    </div>
                </div>

                <SignOutButton />
            </div>
        </aside>
    );
}
