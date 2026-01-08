"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
    LayoutDashboard,
    Users,
    CreditCard,
    Ticket,
    ArrowLeft,
    Shield,
    Loader2,
    Menu,
    X
} from "lucide-react";

const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/pricing", label: "Pricing", icon: CreditCard },
    { href: "/admin/redeem-codes", label: "Redeem Codes", icon: Ticket },
];

const ADMIN_SESSION_COOKIE = "admin_session";
const ADMIN_SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 hours

function getAdminSession(): boolean {
    if (typeof window === "undefined") return false;
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
        const [name, value] = cookie.trim().split("=");
        if (name === ADMIN_SESSION_COOKIE && value) {
            const sessionTime = parseInt(value);
            return (Date.now() - sessionTime) < ADMIN_SESSION_DURATION;
        }
    }
    return false;
}

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const [checking, setChecking] = useState(true);
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        // Skip check for login page
        if (pathname === "/admin/login") {
            setChecking(false);
            setAuthorized(true);
            return;
        }

        // Check admin session
        const hasValidSession = getAdminSession();
        if (!hasValidSession) {
            router.replace("/admin/login");
            return;
        }

        setAuthorized(true);
        setChecking(false);
        // Close mobile menu on route change
        setMobileMenuOpen(false);
    }, [pathname, router]);

    // Show loading while checking
    if (checking) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 size={32} className="animate-spin mx-auto text-purple-500" />
                    <p className="text-gray-500 text-sm">Verifying access...</p>
                </div>
            </div>
        );
    }

    // Don't show layout for login page
    if (pathname === "/admin/login") {
        return <>{children}</>;
    }

    // Not authorized
    if (!authorized) {
        return null;
    }

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col md:flex-row">

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-white/[0.06] flex items-center justify-between px-6 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
                        <Shield size={16} className="text-white" />
                    </div>
                    <span className="font-bold text-sm tracking-tight">Admin Panel</span>
                </div>
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Sidebar */}
            <aside className={`
                fixed top-0 bottom-0 w-72 bg-[#0a0a0f] flex flex-col z-40 transition-transform duration-300
                md:translate-x-0 md:relative md:inset-auto md:bg-gradient-to-b md:from-gray-900/80 md:to-gray-950/90
                right-0 md:left-0 md:right-auto
                border-l border-white/[0.06] md:border-l-0 md:border-r
                ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"}
            `}>
                {/* Logo Section (Desktop Only) */}
                <div className="p-6 border-b border-white/[0.06] hidden md:block">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 via-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                            <Shield size={22} className="text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg tracking-tight">Admin Panel</h1>
                            <p className="text-[13px] text-gray-500">Photo Selector</p>
                        </div>
                    </div>
                </div>

                {/* Mobile Header Spacer */}
                <div className="h-16 md:hidden" />

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">
                        Main Menu
                    </p>
                    {navItems.map((item) => {
                        const isActive = item.exact
                            ? pathname === item.href
                            : pathname === item.href || pathname.startsWith(item.href + "/");
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-medium transition-all duration-200 ${isActive
                                    ? "bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-white border border-purple-500/20 shadow-lg shadow-purple-500/5"
                                    : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
                                    }`}
                            >
                                <div className={`${isActive ? "text-purple-400" : "text-gray-500 group-hover:text-gray-300"} transition-colors`}>
                                    <item.icon size={20} strokeWidth={1.8} />
                                </div>
                                {item.label}
                                {isActive && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Section */}
                <div className="p-4 border-t border-white/[0.06] space-y-1">
                    <button
                        onClick={() => {
                            // Clear admin session and redirect
                            document.cookie = `${ADMIN_SESSION_COOKIE}=; path=/; max-age=0`;
                            router.replace("/admin/login");
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                    >
                        <ArrowLeft size={18} strokeWidth={1.8} />
                        Logout Admin
                    </button>
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] text-gray-400 hover:text-white hover:bg-white/[0.04] transition-all"
                    >
                        <ArrowLeft size={18} strokeWidth={1.8} />
                        Back to App
                    </Link>
                </div>
            </aside>

            {/* Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-30 md:hidden animate-in fade-in duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Main Content */}
            <main className="flex-1 min-h-screen overflow-x-hidden md:ml-0 pt-16 md:pt-0">
                {/* Top Bar (Desktop Only) */}
                <header className="hidden md:flex sticky top-0 z-10 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/[0.06] px-8 py-4 items-center justify-between">
                    <div>
                        <p className="text-[13px] text-gray-500">Welcome back,</p>
                        <p className="font-semibold">Administrator</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-sm font-bold">
                            A
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
