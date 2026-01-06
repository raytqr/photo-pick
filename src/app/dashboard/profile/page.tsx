"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { ArrowLeft, Camera, Phone, FileText } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    // Profile State
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [bio, setBio] = useState("");
    const [whatsappNumber, setWhatsappNumber] = useState("");
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
                setLogoUrl(data.logo_url);
                setBio(data.bio || "");
                setWhatsappNumber(data.whatsapp_number || "");
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
                logo_url: finalLogoUrl,
                bio,
                whatsapp_number: whatsappNumber,
            });

            if (error) throw error;

            alert("Profile saved!");
            router.refresh();

        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="p-8 text-center text-gray-400">Loading...</div>;

    return (
        <div className="p-8 max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">

            <Link href="/dashboard" className="flex items-center text-sm font-medium text-gray-500 hover:text-black dark:hover:text-white transition">
                <ArrowLeft size={16} className="mr-1" /> Back to Overview
            </Link>

            <div>
                <h1 className="text-3xl font-bold tracking-tight">Profile & Branding</h1>
                <p className="text-gray-500 mt-1">Customize your brand identity shown to clients.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">

                {/* Logo Section */}
                <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-2xl p-6 space-y-4">
                    <h2 className="font-semibold flex items-center gap-2 border-b dark:border-gray-800 pb-3">
                        <Camera size={18} /> Brand Logo
                    </h2>

                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center overflow-hidden border-4 border-white dark:border-gray-900 shadow-lg">
                            {logoUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                                <Camera className="text-gray-400" size={32} />
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
                                className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400"
                            />
                            <p className="text-xs text-gray-400">Recommended: Square image, 512x512px</p>
                        </div>
                    </div>
                </div>

                {/* About Section */}
                <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-2xl p-6 space-y-4">
                    <h2 className="font-semibold flex items-center gap-2 border-b dark:border-gray-800 pb-3">
                        <FileText size={18} /> About You
                    </h2>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Bio / Tagline</label>
                        <Textarea
                            placeholder="e.g. Professional wedding photographer based in Jakarta..."
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows={3}
                            className="resize-none"
                        />
                    </div>
                </div>

                {/* Contact Section */}
                <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-2xl p-6 space-y-4">
                    <h2 className="font-semibold flex items-center gap-2 border-b dark:border-gray-800 pb-3">
                        <Phone size={18} /> Contact
                    </h2>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">WhatsApp Number</label>
                        <Input
                            placeholder="+62812345678"
                            value={whatsappNumber}
                            onChange={(e) => setWhatsappNumber(e.target.value)}
                        />
                        <p className="text-xs text-gray-400">Clients will send their photo selections to this number.</p>
                    </div>
                </div>

                <Button type="submit" disabled={loading} size="lg" className="w-full h-12 rounded-full text-base">
                    {loading ? "Saving..." : "Save Profile"}
                </Button>

            </form>
        </div>
    );
}
