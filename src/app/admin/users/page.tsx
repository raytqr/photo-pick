import { getAllUsers } from "@/actions/admin";
import {
    Crown,
    Calendar,
    Image,
    FolderOpen,
    Mail,
    User,
    Clock,
    Search,
    Filter,
    ChevronRight
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

function formatDate(dateString: string | null) {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function isExpired(dateString: string | null) {
    if (!dateString) return true;
    return new Date(dateString) < new Date();
}

function getTierStyle(tier: string) {
    switch (tier.toLowerCase()) {
        case "unlimited":
            return "bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-400 border-orange-500/30";
        case "pro":
            return "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30";
        case "basic":
            return "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-400 border-blue-500/30";
        case "starter":
            return "bg-gradient-to-r from-gray-500/20 to-slate-500/20 text-gray-300 border-gray-500/30";
        default:
            return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
}

export default async function AdminUsersPage() {
    const { users, error } = await getAllUsers();

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <p className="text-red-400">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Users</h1>
                    <p className="text-gray-500 text-[15px]">
                        {users.length} registered users
                    </p>
                </div>
            </div>

            {/* Users Grid */}
            <div className="grid gap-4">
                {users.map((user) => {
                    const expired = isExpired(user.subscription_expires_at);
                    const tier = user.subscription_tier || "free";

                    return (
                        <div
                            key={user.id}
                            className="group bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] hover:border-white/10 rounded-2xl p-5 transition-all duration-300"
                        >
                            <div className="flex items-start gap-5">
                                {/* Avatar */}
                                <div className="shrink-0">
                                    {user.logo_url ? (
                                        <img
                                            src={user.logo_url}
                                            alt=""
                                            className="w-14 h-14 rounded-2xl object-cover border border-white/10"
                                        />
                                    ) : (
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center border border-white/10">
                                            <User size={24} className="text-gray-500" />
                                        </div>
                                    )}
                                </div>

                                {/* User Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4 mb-3">
                                        <div>
                                            <h3 className="font-semibold text-lg group-hover:text-white transition-colors">
                                                {user.photographer_name || "Unnamed User"}
                                            </h3>
                                            <p className="text-gray-500 text-[13px] flex items-center gap-1.5 mt-0.5">
                                                <Mail size={12} />
                                                {user.email}
                                            </p>
                                        </div>

                                        {/* Tier Badge */}
                                        <div className={`px-3 py-1.5 rounded-lg text-[12px] font-bold border ${getTierStyle(tier)}`}>
                                            <Crown size={12} className="inline mr-1.5 -mt-0.5" />
                                            {tier.toUpperCase()}
                                            {expired && tier !== "free" && (
                                                <span className="ml-2 text-red-400">• Expired</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Stats Row */}
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                        {/* Events */}
                                        <div className="bg-white/[0.03] rounded-xl p-3">
                                            <div className="flex items-center gap-2 text-purple-400 mb-1">
                                                <FolderOpen size={14} />
                                                <span className="text-[11px] uppercase font-semibold tracking-wide">Events</span>
                                            </div>
                                            <p className="text-xl font-bold">{user.eventsCount}</p>
                                            {user.events.length > 0 && (
                                                <p className="text-[11px] text-gray-500 mt-1 truncate">
                                                    {user.events.slice(0, 2).map((e: { name: string }) => e.name).join(", ")}
                                                    {user.events.length > 2 && ` +${user.events.length - 2}`}
                                                </p>
                                            )}
                                        </div>

                                        {/* Photos */}
                                        <div className="bg-white/[0.03] rounded-xl p-3">
                                            <div className="flex items-center gap-2 text-blue-400 mb-1">
                                                <Image size={14} />
                                                <span className="text-[11px] uppercase font-semibold tracking-wide">Photos</span>
                                            </div>
                                            <p className="text-xl font-bold">{user.photosCount.toLocaleString()}</p>
                                        </div>

                                        {/* Quota Used */}
                                        <div className="bg-white/[0.03] rounded-xl p-3">
                                            <div className="flex items-center gap-2 text-orange-400 mb-1">
                                                <Clock size={14} />
                                                <span className="text-[11px] uppercase font-semibold tracking-wide">Quota Used</span>
                                            </div>
                                            <p className="text-xl font-bold">{user.total_events_created || 0}</p>
                                        </div>

                                        {/* Quota Remaining */}
                                        <div className="bg-white/[0.03] rounded-xl p-3">
                                            <div className="flex items-center gap-2 text-green-400 mb-1">
                                                <ChevronRight size={14} />
                                                <span className="text-[11px] uppercase font-semibold tracking-wide">Remaining</span>
                                            </div>
                                            <p className="text-xl font-bold text-green-400">{user.events_remaining || 0}</p>
                                        </div>

                                        {/* Dates */}
                                        <div className="bg-white/[0.03] rounded-xl p-3">
                                            <div className="flex items-center gap-2 text-gray-400 mb-1">
                                                <Calendar size={14} />
                                                <span className="text-[11px] uppercase font-semibold tracking-wide">Dates</span>
                                            </div>
                                            <p className="text-[12px] text-gray-400">
                                                <span className="text-gray-500">Joined:</span> {formatDate(user.created_at)}
                                            </p>
                                            <p className={`text-[12px] ${expired ? "text-red-400" : "text-gray-400"}`}>
                                                <span className="text-gray-500">Expires:</span> {formatDate(user.subscription_expires_at)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {users.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center mb-4">
                        <User size={28} className="text-gray-600" />
                    </div>
                    <p className="text-gray-400 font-medium">No users found</p>
                    <p className="text-gray-600 text-sm">Users will appear here once they register</p>
                </div>
            )}
        </div>
    );
}
