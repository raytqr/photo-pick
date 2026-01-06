"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Cloud, Sparkles } from "lucide-react";
import Link from "next/link";

export default function CreateEventPage() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);

    // Form State
    const [name, setName] = useState("");
    const [driveLink, setDriveLink] = useState("");
    const [photoLimit, setPhotoLimit] = useState("50");
    const [slug, setSlug] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const { data, error } = await supabase.from('events').insert({
                photographer_id: user.id,
                name,
                slug: slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                drive_link: driveLink,
                photo_limit: parseInt(photoLimit),
                // WhatsApp is now in profile, not per-event
            }).select().single();

            if (error) throw error;

            router.push(`/dashboard/event/${data.id}`);
            router.refresh();

        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            <Link href="/dashboard" className="flex items-center text-sm font-medium text-gray-500 hover:text-black dark:hover:text-white transition">
                <ArrowLeft size={16} className="mr-1" /> Back to Overview
            </Link>

            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Create New Gallery</h1>
                <p className="text-gray-500">Set up the details for your photo selection event.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">

                {/* Event Basics */}
                <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 p-6 rounded-2xl shadow-sm space-y-6">
                    <h2 className="font-semibold border-b dark:border-gray-800 pb-3 flex items-center gap-2">
                        <Sparkles size={18} className="text-amber-500" /> Event Details
                    </h2>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Event Name</label>
                        <Input
                            placeholder="e.g. Wedding of Sarah & Dimas"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="h-12"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">URL Slug</label>
                            <div className="flex">
                                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 text-sm">
                                    /client/
                                </span>
                                <Input
                                    placeholder="wedding-sarah-dimas"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    className="rounded-l-none"
                                />
                            </div>
                            <p className="text-xs text-gray-400">Leave blank to auto-generate.</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Photo Limit</label>
                            <Input
                                type="number"
                                value={photoLimit}
                                onChange={(e) => setPhotoLimit(e.target.value)}
                                required
                                className="h-12"
                            />
                            <p className="text-xs text-gray-400">Maximum photos client can select.</p>
                        </div>
                    </div>
                </div>

                {/* Google Drive Section */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-900/30 p-6 rounded-2xl shadow-sm space-y-4">
                    <h2 className="font-semibold text-blue-900 dark:text-blue-200 flex items-center gap-2">
                        <Cloud size={18} /> Google Drive Source
                    </h2>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-blue-900 dark:text-blue-100">Public Folder Link</label>
                        <Input
                            placeholder="https://drive.google.com/drive/folders/..."
                            value={driveLink}
                            onChange={(e) => setDriveLink(e.target.value)}
                            className="h-12 bg-white dark:bg-black border-blue-200 dark:border-blue-800"
                        />
                        <p className="text-xs text-blue-600 dark:text-blue-300">
                            Ensure the folder is set to <strong>"Anyone with the link"</strong>.
                        </p>
                    </div>
                </div>

                <Button type="submit" size="lg" className="w-full h-14 text-base rounded-full shadow-lg hover:shadow-xl transition-all" disabled={loading}>
                    {loading ? "Creating..." : "Create Event"}
                </Button>

            </form>
        </div>
    );
}

