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
    X,
    BookOpen
} from "lucide-react";
import Image from "next/image";
import { isRestricted } from "@/lib/subscription-utils";
import { LogoutButton } from "@/components/logout-button";

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
        { href: "/dashboard/guide", label: "Guide", icon: BookOpen },
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
            {/* Mobile Header - Fixed consistent padding */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[#0a0a0a]/95 backdrop-blur-lg border-b border-white/5 flex items-center justify-between px-4 z-50">
                <Link href="/dashboard" className="flex items-center gap-2.5">
                    <Image src="/logo-premium.png" alt="SatSetPic" width={28} height={28} className="rounded-lg" />
                    <span className="font-bold text-white text-sm">SatSetPic</span>
                </Link>
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
                    aria-label="Toggle menu"
                >
                    {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Sidebar Container - Consistent spacing */}
            <aside className={cn(
                "fixed top-0 bottom-0 w-64 bg-[#0a0a0a] border-r border-white/5 flex flex-col z-40 transition-transform duration-300 md:translate-x-0",
                // Mobile: Right side, slide from right
                "right-0 md:left-0 md:right-auto",
                mobileMenuOpen ? "translate-x-0" : "translate-x-full"
            )}>
                {/* Branding (Desktop) - Consistent height and padding */}
                <div className="h-16 hidden md:flex items-center px-5 border-b border-white/5">
                    <Link href="/dashboard" className="flex items-center gap-3 group">
                        <Image
                            src="/logo-premium.png"
                            alt="SatSetPic"
                            width={32}
                            height={32}
                            className="rounded-lg group-hover:scale-110 transition-transform duration-300"
                        />
                        <span className="text-lg font-bold text-white">SatSetPic</span>
                    </Link>
                </div>

                {/* Mobile Header Spacer */}
                <div className="h-14 md:hidden" />

                {/* Subscription Info - Consistent margin */}
                {subscriptionTier && (
                    <div className="mx-4 my-4 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Crown size={14} className="text-amber-500" />
                                <span className="text-xs font-bold text-white uppercase tracking-wide">{subscriptionTier}</span>
                            </div>
                            {formatExpiry() && (
                                <span className={cn(
                                    "text-[10px] font-bold px-2 py-0.5 rounded-full",
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

                {/* Navigation - Consistent padding throughout */}
                <nav className="flex-1 px-3 py-2 overflow-y-auto">
                    {/* Main Menu */}
                    <div className="mb-6">
                        <p className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                            Menu
                        </p>
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
                                            "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 font-medium group",
                                            pathname === link.href
                                                ? "bg-white/10 text-white"
                                                : "text-gray-400 hover:text-white hover:bg-white/5",
                                            isLinkDisabled && "opacity-50 cursor-not-allowed hover:bg-transparent"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200",
                                            pathname === link.href
                                                ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white"
                                                : "bg-white/5 group-hover:bg-white/10"
                                        )}>
                                            <link.icon size={16} />
                                        </div>
                                        <span className="text-sm">{link.label}</span>
                                        {isLinkDisabled && (
                                            <span className="ml-auto text-[9px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full font-bold">
                                                Locked
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Support Section */}
                    <div>
                        <p className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                            Support
                        </p>
                        <div className="space-y-1">
                            <Link
                                href="https://chat.whatsapp.com/H7Ys4utow3c4Vya6TKUAih"
                                target="_blank"
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200 font-medium group"
                            >
                                <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 group-hover:bg-white/10 transition-all duration-200">
                                    <UserPlus size={16} />
                                </div>
                                <span className="text-sm">Join Community</span>
                            </Link>

                            {(subscriptionTier === 'Pro' || subscriptionTier === 'Unlimited') && !restricted && (
                                <Link
                                    href="https://wa.me/6285159993427"
                                    target="_blank"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-all duration-200 font-medium group"
                                >
                                    <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-amber-500/10 group-hover:bg-amber-500/20 transition-all duration-200">
                                        <MessageCircle size={16} />
                                    </div>
                                    <span className="text-sm">Premium Support</span>
                                </Link>
                            )}
                        </div>
                    </div>
                </nav>

                {/* User Profile with Logout - Consistent padding */}
                <div className="p-3 border-t border-white/5 space-y-2">
                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03]">
                        <div className="w-9 h-9 rounded-lg overflow-hidden bg-gradient-to-tr from-purple-600 to-pink-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                            {displayLogo ? (
                                <Image src={displayLogo} alt={displayName} width={36} height={36} className="w-full h-full object-cover" />
                            ) : (
                                userEmail?.charAt(0).toUpperCase()
                            )}
                        </div>
                        <div className="overflow-hidden min-w-0 flex-1">
                            <p className="text-sm font-bold truncate text-white">{displayName}</p>
                            <p className="text-[10px] text-gray-500 truncate">{userEmail}</p>
                        </div>
                    </div>

                    {/* Logout Button */}
                    <LogoutButton onLogout={() => setMobileMenuOpen(false)} />
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
