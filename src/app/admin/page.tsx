import { getAdminStats } from "@/actions/admin";
import { Users, FolderOpen, Image, TrendingUp, ArrowUpRight, Sparkles } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
    const stats = await getAdminStats();

    if ("error" in stats && stats.error) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-red-500/10 rounded-2xl flex items-center justify-center">
                        <Sparkles className="text-red-400" size={28} />
                    </div>
                    <p className="text-red-400 font-medium">{stats.error}</p>
                </div>
            </div>
        );
    }

    const statCards = [
        {
            label: "Total Users",
            value: stats.totalUsers,
            icon: Users,
            gradient: "from-blue-500 to-cyan-400",
            bgGradient: "from-blue-500/10 to-cyan-500/10",
            href: "/admin/users",
        },
        {
            label: "Active Events",
            value: stats.totalEvents,
            icon: FolderOpen,
            gradient: "from-purple-500 to-pink-500",
            bgGradient: "from-purple-500/10 to-pink-500/10",
            href: "/admin/users",
        },
        {
            label: "Total Photos",
            value: stats.totalPhotos,
            icon: Image,
            gradient: "from-orange-500 to-red-500",
            bgGradient: "from-orange-500/10 to-red-500/10",
            href: "/admin/users",
        },
    ];

    const quickActions = [
        {
            label: "Manage Users",
            description: "View and manage all registered users",
            icon: Users,
            href: "/admin/users",
            gradient: "from-blue-600 to-cyan-600",
        },
        {
            label: "Pricing Plans",
            description: "Configure subscription pricing",
            icon: TrendingUp,
            href: "/admin/pricing",
            gradient: "from-purple-600 to-pink-600",
        },
        {
            label: "Redeem Codes",
            description: "Create and manage promo codes",
            icon: Sparkles,
            href: "/admin/redeem-codes",
            gradient: "from-orange-600 to-red-600",
        },
    ];

    return (
        <div className="space-y-8 max-w-6xl">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-gray-500 text-[15px]">
                    Overview of your Photo Selector platform
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {statCards.map((stat) => (
                    <Link
                        key={stat.label}
                        href={stat.href}
                        className={`group relative overflow-hidden bg-gradient-to-br ${stat.bgGradient} border border-white/[0.06] rounded-2xl p-6 hover:border-white/10 transition-all duration-300 hover:scale-[1.02]`}
                    >
                        {/* Background Glow */}
                        <div className={`absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br ${stat.gradient} rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity`} />

                        <div className="relative">
                            <div className="flex items-start justify-between mb-6">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                                    <stat.icon size={22} className="text-white" />
                                </div>
                                <ArrowUpRight size={18} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
                            </div>

                            <p className="text-4xl font-bold tracking-tight mb-1">
                                {stat.value?.toLocaleString()}
                            </p>
                            <p className="text-gray-500 text-[14px] font-medium">{stat.label}</p>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {quickActions.map((action) => (
                        <Link
                            key={action.label}
                            href={action.href}
                            className="group relative bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] hover:border-white/10 rounded-2xl p-5 transition-all duration-300"
                        >
                            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                                <action.icon size={20} className="text-white" />
                            </div>
                            <h3 className="font-semibold mb-1 group-hover:text-white transition-colors">{action.label}</h3>
                            <p className="text-gray-500 text-[13px] leading-relaxed">{action.description}</p>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Info Banner */}
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
                        <Sparkles size={18} className="text-purple-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-purple-300 mb-1">Admin Access</h3>
                        <p className="text-gray-400 text-[14px] leading-relaxed">
                            You have full administrative access to manage users, pricing, and promotional codes.
                            All changes are logged for security purposes.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
