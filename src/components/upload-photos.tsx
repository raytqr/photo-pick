"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Loader2, UploadCloud, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface UploadPhotosProps {
    eventId: string;
}

export function UploadPhotos({ eventId }: UploadPhotosProps) {
    const [uploading, setUploading] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [progress, setProgress] = useState(0);
    const supabase = createClient();
    const router = useRouter();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
        }
    };

    const handleUpload = async () => {
        setUploading(true);
        setProgress(0);

        let uploadedCount = 0;
        const total = files.length;

        for (const file of files) {
            const fileExt = file.name.split('.').pop();
            const fileName = `${eventId}/${Date.now()}-${file.name}`; // Organize by Event ID folder

            // 1. Upload to Storage
            const { error: uploadError } = await supabase.storage
                .from('event-photos')
                .upload(fileName, file);

            if (uploadError) {
                console.error('Error uploading', file.name, uploadError);
                continue; // Skip failed
            }

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('event-photos')
                .getPublicUrl(fileName);

            // 3. Insert into DB using Public URL
            // Mocking width/height for now as extracting it client-side is heavy without a helper
            // Ideally we use a server function or client-side image load to get dims.
            await supabase.from('photos').insert({
                event_id: eventId,
                url: publicUrl,
                width: 800, // Placeholder
                height: 1200 // Placeholder
            });

            uploadedCount++;
            setProgress(Math.round((uploadedCount / total) * 100));
        }

        setUploading(false);
        setFiles([]);
        setProgress(0);
        router.refresh(); // Refresh to show new photos
    };

    return (
        <div className="space-y-4">
            {files.length === 0 ? (
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition cursor-pointer relative">
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <UploadCloud size={32} className="mb-2" />
                    <p className="font-medium">Click or Drag photos here</p>
                    <p className="text-xs">Supports JPG, PNG</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 flex items-center justify-between">
                        <span className="font-medium">{files.length} photos selected</span>
                        <Button variant="ghost" size="sm" onClick={() => setFiles([])} disabled={uploading}>
                            <X size={16} /> Cancel
                        </Button>
                    </div>

                    {uploading && (
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                            <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                        </div>
                    )}

                    <Button onClick={handleUpload} disabled={uploading} className="w-full">
                        {uploading ? (
                            <>
                                <Loader2 size={16} className="mr-2 animate-spin" /> Uploading ({progress}%)
                            </>
                        ) : (
                            "Start Upload"
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}
