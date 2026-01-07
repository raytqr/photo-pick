"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
    LayoutDashboard,
    PlusCircle,
    User,
    LogOut,
    Camera,
    Sparkles,
    Settings,
    Grid,
    Plus,
    Menu,
    X,
    Crown,
    CreditCard
} from "lucide-react";
import { SignOutButton } from "@/components/sign-out-button";
import Image from "next/image";

interface DashboardSidebarProps {
    userEmail: string | undefined;
    photographerName?: string | null;
    photographerLogo?: string | null;
    subscriptionTier?: string | null;
    subscriptionExpiresAt?: string | null;
}

import { isRestricted } from "@/lib/subscription-utils";

export function DashboardSidebar({
    userEmail,
    photographerName,
    photographerLogo,
    subscriptionTier,
    subscriptionExpiresAt
}: DashboardSidebarProps) {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Ensure subscriptionTier is string or null, handling undefined
    const restricted = isRestricted(subscriptionTier ?? null, subscriptionExpiresAt ?? null);

    const links = [
        { href: "/dashboard", label: "Overview", icon: Grid },
        { href: "/dashboard/create", label: "New Event", icon: PlusCircle },
        { href: "/dashboard/profile", label: "Profile & Branding", icon: User },
        { href: "/dashboard/pricing", label: "Pricing", icon: CreditCard },
    ];

    const displayName = photographerName || "Photographer";
    const displayLogo = photographerLogo || null;

    // Format subscription expiry
    const formatExpiry = () => {
        if (!subscriptionExpiresAt) return null;
        const date = new Date(subscriptionExpiresAt);
        const now = new Date();
        const daysLeft = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (daysLeft <= 0) return "Expired";
        if (daysLeft <= 7) return `${daysLeft} days left`;
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const SidebarContent = () => (
        <>
            {/* Branding */}
            <div className="h-24 flex items-center px-6">
                <Link href="/dashboard" className="flex items-center gap-3 group" onClick={() => setMobileMenuOpen(false)}>
                    <div className="w-12 h-12 rounded-xl glass border-white/10 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-all duration-500">
                        <Image src="/logo-premium.png" alt="SatSetPic" width={48} height={48} className="rounded-lg object-contain" />
                    </div>
                    <span className="text-xl font-black tracking-tighter text-white">SatSetPic</span>
                </Link>
            </div>

            {/* Subscription Info */}
            {subscriptionTier && (
                <div className="mx-4 mb-4 p-3 rounded-2xl glass border-white/10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Crown size={14} className="text-amber-500" />
                            <span className="text-xs font-bold text-white uppercase">{subscriptionTier}</span>
                        </div>
                        {formatExpiry() && (
                            <span className={cn(
                                "text-[10px] font-bold px-2 py-1 rounded-full",
                                formatExpiry() === "Expired" ? "bg-red-500/20 text-red-400" :
                                    formatExpiry()?.includes("days left") ? "bg-amber-500/20 text-amber-400" :
                                        "text-gray-500"
                            )}>
                                {formatExpiry()}
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-6">
                <div>
                    <div className="px-4 mb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Menu
                    </div>
                    <div className="space-y-1">
                        {links.map((link) => {
                            const isLinkDisabled = restricted && (link.href.includes('/create') || link.href.includes('/profile'));

                            return (
                                <Link
                                    key={link.href}
                                    href={isLinkDisabled ? "#" : link.href}
                                    onClick={(e) => {
                                        if (isLinkDisabled) {
                                            e.preventDefault();
                                            alert("Your subscription has expired. Please upgrade to continue.");
                                            return;
                                        }
                                        setMobileMenuOpen(false);
                                    }}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium group",
                                        pathname === link.href
                                            ? "bg-white/10 text-white shadow-lg border border-white/5"
                                            : "text-gray-400 hover:text-white hover:bg-white/5 hover:translate-x-1",
                                        isLinkDisabled && "opacity-50 cursor-not-allowed hover:bg-transparent hover:translate-x-0"
                                    )}
                                >
                                    <div className={cn(
                                        "p-2 rounded-lg transition-all duration-300",
                                        pathname === link.href ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg" : "bg-white/5 group-hover:bg-white/10"
                                    )}>
                                        <link.icon size={18} />
                                    </div>
                                    <span>{link.label}</span>
                                    {isLinkDisabled && <span className="ml-auto text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full">Locked</span>}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </nav>

            {/* User Profile */}
            <div className="p-4 border-t border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-3 mb-6 p-2 rounded-2xl glass border-white/5">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-tr from-purple-600 to-pink-600 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-purple-500/10">
                        {displayLogo ? (
                            <Image src={displayLogo} alt={displayName} width={48} height={48} className="w-full h-full object-cover" />
                        ) : (
                            userEmail?.charAt(0).toUpperCase()
                        )}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-black truncate text-white">{displayName}</p>
                        <p className="text-[10px] text-gray-500 truncate font-medium">{userEmail}</p>
                    </div>
                </div>

                <SignOutButton />
            </div>
        </>
    );

    return (
        <>
            {/* Mobile Menu Button - Fixed at top */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-[#030014]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <Image src="/logo-premium.png" alt="VibeSelect" width={32} height={32} className="rounded-lg" />
                    <span className="text-lg font-black text-white">VibeSelect</span>
                </Link>
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="p-2 rounded-xl glass border-white/10"
                >
                    {mobileMenuOpen ? <X size={24} className="text-white" /> : <Menu size={24} className="text-white" />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-40 bg-[#030014] pt-16 overflow-y-auto">
                    <SidebarContent />
                </div>
            )}

            {/* Desktop Sidebar */}
            <aside className="w-64 bg-[#030014] border-r border-white/5 hidden md:flex flex-col h-full fixed left-0 top-0 z-40">
                <SidebarContent />
            </aside>
        </>
    );
}
