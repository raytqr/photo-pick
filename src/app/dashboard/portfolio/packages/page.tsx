"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, Loader2, Trash2, Edit2, X, Check, Star, DollarSign } from "lucide-react";
import Link from "next/link";
import { getPricingPackages, addPricingPackage, updatePricingPackage, deletePricingPackage, type PortfolioPricing } from "@/actions/portfolio";
import { toast } from "sonner";

export default function PortfolioPackagesPage() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [portfolioId, setPortfolioId] = useState<string | null>(null);
    const [packages, setPackages] = useState<PortfolioPricing[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: "", subtitle: "", price: "", original_price: "", category: "", is_recommended: false, features: [""] });
    const [saving, setSaving] = useState(false);

    const categories = Array.from(new Set(packages.map(p => p.category))).filter(Boolean);

    useEffect(() => {
        const load = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push("/login"); return; }
            const { data: portfolio } = await supabase.from('fg_portfolios').select('id').eq('user_id', user.id).single();
            if (!portfolio) { toast.error("Please set up your portfolio first"); router.push("/dashboard/portfolio/settings"); return; }
            setPortfolioId(portfolio.id);
            const pkgs = await getPricingPackages(portfolio.id);
            setPackages(pkgs);
            setLoading(false);
        };
        load();
    }, [supabase, router]);

    const resetForm = () => { setShowForm(false); setEditingId(null); setFormData({ name: "", subtitle: "", price: "", original_price: "", category: "", is_recommended: false, features: [""] }); };
    const openEditForm = (pkg: PortfolioPricing) => { setEditingId(pkg.id); setFormData({ name: pkg.name, subtitle: pkg.subtitle || "", price: pkg.price, original_price: pkg.original_price || "", category: pkg.category, is_recommended: pkg.is_recommended, features: pkg.features.length > 0 ? pkg.features : [""] }); setShowForm(true); };

    const handleSave = async () => {
        if (!portfolioId || !formData.name || !formData.price) { toast.error("Name and price required"); return; }
        setSaving(true);
        const cleanFeatures = formData.features.filter(f => f.trim() !== "");
        if (editingId) {
            const result = await updatePricingPackage(editingId, { name: formData.name, subtitle: formData.subtitle || null, price: formData.price, original_price: formData.original_price || null, category: formData.category || "General", is_recommended: formData.is_recommended, features: cleanFeatures });
            if (result.success) { setPackages(prev => prev.map(p => p.id === editingId ? { ...p, ...formData, features: cleanFeatures } : p)); toast.success("Updated!"); resetForm(); }
            else { toast.error(result.error || "Failed"); }
        } else {
            const result = await addPricingPackage(portfolioId, { name: formData.name, subtitle: formData.subtitle || undefined, price: formData.price, original_price: formData.original_price || undefined, category: formData.category || "General", is_recommended: formData.is_recommended, features: cleanFeatures });
            if (result.success) { const updated = await getPricingPackages(portfolioId); setPackages(updated); toast.success("Package added!"); resetForm(); }
            else { toast.error(result.error || "Failed"); }
        }
        setSaving(false);
    };

    const handleDelete = async (id: string) => { if (!confirm("Delete?")) return; const result = await deletePricingPackage(id); if (result.success) { setPackages(prev => prev.filter(p => p.id !== id)); toast.success("Deleted!"); } else { toast.error(result.error || "Failed"); } };
    const addFeatureField = () => { setFormData(prev => ({ ...prev, features: [...prev.features, ""] })); };
    const updateFeature = (index: number, value: string) => { setFormData(prev => ({ ...prev, features: prev.features.map((f, i) => i === index ? value : f) })); };
    const removeFeature = (index: number) => { if (formData.features.length <= 1) return; setFormData(prev => ({ ...prev, features: prev.features.filter((_, i) => i !== index) })); };

    if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="animate-spin text-purple-500" size={32} /></div>;

    return (
        <div className="text-white max-w-6xl mx-auto py-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <Link href="/dashboard/portfolio" className="flex items-center text-sm font-medium text-gray-500 hover:text-white transition mb-2"><ArrowLeft size={16} className="mr-1" /> Back</Link>
                    <h2 className="text-2xl font-black tracking-tight">Pricing Packages</h2>
                    <p className="text-gray-500 text-sm mt-1">{packages.length} package{packages.length !== 1 ? 's' : ''}</p>
                </div>
                <Button onClick={() => setShowForm(true)} className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 font-bold"><Plus size={18} className="mr-1" /> Add Package</Button>
            </div>
            {showForm && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="glass rounded-[24px] p-6 w-full max-w-lg border-white/10 my-8">
                        <div className="flex items-center justify-between mb-6"><h3 className="text-xl font-bold">{editingId ? "Edit Package" : "Add Package"}</h3><button onClick={resetForm} className="p-2 hover:bg-white/10 rounded-lg"><X size={20} /></button></div>
                        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2"><label className="text-sm font-medium text-gray-400">Package Name *</label><Input value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} placeholder="Basic Package" className="h-12 bg-white/5 border-white/10 rounded-xl" /></div>
                                <div className="space-y-2"><label className="text-sm font-medium text-gray-400">Category</label><Input value={formData.category} onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))} placeholder="Wedding" className="h-12 bg-white/5 border-white/10 rounded-xl" list="pkg-categories" /><datalist id="pkg-categories">{categories.map(cat => <option key={cat} value={cat} />)}</datalist></div>
                            </div>
                            <div className="space-y-2"><label className="text-sm font-medium text-gray-400">Subtitle</label><Input value={formData.subtitle} onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))} placeholder="Perfect for..." className="h-12 bg-white/5 border-white/10 rounded-xl" /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2"><label className="text-sm font-medium text-gray-400">Price *</label><Input value={formData.price} onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))} placeholder="Rp 500.000" className="h-12 bg-white/5 border-white/10 rounded-xl" /></div>
                                <div className="space-y-2"><label className="text-sm font-medium text-gray-400">Original Price</label><Input value={formData.original_price} onChange={(e) => setFormData(prev => ({ ...prev, original_price: e.target.value }))} placeholder="Rp 750.000" className="h-12 bg-white/5 border-white/10 rounded-xl" /></div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">Features</label>
                                {formData.features.map((feature, index) => (
                                    <div key={index} className="flex gap-2"><Input value={feature} onChange={(e) => updateFeature(index, e.target.value)} placeholder="Feature" className="h-10 bg-white/5 border-white/10 rounded-lg flex-1" />{formData.features.length > 1 && <button onClick={() => removeFeature(index)} className="p-2 hover:bg-red-500/20 rounded-lg text-red-400"><X size={16} /></button>}</div>
                                ))}
                                <Button type="button" variant="outline" size="sm" onClick={addFeatureField} className="rounded-lg border-white/10 text-gray-400"><Plus size={14} className="mr-1" /> Add Feature</Button>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                                <button onClick={() => setFormData(prev => ({ ...prev, is_recommended: !prev.is_recommended }))} className={`w-12 h-6 rounded-full transition-all ${formData.is_recommended ? 'bg-amber-500' : 'bg-white/10'}`}><div className={`w-5 h-5 rounded-full bg-white shadow transition-all ${formData.is_recommended ? 'translate-x-6' : 'translate-x-0.5'}`} /></button>
                                <div className="flex items-center gap-2"><Star size={16} className={formData.is_recommended ? 'text-amber-400' : 'text-gray-500'} /><span className={formData.is_recommended ? 'text-amber-400 font-medium' : 'text-gray-400'}>Mark as Recommended</span></div>
                            </div>
                        </div>
                        <Button onClick={handleSave} disabled={saving || !formData.name || !formData.price} className="w-full h-12 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 font-bold mt-6">{saving ? <Loader2 size={18} className="animate-spin mr-2" /> : <Check size={18} className="mr-2" />}{editingId ? "Save Changes" : "Add Package"}</Button>
                    </div>
                </div>
            )}
            {packages.length === 0 ? (
                <div className="glass rounded-[32px] p-16 text-center border-white/5"><DollarSign size={48} className="mx-auto text-gray-600 mb-4" /><h3 className="text-xl font-bold mb-2">No Pricing Packages</h3><p className="text-gray-500 mb-6">Add your first pricing package</p><Button onClick={() => setShowForm(true)} className="rounded-xl"><Plus size={18} className="mr-2" /> Add Package</Button></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {packages.map((pkg) => (
                        <div key={pkg.id} className={`glass rounded-[24px] p-6 border transition-all relative ${pkg.is_recommended ? 'border-amber-500/50 bg-amber-500/5' : 'border-white/5 hover:border-purple-500/30'}`}>
                            {pkg.is_recommended && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-500 text-black text-xs font-bold rounded-full flex items-center gap-1"><Star size={12} /> RECOMMENDED</div>}
                            <div className="flex items-start justify-between mb-4">
                                <div><span className="text-xs font-medium text-purple-400 uppercase tracking-wider">{pkg.category}</span><h3 className="text-xl font-bold mt-1">{pkg.name}</h3>{pkg.subtitle && <p className="text-sm text-gray-500 mt-1">{pkg.subtitle}</p>}</div>
                                <div className="flex gap-1"><button onClick={() => openEditForm(pkg)} className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"><Edit2 size={16} /></button><button onClick={() => handleDelete(pkg.id)} className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400"><Trash2 size={16} /></button></div>
                            </div>
                            <div className="mb-4"><span className="text-3xl font-black">{pkg.price}</span>{pkg.original_price && <span className="text-sm text-gray-500 line-through ml-2">{pkg.original_price}</span>}</div>
                            {pkg.features.length > 0 && <ul className="space-y-2">{pkg.features.map((feature, i) => <li key={i} className="flex items-center gap-2 text-sm text-gray-300"><Check size={14} className="text-green-400 flex-shrink-0" />{feature}</li>)}</ul>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
