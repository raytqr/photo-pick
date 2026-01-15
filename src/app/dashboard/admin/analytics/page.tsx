import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { getAnalyticsSummary, getMonthlyRecap, getRecentActivityLogs } from "@/actions/analytics";
import { ArrowLeft, Users, Calendar, Image, CreditCard, TrendingUp, Activity, AlertCircle } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

export default async function AdminAnalyticsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.email !== ADMIN_EMAIL) {
        redirect("/dashboard");
    }

    // Fetch current month and previous month data
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    const [summary, currentRecap, prevRecap, recentLogs] = await Promise.all([
        getAnalyticsSummary(),
        getMonthlyRecap(currentYear, currentMonth),
        getMonthlyRecap(prevYear, prevMonth),
        getRecentActivityLogs(20),
    ]);

    if ("error" in summary) {
        return (
            <div className="min-h-screen bg-[#030014] text-white flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
                    <p>Error: {summary.error}</p>
                </div>
            </div>
        );
    }

    const tierColors: Record<string, string> = {
        free: "bg-gray-500",
        starter: "bg-blue-500",
        basic: "bg-green-500",
        pro: "bg-purple-500",
        unlimited: "bg-amber-500",
    };

    return (
        <div className="min-h-screen bg-[#030014] text-white p-4 sm:p-6 lg:p-8 space-y-6">
            {/* Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-purple-900/10 blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-blue-900/10 blur-[120px]" />
            </div>

            {/* Header */}
            <div>
                <Link href="/dashboard" className="flex items-center text-sm font-medium text-gray-500 hover:text-white transition mb-2">
                    <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
                </Link>
                <h1 className="text-3xl font-bold">📊 Admin Analytics</h1>
                <p className="text-gray-500">Platform overview and insights</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={<Users size={24} />} label="Total Users" value={summary.totalUsers} color="blue" />
                <StatCard icon={<Calendar size={24} />} label="Total Events" value={summary.totalEvents} color="purple" />
                <StatCard icon={<Image size={24} />} label="Total Photos" value={summary.totalPhotos.toLocaleString()} color="green" />
                <StatCard icon={<CreditCard size={24} />} label="Active Subs" value={summary.activeSubscriptions} color="amber" />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass rounded-2xl p-6 border-white/5">
                    <div className="flex items-center gap-2 text-green-400 mb-2">
                        <TrendingUp size={20} />
                        <span className="font-semibold">Last 7 Days</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-3xl font-bold">{summary.recentSignups}</p>
                            <p className="text-gray-500 text-sm">New Users</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold">{summary.recentEvents}</p>
                            <p className="text-gray-500 text-sm">New Events</p>
                        </div>
                    </div>
                </div>

                <div className="glass rounded-2xl p-6 border-white/5">
                    <div className="flex items-center gap-2 text-purple-400 mb-2">
                        <CreditCard size={20} />
                        <span className="font-semibold">Redeem Codes (30d)</span>
                    </div>
                    <p className="text-3xl font-bold">{summary.redeemCodeUsage}</p>
                    <p className="text-gray-500 text-sm">Codes redeemed</p>
                </div>

                <div className="glass rounded-2xl p-6 border-white/5">
                    <h3 className="font-semibold mb-3">Users by Tier</h3>
                    <div className="space-y-2">
                        {Object.entries(summary.usersByTier).sort((a, b) => b[1] - a[1]).map(([tier, count]) => (
                            <div key={tier} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${tierColors[tier] || 'bg-gray-500'}`} />
                                    <span className="capitalize text-sm">{tier}</span>
                                </div>
                                <span className="font-bold">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Monthly Recap */}
            <div className="glass rounded-2xl p-6 border-white/5">
                <h2 className="font-bold text-xl mb-4">📅 Monthly Recap</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {!("error" in currentRecap) && (
                        <RecapCard
                            title={currentRecap.month}
                            newUsers={currentRecap.newUsers}
                            newEvents={currentRecap.newEvents}
                            redeemCodes={currentRecap.redeemCodesUsed}
                            current
                        />
                    )}
                    {!("error" in prevRecap) && (
                        <RecapCard
                            title={prevRecap.month}
                            newUsers={prevRecap.newUsers}
                            newEvents={prevRecap.newEvents}
                            redeemCodes={prevRecap.redeemCodesUsed}
                        />
                    )}
                </div>
            </div>

            {/* Recent Activity Logs */}
            <div className="glass rounded-2xl p-6 border-white/5">
                <div className="flex items-center gap-2 mb-4">
                    <Activity size={20} className="text-blue-400" />
                    <h2 className="font-bold text-xl">Recent Activity</h2>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {"logs" in recentLogs && recentLogs.logs.map((log: any) => (
                        <div key={log.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl text-sm">
                            <div className="flex items-center gap-3">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${log.status === 'success' ? 'bg-green-500/20 text-green-400' :
                                        log.status === 'error' ? 'bg-red-500/20 text-red-400' :
                                            'bg-yellow-500/20 text-yellow-400'
                                    }`}>
                                    {log.status}
                                </span>
                                <span className="font-medium">{log.action}</span>
                                <span className="text-gray-500 truncate max-w-[200px]">
                                    {log.profiles?.email || 'Unknown'}
                                </span>
                            </div>
                            <span className="text-gray-500 text-xs">
                                {new Date(log.created_at).toLocaleString('id-ID')}
                            </span>
                        </div>
                    ))}
                    {"logs" in recentLogs && recentLogs.logs.length === 0 && (
                        <p className="text-center text-gray-500 py-8">No activity logs yet</p>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
    const colorClasses: Record<string, string> = {
        blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        purple: "bg-purple-500/20 text-purple-400 border-purple-500/30",
        green: "bg-green-500/20 text-green-400 border-green-500/30",
        amber: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    };

    return (
        <div className={`rounded-2xl p-5 border ${colorClasses[color]}`}>
            <div className="mb-2">{icon}</div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm opacity-70">{label}</p>
        </div>
    );
}

function RecapCard({ title, newUsers, newEvents, redeemCodes, current }: {
    title: string;
    newUsers: number;
    newEvents: number;
    redeemCodes: number;
    current?: boolean;
}) {
    return (
        <div className={`p-4 rounded-xl ${current ? 'bg-purple-500/10 border border-purple-500/30' : 'bg-white/5'}`}>
            <h3 className="font-bold mb-3">{title} {current && <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full ml-2">Current</span>}</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                    <p className="text-xl font-bold">{newUsers}</p>
                    <p className="text-xs text-gray-500">Users</p>
                </div>
                <div>
                    <p className="text-xl font-bold">{newEvents}</p>
                    <p className="text-xs text-gray-500">Events</p>
                </div>
                <div>
                    <p className="text-xl font-bold">{redeemCodes}</p>
                    <p className="text-xs text-gray-500">Redeems</p>
                </div>
            </div>
        </div>
    );
}
