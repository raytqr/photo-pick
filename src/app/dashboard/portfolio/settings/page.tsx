"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, Loader2, Check, X, Globe, MessageCircle, Instagram, Mail, Eye, EyeOff, Rocket } from "lucide-react";
import Link from "next/link";
import { upsertPortfolio, checkPortfolioSlugAvailability, togglePortfolioPublish } from "@/actions/portfolio";
import { toast } from "sonner";

export default function PortfolioSettingsPage() {
    const router = useRouter();
    const supabase = createClient();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [portfolioId, setPortfolioId] = useState<string | null>(null);
    const [isPublished, setIsPublished] = useState(false);
    const [slug, setSlug] = useState("");
    const [photographerName, setPhotographerName] = useState("");
    const [tagline, setTagline] = useState("");
    const [whatsappNumber, setWhatsappNumber] = useState("");
    const [instagramHandle, setInstagramHandle] = useState("");
    const [email, setEmail] = useState("");
    const [contactMethod, setContactMethod] = useState("whatsapp");
    const [contactButtonText, setContactButtonText] = useState("Book Now");
    const [slugChecking, setSlugChecking] = useState(false);
    const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
    const [slugError, setSlugError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push("/login"); return; }
            const { data: profile } = await supabase.from('profiles').select('email, photographer_name').eq('id', user.id).single();
            const { data: portfolio } = await supabase.from('fg_portfolios').select('*').eq('user_id', user.id).single();
            if (portfolio) {
                setPortfolioId(portfolio.id); setSlug(portfolio.slug); setPhotographerName(portfolio.photographer_name);
                setTagline(portfolio.tagline || ""); setWhatsappNumber(portfolio.whatsapp_number || "");
                setInstagramHandle(portfolio.instagram_handle || ""); setEmail(portfolio.email || profile?.email || "");
                setContactMethod(portfolio.contact_method || "whatsapp"); setContactButtonText(portfolio.contact_button_text || "Book Now");
                setIsPublished(portfolio.is_published); setSlugAvailable(true);
            } else {
                setPhotographerName(profile?.photographer_name || ""); setEmail(profile?.email || user.email || "");
            }
            setLoading(false);
        };
        load();
    }, [supabase, router]);

    const handleCheckSlug = async () => {
        if (!slug || slug.length < 3) { setSlugError("Minimum 3 characters"); return; }
        if (!/^[a-z0-9-]+$/.test(slug)) { setSlugError("Only lowercase letters, numbers, and hyphens"); return; }
        setSlugChecking(true); setSlugError(null);
        const result = await checkPortfolioSlugAvailability(slug);
        setSlugAvailable(result.available);
        if (!result.available) setSlugError(result.error || "Not available");
        setSlugChecking(false);
    };

    const handleSave = async () => {
        if (!slug || !photographerName) { toast.error("Slug and name are required"); return; }
        if (slugAvailable !== true) { toast.error("Please check slug availability"); return; }
        setSaving(true);
        const result = await upsertPortfolio({ slug, photographer_name: photographerName, tagline: tagline || null, whatsapp_number: whatsappNumber || null, instagram_handle: instagramHandle || null, email: email || null, contact_method: contactMethod, contact_button_text: contactButtonText });
        setSaving(false);
        if (result.success) { toast.success("Settings saved!"); router.refresh(); } else { toast.error(result.error || "Failed to save"); }
    };

    const handleTogglePublish = async () => {
        const newStatus = !isPublished;
        const result = await togglePortfolioPublish(newStatus);
        if (result.success) { setIsPublished(newStatus); toast.success(newStatus ? "Portfolio published!" : "Unpublished"); }
        else { toast.error(result.error || "Failed"); }
    };

    if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="animate-spin text-purple-500" size={32} /></div>;

    return (
        <div className="text-white max-w-2xl mx-auto py-6">
            <div className="mb-8">
                <Link href="/dashboard/portfolio" className="flex items-center text-sm font-medium text-gray-500 hover:text-white transition mb-2"><ArrowLeft size={16} className="mr-1" /> Back</Link>
                <h2 className="text-2xl font-black tracking-tight">Portfolio Settings</h2>
            </div>

            {/* Publish Status Card */}
            {portfolioId && (
                <div className={`rounded-[24px] p-5 mb-6 border transition-all ${isPublished ? 'bg-green-500/10 border-green-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isPublished ? 'bg-green-500/20' : 'bg-amber-500/20'}`}>
                                {isPublished ? <Eye size={24} className="text-green-400" /> : <EyeOff size={24} className="text-amber-400" />}
                            </div>
                            <div>
                                <p className={`font-bold ${isPublished ? 'text-green-400' : 'text-amber-400'}`}>{isPublished ? 'Portfolio is Live!' : 'Portfolio is Hidden'}</p>
                                <p className="text-xs text-gray-500">{isPublished ? 'Visible to everyone' : 'Only you can see it'}</p>
                            </div>
                        </div>
                        <Button onClick={handleTogglePublish} className={`h-12 px-6 rounded-xl font-bold ${isPublished ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-500/20'}`}>
                            {isPublished ? <><EyeOff size={18} className="mr-2" /> Unpublish</> : <><Rocket size={18} className="mr-2" /> Publish Now</>}
                        </Button>
                    </div>
                </div>
            )}
            <div className="space-y-6">
                <div className="glass rounded-[24px] p-6 border-white/5 space-y-4">
                    <div className="flex items-center gap-2 text-purple-400 font-bold"><Globe size={18} /> Portfolio URL</div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Custom URL Slug</label>
                        <div className="flex gap-2">
                            <div className="flex flex-1">
                                <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-white/10 bg-white/5 text-gray-500 text-sm">/portfolio/</span>
                                <Input value={slug} onChange={(e) => { setSlug(e.target.value.toLowerCase()); setSlugAvailable(null); setSlugError(null); }} placeholder="your-name" className={`rounded-l-none h-12 bg-white/5 border-white/10 ${slugAvailable === false ? 'border-red-500' : slugAvailable === true ? 'border-green-500' : ''}`} />
                            </div>
                            <Button onClick={handleCheckSlug} disabled={slugChecking || !slug} className={`h-12 px-4 rounded-xl ${slugAvailable === true ? 'bg-green-600' : slugAvailable === false ? 'bg-red-600' : 'bg-white/10'}`}>{slugChecking ? <Loader2 size={18} className="animate-spin" /> : slugAvailable === true ? <Check size={18} /> : slugAvailable === false ? <X size={18} /> : "Check"}</Button>
                        </div>
                        {slugError && <p className="text-xs text-red-500">{slugError}</p>}
                        {slugAvailable === true && <p className="text-xs text-green-500">✓ Available!</p>}
                    </div>
                </div>
                <div className="glass rounded-[24px] p-6 border-white/5 space-y-4">
                    <div className="font-bold text-white">Basic Information</div>
                    <div className="space-y-2"><label className="text-sm font-medium text-gray-400">Photographer Name *</label><Input value={photographerName} onChange={(e) => setPhotographerName(e.target.value)} placeholder="Your Name" className="h-12 bg-white/5 border-white/10 rounded-xl" /></div>
                    <div className="space-y-2"><label className="text-sm font-medium text-gray-400">Tagline</label><Input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Capturing moments..." className="h-12 bg-white/5 border-white/10 rounded-xl" /></div>
                </div>
                <div className="glass rounded-[24px] p-6 border-white/5 space-y-4">
                    <div className="font-bold text-white">Contact Information</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2"><label className="text-sm font-medium text-gray-400 flex items-center gap-1"><MessageCircle size={14} /> WhatsApp</label><Input value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} placeholder="628xxx" className="h-12 bg-white/5 border-white/10 rounded-xl" /></div>
                        <div className="space-y-2"><label className="text-sm font-medium text-gray-400 flex items-center gap-1"><Instagram size={14} /> Instagram</label><Input value={instagramHandle} onChange={(e) => setInstagramHandle(e.target.value)} placeholder="your_username" className="h-12 bg-white/5 border-white/10 rounded-xl" /></div>
                        <div className="space-y-2 md:col-span-2"><label className="text-sm font-medium text-gray-400 flex items-center gap-1"><Mail size={14} /> Email</label><Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className="h-12 bg-white/5 border-white/10 rounded-xl" /></div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Primary Contact Method</label>
                        <div className="flex gap-2">
                            {[{ value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle }, { value: 'instagram', label: 'Instagram', icon: Instagram }, { value: 'email', label: 'Email', icon: Mail }].map((opt) => (
                                <button key={opt.value} onClick={() => setContactMethod(opt.value)} className={`flex-1 py-3 px-4 rounded-xl border transition-all flex items-center justify-center gap-2 text-sm font-medium ${contactMethod === opt.value ? 'bg-purple-500/20 border-purple-500/50 text-purple-400' : 'bg-white/5 border-white/10 text-gray-400'}`}><opt.icon size={16} />{opt.label}</button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-2"><label className="text-sm font-medium text-gray-400">Contact Button Text</label><Input value={contactButtonText} onChange={(e) => setContactButtonText(e.target.value)} placeholder="Book Now" className="h-12 bg-white/5 border-white/10 rounded-xl" /></div>
                </div>
                <Button onClick={handleSave} disabled={saving || !slug || !photographerName || slugAvailable !== true} className="w-full h-14 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 font-bold text-lg">{saving ? <><Loader2 size={20} className="mr-2 animate-spin" /> Saving...</> : <><Save size={20} className="mr-2" /> Save Settings</>}</Button>
            </div>
        </div>
    );
}
