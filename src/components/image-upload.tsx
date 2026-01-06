"use client";

import React, { useRef } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "./ui/button";
import Image from "next/image";

interface ImageUploadProps {
    value: string[];
    onChange: (urls: string[]) => void;
    maxFiles?: number;
    multiple?: boolean;
}

export function ImageUpload({
    value,
    onChange,
    maxFiles = 1,
    multiple = false,
}: ImageUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newUrls: string[] = [];
        Array.from(files).forEach((file) => {
            const url = URL.createObjectURL(file);
            newUrls.push(url);
        });

        // Check limits
        if (maxFiles === 1) {
            onChange([newUrls[0]]);
        } else {
            const combined = [...value, ...newUrls].slice(0, maxFiles);
            onChange(combined);
        }

        // Reset inputs
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleRemove = (urlToRemove: string) => {
        onChange(value.filter((url) => url !== urlToRemove));
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
                {value.map((url, index) => (
                    <div key={url} className="relative w-[150px] h-[150px] rounded-lg overflow-hidden border border-gray-200">
                        <Image
                            src={url}
                            alt="Upload"
                            fill
                            className="object-cover"
                        />
                        <button
                            onClick={() => handleRemove(url)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                            type="button"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}
                {(value.length < maxFiles) && (
                    <div
                        className="w-[150px] h-[150px] border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Upload className="text-gray-400 mb-2" />
                        <span className="text-xs text-gray-500">Upload Image</span>
                    </div>
                )}
            </div>

            <input
                type="file"
                hidden
                ref={fileInputRef}
                onChange={handleUpload}
                multiple={multiple}
                accept="image/*"
            />
        </div>
    );
}
