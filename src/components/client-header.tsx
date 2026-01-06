"use client";

import { useAppStore } from "@/store/useAppStore";
import { Info, Grip, Layers, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface HeaderProps {
    viewMode: 'swipe' | 'grid';
    setViewMode: (mode: 'swipe' | 'grid') => void;
    onInfoClick: () => void;
}

export function Header({ viewMode, setViewMode, onInfoClick }: HeaderProps) {
    const { eventName, logoUrl, selectedPhotos, photoLimit } = useAppStore();
    const count = selectedPhotos.length;
    const isOverLimit = count > photoLimit;

    return (
        <div className="fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md z-50 px-4 flex items-center justify-between border-b dark:border-gray-800">
            {/* Left: Branding */}
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden relative border dark:border-gray-700">
                    {logoUrl ? (
                        <Image src={logoUrl} alt="Logo" fill className="object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs">📸</div>
                    )}
                </div>
                <span className="font-semibold text-sm md:text-base truncate max-w-[120px] md:max-w-[200px] dark:text-gray-100">
                    {eventName}
                </span>
            </div>

            {/* Right: Controls & Stats */}
            <div className="flex items-center gap-2 md:gap-4">
                {/* Counter */}
                <div className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${isOverLimit ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" : "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-200"
                    }`}>
                    {count} / {photoLimit}
                </div>

                {/* Grid Toggle */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setViewMode(viewMode === 'swipe' ? 'grid' : 'swipe')}
                    className="text-gray-600 dark:text-gray-300"
                >
                    {viewMode === 'swipe' ? <Grip size={20} /> : <Layers size={20} />}
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onInfoClick}
                    className="text-gray-600 dark:text-gray-300"
                >
                    <Info size={20} />
                </Button>
            </div>
        </div>
    );
}
