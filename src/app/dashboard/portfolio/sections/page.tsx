"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Loader2, GripVertical, Eye, EyeOff, Image as ImageIcon, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { getPortfolioSections, updateSection, reorderSections } from "@/actions/portfolio";
import { parseGDriveLink, getPlaceholderImage } from "@/lib/gdrive-utils";
import { toast } from "sonner";

interface Section { id: string; section_key: string; display_order: number; is_visible: boolean; custom_title: string | null; }

const SECTION_LABELS: Record<string, string> = { hero: "Hero", about: "About Me", portfolio: "Portfolio Gallery", pricing: "Pricing", contact: "Contact" };

export default function PortfolioSectionsPage() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [portfolioId, setPortfolioId] = useState<string | null>(null);
    const [sections, setSections] = useState<Section[]>([]);
    const [expandedSection, setExpandedSection] = useState<string | null>(null);
    const [heroTitle, setHeroTitle] = useState("");
    const [heroSubtitle, setHeroSubtitle] = useState("");
    const [heroImageUrl, setHeroImageUrl] = useState("");
    const [aboutTitle, setAboutTitle] = useState("");
    const [aboutBody, setAboutBody] = useState("");
    const [aboutImageUrl, setAboutImageUrl] = useState("");

    useEffect(() => {
        const load = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push("/login"); return; }
            const { data: portfolio } = await supabase.from('fg_portfolios').select('*').eq('user_id', user.id).single();
            if (!portfolio) { toast.error("Please set up your portfolio first"); router.push("/dashboard/portfolio/settings"); return; }
            setPortfolioId(portfolio.id);
            setHeroTitle(portfolio.hero_title || ""); setHeroSubtitle(portfolio.hero_subtitle || ""); setHeroImageUrl(portfolio.hero_image_url || "");
            setAboutTitle(portfolio.about_title || ""); setAboutBody(portfolio.about_body || ""); setAboutImageUrl(portfolio.about_image_url || "");
            const sectionData = await getPortfolioSections(portfolio.id);
            setSections(sectionData);
            setLoading(false);
        };
        load();
    }, [supabase, router]);

    const handleToggleVisibility = async (section: Section) => {
        const newVis = !section.is_visible;
        setSections(prev => prev.map(s => s.id === section.id ? { ...s, is_visible: newVis } : s));
        const result = await updateSection(section.id, { is_visible: newVis });
        if (!result.success) { toast.error("Failed to update"); setSections(prev => prev.map(s => s.id === section.id ? { ...s, is_visible: section.is_visible } : s)); }
    };

    const handleMoveSection = async (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === sections.length - 1) return;
        const newSections = [...sections];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
        const reordered = newSections.map((s, i) => ({ ...s, display_order: i + 1 }));
        setSections(reordered);
        await reorderSections(reordered.map(s => ({ id: s.id, display_order: s.display_order })));
    };

    const handleSaveContent = async () => {
        if (!portfolioId) return;
        setSaving(true);
        const parsedHeroImage = heroImageUrl ? parseGDriveLink(heroImageUrl) || heroImageUrl : null;
        const parsedAboutImage = aboutImageUrl ? parseGDriveLink(aboutImageUrl) || aboutImageUrl : null;
        const { error } = await supabase.from('fg_portfolios').update({ hero_title: heroTitle, hero_subtitle: heroSubtitle, hero_image_url: parsedHeroImage, about_title: aboutTitle, about_body: aboutBody, about_image_url: parsedAboutImage, updated_at: new Date().toISOString() }).eq('id', portfolioId);
        setSaving(false);
        if (error) { toast.error("Failed to save: " + error.message); } else { toast.success("Content saved!"); }
    };

    if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="animate-spin text-purple-500" size={32} /></div>;

    return (
        <div className="text-white max-w-3xl mx-auto py-6">
            <div className="mb-8">
                <Link href="/dashboard/portfolio" className="flex items-center text-sm font-medium text-gray-500 hover:text-white transition mb-2"><ArrowLeft size={16} className="mr-1" /> Back</Link>
                <h2 className="text-2xl font-black tracking-tight">Section Manager</h2>
                <p className="text-gray-500 text-sm mt-1">Reorder sections and edit content</p>
            </div>
            <div className="space-y-4">
                {sections.map((section, index) => (
                    <div key={section.id} className="glass rounded-[20px] border-white/5 overflow-hidden">
                        <div className="p-4 flex items-center gap-3">
                            <GripVertical size={18} className="text-gray-600" />
                            <div className="flex-1"><span className="font-bold text-white">{SECTION_LABELS[section.section_key] || section.section_key}</span></div>
                            <div className="flex gap-1">
                                <button onClick={() => handleMoveSection(index, 'up')} disabled={index === 0} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30"><ChevronUp size={16} /></button>
                                <button onClick={() => handleMoveSection(index, 'down')} disabled={index === sections.length - 1} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30"><ChevronDown size={16} /></button>
                            </div>
                            <button onClick={() => handleToggleVisibility(section)} className={`p-2 rounded-xl transition ${section.is_visible ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-gray-500'}`}>{section.is_visible ? <Eye size={16} /> : <EyeOff size={16} />}</button>
                            {(section.section_key === 'hero' || section.section_key === 'about') && <button onClick={() => setExpandedSection(expandedSection === section.section_key ? null : section.section_key)} className="px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-400 text-xs font-medium">Edit Content</button>}
                        </div>
                        {expandedSection === 'hero' && section.section_key === 'hero' && (
                            <div className="px-4 pb-4 space-y-4 border-t border-white/5 pt-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2"><label className="text-sm font-medium text-gray-400">Hero Title</label><Input value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} placeholder="CAPTURING MOMENTS" className="h-12 bg-white/5 border-white/10 rounded-xl" /></div>
                                    <div className="space-y-2"><label className="text-sm font-medium text-gray-400">Hero Subtitle</label><Input value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} placeholder="Photography" className="h-12 bg-white/5 border-white/10 rounded-xl" /></div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400 flex items-center gap-2"><ImageIcon size={14} /> Background Image (GDrive Link)</label>
                                    <Input value={heroImageUrl} onChange={(e) => setHeroImageUrl(e.target.value)} placeholder="https://drive.google.com/file/d/.../view" className="h-12 bg-white/5 border-white/10 rounded-xl font-mono text-sm" />
                                    {heroImageUrl && <div className="mt-2 rounded-xl overflow-hidden h-32 bg-white/5"><img src={parseGDriveLink(heroImageUrl) || heroImageUrl} alt="Hero preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = getPlaceholderImage('hero'); }} /></div>}
                                </div>
                            </div>
                        )}
                        {expandedSection === 'about' && section.section_key === 'about' && (
                            <div className="px-4 pb-4 space-y-4 border-t border-white/5 pt-4">
                                <div className="space-y-2"><label className="text-sm font-medium text-gray-400">About Title</label><Input value={aboutTitle} onChange={(e) => setAboutTitle(e.target.value)} placeholder="ABOUT ME" className="h-12 bg-white/5 border-white/10 rounded-xl" /></div>
                                <div className="space-y-2"><label className="text-sm font-medium text-gray-400">About Text</label><Textarea value={aboutBody} onChange={(e) => setAboutBody(e.target.value)} placeholder="Tell your story..." rows={5} className="bg-white/5 border-white/10 rounded-xl resize-none" /></div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400 flex items-center gap-2"><ImageIcon size={14} /> Profile Image (GDrive Link)</label>
                                    <Input value={aboutImageUrl} onChange={(e) => setAboutImageUrl(e.target.value)} placeholder="https://drive.google.com/file/d/.../view" className="h-12 bg-white/5 border-white/10 rounded-xl font-mono text-sm" />
                                    {aboutImageUrl && <div className="mt-2 rounded-xl overflow-hidden h-40 w-32 bg-white/5"><img src={parseGDriveLink(aboutImageUrl) || aboutImageUrl} alt="About preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = getPlaceholderImage('about'); }} /></div>}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <div className="mt-8"><Button onClick={handleSaveContent} disabled={saving} className="w-full h-14 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 font-bold text-lg">{saving ? <><Loader2 size={20} className="mr-2 animate-spin" /> Saving...</> : <><Save size={20} className="mr-2" /> Save Content</>}</Button></div>
            <div className="mt-6 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20"><p className="text-sm text-purple-300"><strong>Tips:</strong> For Portfolio and Pricing sections, manage content from their dedicated pages.</p></div>
        </div>
    );
}
