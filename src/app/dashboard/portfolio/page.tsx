import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Globe, Settings, Layers, Image as ImageIcon, DollarSign, ExternalLink, Eye, EyeOff, Sparkles, ChevronRight } from "lucide-react";
import { PublishToggle } from "@/components/portfolio/publish-toggle";

export const dynamic = 'force-dynamic';

export default async function PortfolioPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: portfolio } = await supabase.from('fg_portfolios').select('*').eq('user_id', user.id).single();

    let itemsCount = 0, pricingCount = 0;
    if (portfolio) {
        const [i, p] = await Promise.all([
            supabase.from('fg_portfolio_items').select('id', { count: 'exact' }).eq('portfolio_id', portfolio.id),
            supabase.from('fg_portfolio_pricing').select('id', { count: 'exact' }).eq('portfolio_id', portfolio.id)
        ]);
        itemsCount = i.count || 0;
        pricingCount = p.count || 0;
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://yoursite.com';

    return (
        <div className="text-white selection:bg-purple-500/30 max-w-6xl mx-auto py-6">
            <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border-white/5 text-[10px] font-black uppercase tracking-widest text-purple-400 mb-3">
                    <Globe size={12} /> Portfolio Page
                </div>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">Your Landing Page</h2>
                <p className="text-gray-500 font-medium">Create a stunning portfolio page to showcase your work.</p>
            </div>

            {!portfolio ? (
                <div className="glass rounded-[40px] p-10 border-white/5 text-center">
                    <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-purple-500/10 to-pink-500/10 flex items-center justify-center mb-8 border border-purple-500/20">
                        <Sparkles size={40} className="text-purple-500" />
                    </div>
                    <h3 className="text-2xl font-black mb-4">Create Your Portfolio</h3>
                    <p className="text-gray-500 max-w-md mx-auto mb-8">Set up your personal landing page with custom URL, gallery, pricing, and more.</p>
                    <Button asChild size="lg" className="rounded-2xl h-14 px-10 bg-gradient-to-r from-purple-600 to-pink-600 font-bold">
                        <Link href="/dashboard/portfolio/settings">Get Started</Link>
                    </Button>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Status & Publish Card */}
                    <div className={`rounded-[32px] p-6 border transition-all ${portfolio.is_published ? 'glass border-green-500/20 bg-green-500/5' : 'glass border-amber-500/20 bg-amber-500/5'}`}>
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                    {portfolio.is_published ? (
                                        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-green-500/20 text-green-400 text-sm font-bold border border-green-500/30">
                                            <Eye size={14} /> Live & Published
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-400 text-sm font-bold border border-amber-500/30">
                                            <EyeOff size={14} /> Draft Mode
                                        </span>
                                    )}
                                </div>
                                <p className="text-gray-400 text-sm mb-1">Your portfolio URL:</p>
                                <a href={`${baseUrl}/portfolio/${portfolio.slug}`} target="_blank" className="text-purple-400 hover:text-purple-300 font-mono text-sm flex items-center gap-1 mb-4">
                                    {baseUrl}/portfolio/{portfolio.slug} <ExternalLink size={12} />
                                </a>
                                {!portfolio.is_published && (
                                    <p className="text-amber-400/80 text-xs">⚠️ Your portfolio is not visible to the public yet. Click &quot;Publish Now&quot; to go live!</p>
                                )}
                            </div>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                <PublishToggle isPublished={portfolio.is_published} variant="prominent" />
                                <Button asChild variant="outline" className="rounded-xl border-white/10 hover:bg-white/5 h-14 px-6">
                                    <a href={`/portfolio/${portfolio.slug}`} target="_blank"><Eye size={16} className="mr-2" /> Preview</a>
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[{ label: "Gallery Items", value: itemsCount, icon: ImageIcon, color: "text-blue-500", bg: "bg-blue-500/10" }, { label: "Pricing Packages", value: pricingCount, icon: DollarSign, color: "text-green-500", bg: "bg-green-500/10" }].map((stat, i) => (
                            <div key={i} className="glass rounded-2xl p-4 border-white/5">
                                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}><stat.icon size={18} className={stat.color} /></div>
                                <p className="text-2xl font-black">{stat.value}</p>
                                <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { title: "Settings", description: "URL, name, contact info", href: "/dashboard/portfolio/settings", icon: Settings, color: "from-gray-600 to-gray-700" },
                            { title: "Sections", description: "Reorder & customize sections", href: "/dashboard/portfolio/sections", icon: Layers, color: "from-purple-600 to-indigo-600" },
                            { title: "Gallery", description: `${itemsCount} items`, href: "/dashboard/portfolio/gallery", icon: ImageIcon, color: "from-blue-600 to-cyan-600" },
                            { title: "Pricing", description: `${pricingCount} packages`, href: "/dashboard/portfolio/packages", icon: DollarSign, color: "from-green-600 to-emerald-600" }
                        ].map((item, i) => (
                            <Link key={i} href={item.href} className="group">
                                <div className="glass rounded-[24px] p-5 border-white/5 hover:border-purple-500/30 transition-all flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}><item.icon size={20} /></div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-white group-hover:text-purple-400 transition-colors">{item.title}</h4>
                                        <p className="text-sm text-gray-500">{item.description}</p>
                                    </div>
                                    <ChevronRight size={20} className="text-gray-600 group-hover:text-white transition-all" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
