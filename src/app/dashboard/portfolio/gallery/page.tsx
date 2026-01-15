"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, Loader2, Trash2, FolderOpen, Image as ImageIcon, Edit2, X, Check } from "lucide-react";
import Link from "next/link";
import { getPortfolioItems, addPortfolioItem, addItemsFromFolder, updatePortfolioItem, deletePortfolioItem, type PortfolioItem } from "@/actions/portfolio";
import { getPlaceholderImage } from "@/lib/gdrive-utils";
import { toast } from "sonner";

export default function PortfolioGalleryPage() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [portfolioId, setPortfolioId] = useState<string | null>(null);
    const [items, setItems] = useState<PortfolioItem[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [addMode, setAddMode] = useState<'single' | 'folder'>('single');
    const [newTitle, setNewTitle] = useState("");
    const [newCategory, setNewCategory] = useState("");
    const [newGdriveLink, setNewGdriveLink] = useState("");
    const [adding, setAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editCategory, setEditCategory] = useState("");

    const categories = Array.from(new Set(items.map(i => i.category))).filter(Boolean);

    useEffect(() => {
        const load = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push("/login"); return; }
            const { data: portfolio } = await supabase.from('fg_portfolios').select('id').eq('user_id', user.id).single();
            if (!portfolio) { toast.error("Please set up your portfolio first"); router.push("/dashboard/portfolio/settings"); return; }
            setPortfolioId(portfolio.id);
            const itemsData = await getPortfolioItems(portfolio.id);
            setItems(itemsData);
            setLoading(false);
        };
        load();
    }, [supabase, router]);

    const handleAdd = async () => {
        if (!portfolioId || !newGdriveLink) return;
        setAdding(true);
        if (addMode === 'folder') {
            const result = await addItemsFromFolder(portfolioId, newGdriveLink, newCategory || 'Other');
            if (result.success) { toast.success(`Added ${result.count} items!`); const updated = await getPortfolioItems(portfolioId); setItems(updated); resetAddForm(); }
            else { toast.error(result.error || "Failed"); }
        } else {
            const result = await addPortfolioItem(portfolioId, { title: newTitle || 'Untitled', category: newCategory || 'Other', gdrive_link: newGdriveLink });
            if (result.success) { toast.success("Item added!"); const updated = await getPortfolioItems(portfolioId); setItems(updated); resetAddForm(); }
            else { toast.error(result.error || "Failed"); }
        }
        setAdding(false);
    };

    const resetAddForm = () => { setShowAddForm(false); setNewTitle(""); setNewCategory(""); setNewGdriveLink(""); setAddMode('single'); };
    const handleUpdate = async (id: string) => {
        const result = await updatePortfolioItem(id, { title: editTitle, category: editCategory });
        if (result.success) { setItems(prev => prev.map(i => i.id === id ? { ...i, title: editTitle, category: editCategory } : i)); setEditingId(null); toast.success("Updated!"); }
        else { toast.error(result.error || "Failed"); }
    };
    const handleDelete = async (id: string) => { if (!confirm("Delete?")) return; const result = await deletePortfolioItem(id); if (result.success) { setItems(prev => prev.filter(i => i.id !== id)); toast.success("Deleted!"); } else { toast.error(result.error || "Failed"); } };
    const startEdit = (item: PortfolioItem) => { setEditingId(item.id); setEditTitle(item.title); setEditCategory(item.category); };

    if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="animate-spin text-purple-500" size={32} /></div>;

    return (
        <div className="text-white max-w-6xl mx-auto py-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <Link href="/dashboard/portfolio" className="flex items-center text-sm font-medium text-gray-500 hover:text-white transition mb-2"><ArrowLeft size={16} className="mr-1" /> Back</Link>
                    <h2 className="text-2xl font-black tracking-tight">Gallery Manager</h2>
                    <p className="text-gray-500 text-sm mt-1">{items.length} item{items.length !== 1 ? 's' : ''}</p>
                </div>
                <Button onClick={() => setShowAddForm(true)} className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 font-bold"><Plus size={18} className="mr-1" /> Add</Button>
            </div>
            {showAddForm && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                    <div className="glass rounded-[24px] p-6 w-full max-w-lg border-white/10">
                        <div className="flex items-center justify-between mb-6"><h3 className="text-xl font-bold">Add Gallery Item</h3><button onClick={resetAddForm} className="p-2 hover:bg-white/10 rounded-lg"><X size={20} /></button></div>
                        <div className="flex gap-2 mb-6">
                            <button onClick={() => setAddMode('single')} className={`flex-1 py-3 px-4 rounded-xl border transition-all flex items-center justify-center gap-2 ${addMode === 'single' ? 'bg-purple-500/20 border-purple-500/50 text-purple-400' : 'bg-white/5 border-white/10 text-gray-400'}`}><ImageIcon size={18} /> Single Image</button>
                            <button onClick={() => setAddMode('folder')} className={`flex-1 py-3 px-4 rounded-xl border transition-all flex items-center justify-center gap-2 ${addMode === 'folder' ? 'bg-purple-500/20 border-purple-500/50 text-purple-400' : 'bg-white/5 border-white/10 text-gray-400'}`}><FolderOpen size={18} /> From Folder</button>
                        </div>
                        <div className="space-y-4">
                            {addMode === 'single' && <div className="space-y-2"><label className="text-sm font-medium text-gray-400">Title</label><Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Image title" className="h-12 bg-white/5 border-white/10 rounded-xl" /></div>}
                            <div className="space-y-2"><label className="text-sm font-medium text-gray-400">Category</label><Input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="Wedding, Portrait" className="h-12 bg-white/5 border-white/10 rounded-xl" list="categories" /><datalist id="categories">{categories.map(cat => <option key={cat} value={cat} />)}</datalist></div>
                            <div className="space-y-2"><label className="text-sm font-medium text-gray-400">{addMode === 'folder' ? 'Google Drive Folder Link' : 'Google Drive Image Link'}</label><Input value={newGdriveLink} onChange={(e) => setNewGdriveLink(e.target.value)} placeholder={addMode === 'folder' ? "https://drive.google.com/drive/folders/..." : "https://drive.google.com/file/d/.../view"} className="h-12 bg-white/5 border-white/10 rounded-xl font-mono text-sm" /></div>
                            <Button onClick={handleAdd} disabled={adding || !newGdriveLink} className="w-full h-12 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 font-bold">{adding ? <Loader2 size={18} className="animate-spin mr-2" /> : <Plus size={18} className="mr-2" />}{addMode === 'folder' ? 'Import from Folder' : 'Add Item'}</Button>
                        </div>
                    </div>
                </div>
            )}
            {items.length === 0 ? (
                <div className="glass rounded-[32px] p-16 text-center border-white/5"><ImageIcon size={48} className="mx-auto text-gray-600 mb-4" /><h3 className="text-xl font-bold mb-2">No Gallery Items</h3><p className="text-gray-500 mb-6">Add your first portfolio item</p><Button onClick={() => setShowAddForm(true)} className="rounded-xl"><Plus size={18} className="mr-2" /> Add Item</Button></div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {items.map((item) => (
                        <div key={item.id} className="group relative rounded-2xl overflow-hidden bg-white/5 border border-white/5 hover:border-purple-500/30 transition-all">
                            <div className="aspect-[4/3]"><img src={item.image_url} alt={item.title} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = getPlaceholderImage('gallery'); }} /></div>
                            {editingId === item.id ? (
                                <div className="p-3 space-y-2">
                                    <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="h-9 text-sm bg-white/10 border-white/10 rounded-lg" placeholder="Title" />
                                    <Input value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className="h-9 text-sm bg-white/10 border-white/10 rounded-lg" placeholder="Category" />
                                    <div className="flex gap-2"><Button size="sm" onClick={() => handleUpdate(item.id)} className="flex-1 h-8 rounded-lg bg-green-600"><Check size={14} /></Button><Button size="sm" variant="outline" onClick={() => setEditingId(null)} className="flex-1 h-8 rounded-lg border-white/10"><X size={14} /></Button></div>
                                </div>
                            ) : (<div className="p-3"><p className="font-medium text-sm truncate">{item.title}</p><p className="text-xs text-gray-500">{item.category}</p></div>)}
                            {editingId !== item.id && (
                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => startEdit(item)} className="p-2 rounded-lg bg-black/60 backdrop-blur-sm hover:bg-purple-500/80"><Edit2 size={14} /></button>
                                    <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg bg-black/60 backdrop-blur-sm hover:bg-red-500/80"><Trash2 size={14} /></button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
