"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { isRestricted } from "@/lib/subscription-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Camera, Phone, FileText, User, MessageSquare, Sparkles, Info, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function ProfilePage() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [saved, setSaved] = useState(false);
    const [showGuide, setShowGuide] = useState(false);

    // Profile State
    const [photographerName, setPhotographerName] = useState("");
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [bio, setBio] = useState("");
    const [whatsappNumber, setWhatsappNumber] = useState("");
    const [waHeader, setWaHeader] = useState("");
    const [waFooter, setWaFooter] = useState("");
    const [logoFile, setLogoFile] = useState<File | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
                return;
            }

            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (data) {
                // Check restriction
                const restricted = isRestricted(data.subscription_tier, data.subscription_expires_at);
                if (restricted) {
                    router.push('/dashboard/pricing');
                    return;
                }

                setPhotographerName(data.photographer_name || "");
                setLogoUrl(data.logo_url);
                setBio(data.bio || "");
                setWhatsappNumber(data.whatsapp_number || "");
                setWaHeader(data.wa_header || "Halo! Berikut pilihan foto dari client:");
                setWaFooter(data.wa_footer || "Terima kasih telah memilih kami! 📸");

                // Show guide if profile is incomplete
                if (!data.photographer_name || !data.whatsapp_number) {
                    setShowGuide(true);
                }
            } else {
                setShowGuide(true);
            }
            setFetching(false);
        };

        fetchProfile();
    }, [supabase, router]);

    const uploadFile = async (file: File, path: string) => {
        const { error } = await supabase.storage.from('brand-assets').upload(path, file, { upsert: true });
        if (error) throw error;
        return supabase.storage.from('brand-assets').getPublicUrl(path).data.publicUrl;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            let finalLogoUrl = logoUrl;

            if (logoFile) {
                const fileExt = logoFile.name.split('.').pop();
                const fileName = `${user.id}/logo.${fileExt}`;
                finalLogoUrl = await uploadFile(logoFile, fileName);
            }

            const { error } = await supabase.from('profiles').upsert({
                id: user.id,
                email: user.email,
                photographer_name: photographerName,
                logo_url: finalLogoUrl,
                bio,
                whatsapp_number: whatsappNumber,
                wa_header: waHeader,
                wa_footer: waFooter,
            });

            if (error) throw error;

            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
            router.refresh();

        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return (
        <div className="min-h-screen bg-[#030014] flex items-center justify-center">
            <div className="text-gray-400">Loading...</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#030014] text-white">
            <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">

                <Link href="/dashboard" className="flex items-center text-sm font-medium text-gray-500 hover:text-white transition">
                    <ArrowLeft size={16} className="mr-1" /> Back to Overview
                </Link>

                <div>
                    <h1 className="text-3xl font-black tracking-tight">Profile & Branding</h1>
                    <p className="text-gray-500 mt-1">Customize your brand identity shown to clients.</p>
                </div>

                {/* Onboarding Guide */}
                <AnimatePresence>
                    {showGuide && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="glass rounded-[32px] p-6 border-purple-500/30 overflow-hidden"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center shrink-0">
                                    <Sparkles size={24} className="text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-black mb-2">Welcome! Let's set up your profile 👋</h3>
                                    <p className="text-gray-400 text-sm mb-4">
                                        Complete your profile so clients see your branding when selecting photos. Here's what you'll need:
                                    </p>
                                    <ul className="space-y-3 text-sm">
                                        <li className="flex items-center gap-3">
                                            <CheckCircle size={16} className="text-green-500 shrink-0" />
                                            <span><strong>Studio Name</strong> - Your business or personal brand name</span>
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <CheckCircle size={16} className="text-green-500 shrink-0" />
                                            <span><strong>Logo</strong> - Square image (512x512px recommended)</span>
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <CheckCircle size={16} className="text-green-500 shrink-0" />
                                            <span><strong>WhatsApp</strong> - For receiving client selections</span>
                                        </li>
                                    </ul>
                                    <button
                                        onClick={() => setShowGuide(false)}
                                        className="mt-4 text-sm text-purple-400 hover:text-white transition-colors"
                                    >
                                        Got it, dismiss guide
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Success Banner */}
                <AnimatePresence>
                    {saved && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="glass rounded-2xl p-4 border-green-500/30 bg-green-500/10 flex items-center gap-3"
                        >
                            <CheckCircle className="text-green-500" size={20} />
                            <span className="text-green-400 font-bold">Profile saved successfully!</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Studio Name */}
                    <div className="glass rounded-[32px] p-6 space-y-4 border-white/5">
                        <h2 className="font-bold flex items-center gap-2 text-lg">
                            <User size={18} className="text-purple-400" /> Studio Name
                        </h2>
                        <Input
                            placeholder="e.g. Studio Fotografi Jakarta"
                            value={photographerName}
                            onChange={(e) => setPhotographerName(e.target.value)}
                            className="h-14 bg-white/5 border-white/10 rounded-2xl px-6 text-white placeholder:text-gray-600"
                        />
                        <p className="text-xs text-gray-500">This name will appear in the sidebar and on client galleries.</p>
                    </div>

                    {/* Logo Section */}
                    <div className="glass rounded-[32px] p-6 space-y-4 border-white/5">
                        <h2 className="font-bold flex items-center gap-2 text-lg">
                            <Camera size={18} className="text-pink-400" /> Brand Logo
                        </h2>

                        <div className="flex items-center gap-6">
                            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center overflow-hidden border-2 border-white/10">
                                {logoUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                ) : (
                                    <Camera className="text-gray-500" size={32} />
                                )}
                            </div>

                            <div className="space-y-2">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files?.[0]) {
                                            setLogoFile(e.target.files[0]);
                                            setLogoUrl(URL.createObjectURL(e.target.files[0]));
                                        }
                                    }}
                                    className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-purple-500/20 file:text-purple-400 hover:file:bg-purple-500/30 transition-colors"
                                />
                                <p className="text-xs text-gray-500">Recommended: Square image, 512x512px</p>
                            </div>
                        </div>
                    </div>

                    {/* About Section */}
                    <div className="glass rounded-[32px] p-6 space-y-4 border-white/5">
                        <h2 className="font-bold flex items-center gap-2 text-lg">
                            <FileText size={18} className="text-blue-400" /> About You
                        </h2>
                        <textarea
                            placeholder="e.g. Professional wedding photographer based in Jakarta..."
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows={3}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-gray-600 resize-none focus:outline-none focus:border-purple-500/50"
                        />
                    </div>

                    {/* Contact Section */}
                    <div className="glass rounded-[32px] p-6 space-y-4 border-white/5">
                        <h2 className="font-bold flex items-center gap-2 text-lg">
                            <Phone size={18} className="text-green-400" /> WhatsApp
                        </h2>
                        <Input
                            placeholder="+62812345678"
                            value={whatsappNumber}
                            onChange={(e) => setWhatsappNumber(e.target.value)}
                            className="h-14 bg-white/5 border-white/10 rounded-2xl px-6 text-white placeholder:text-gray-600"
                        />
                        <p className="text-xs text-gray-500">Clients will send their photo selections to this number.</p>
                    </div>

                    {/* WA Message Templates */}
                    <div className="glass rounded-[32px] p-6 space-y-6 border-white/5">
                        <h2 className="font-bold flex items-center gap-2 text-lg">
                            <MessageSquare size={18} className="text-amber-400" /> WhatsApp Message Template
                        </h2>
                        <p className="text-xs text-gray-500">
                            Customize the message that clients send when sharing their photo selections.
                        </p>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Header Message</label>
                            <Input
                                placeholder="e.g. Halo! Berikut pilihan foto dari client:"
                                value={waHeader}
                                onChange={(e) => setWaHeader(e.target.value)}
                                className="h-14 bg-white/5 border-white/10 rounded-2xl px-6 text-white placeholder:text-gray-600"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Footer Message</label>
                            <Input
                                placeholder="e.g. Terima kasih telah memilih kami! 📸"
                                value={waFooter}
                                onChange={(e) => setWaFooter(e.target.value)}
                                className="h-14 bg-white/5 border-white/10 rounded-2xl px-6 text-white placeholder:text-gray-600"
                            />
                        </div>

                        {/* Preview */}
                        <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl">
                            <p className="text-[10px] uppercase tracking-widest text-green-400 font-bold mb-2">Preview WA Message</p>
                            <div className="text-sm text-gray-300 whitespace-pre-line">
                                {waHeader || "Halo! Berikut pilihan foto dari client:"}{"\n"}
                                {"\n"}
                                Super Like: IMG_003.jpg{"\n"}
                                Selected: IMG_001.jpg, IMG_002.jpg{"\n"}
                                {"\n"}
                                Total: 3 photos{"\n"}
                                {"\n"}
                                PC SEARCH STRING (For Lightroom Import):{"\n"}
                                {"\n"}
                                IMG_003.jpg OR IMG_001.jpg OR IMG_002.jpg{"\n"}
                                {"\n"}
                                {waFooter || "Terima kasih telah memilih kami!"}
                            </div>
                        </div>
                    </div>

                    <div className="sticky bottom-0 -mx-6 -mb-6 p-6 bg-[#030014]/80 backdrop-blur-xl border-t border-white/10 mt-8 z-10 flex justify-end rounded-b-[32px]">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full md:w-auto px-8 h-14 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 font-bold text-lg hover:scale-105 transition-all shadow-lg shadow-purple-500/20"
                        >
                            {loading ? "Saving..." : "Save Profile"}
                        </Button>
                    </div>

                </form>
            </div>
        </div>
    );
}
