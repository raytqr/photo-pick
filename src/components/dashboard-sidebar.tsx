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
    Crown,
    CreditCard,
    MessageCircle,
    UserPlus,
    Menu,
    X
} from "lucide-react";
import Image from "next/image";
import { isRestricted } from "@/lib/subscription-utils";

interface DashboardSidebarProps {
    userEmail: string | undefined;
    photographerName?: string | null;
    photographerLogo?: string | null;
    subscriptionTier?: string | null;
    subscriptionExpiresAt?: string | null;
}

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

    return (
        <>
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#0a0a0a] border-b border-white/5 flex items-center justify-between px-4 z-50">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <Image src="/logo-premium.png" alt="SatSetPic" width={32} height={32} className="rounded-lg" />
                    <span className="font-bold text-white">SatSetPic</span>
                </Link>
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="p-2 text-gray-400 hover:text-white"
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Sidebar Container */}
            <aside className={cn(
                "fixed top-0 left-0 bottom-0 w-64 bg-[#0a0a0a] border-r border-white/5 flex flex-col z-40 transition-transform duration-300 md:translate-x-0 pt-16 md:pt-0",
                mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Branding (Desktop) */}
                <div className="h-24 hidden md:flex items-center px-6">
                    <Link href="/dashboard" className="flex items-center gap-3 group">
                        <div className="w-12 h-12 rounded-xl glass border-white/10 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-all duration-500">
                            <Image src="/logo-premium.png" alt="SatSetPic" width={48} height={48} className="rounded-lg object-contain" />
                        </div>
                        <span className="text-xl font-black tracking-tighter text-white">SatSetPic</span>
                    </Link>
                </div>

                {/* Subscription Info */}
                {subscriptionTier && (
                    <div className="mx-4 mb-4 p-3 rounded-2xl glass border-white/10 mt-4 md:mt-0">
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
                <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
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

                    {/* Support Section */}
                    <div>
                        <div className="px-4 mb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Support
                        </div>
                        <div className="space-y-1">
                            <Link
                                href="https://chat.whatsapp.com/H7Ys4utow3c4Vya6TKUAih"
                                target="_blank"
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 hover:translate-x-1 transition-all duration-300 font-medium group"
                            >
                                <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-all duration-300">
                                    <UserPlus size={18} />
                                </div>
                                <span>Join Community</span>
                            </Link>

                            {(subscriptionTier === 'Pro' || subscriptionTier === 'Unlimited') && !restricted && (
                                <Link
                                    href="https://wa.me/6285159993427"
                                    target="_blank"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 hover:translate-x-1 transition-all duration-300 font-medium group"
                                >
                                    <div className="p-2 rounded-lg bg-amber-500/10 group-hover:bg-amber-500/20 transition-all duration-300">
                                        <MessageCircle size={18} />
                                    </div>
                                    <span>Premium Support</span>
                                </Link>
                            )}
                        </div>
                    </div>
                </nav>

                {/* User Profile */}
                <div className="p-4 border-t border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-3 p-2 rounded-2xl glass border-white/5">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-tr from-purple-600 to-pink-600 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-purple-500/10 shrink-0">
                            {displayLogo ? (
                                <Image src={displayLogo} alt={displayName} width={40} height={40} className="w-full h-full object-cover" />
                            ) : (
                                userEmail?.charAt(0).toUpperCase()
                            )}
                        </div>
                        <div className="overflow-hidden min-w-0 flex-1">
                            <p className="text-sm font-black truncate text-white">{displayName}</p>
                            <p className="text-[10px] text-gray-500 truncate font-medium">{userEmail}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/80 z-30 md:hidden backdrop-blur-sm"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}
        </>
    );
}
