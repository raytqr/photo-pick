"use client";

import { useAppStore } from "@/store/useAppStore";
import { Info, Grip, Layers, MessageCircle } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface HeaderProps {
    viewMode: 'swipe' | 'grid';
    setViewMode: (mode: 'swipe' | 'grid') => void;
    onInfoClick: () => void;
}

export function Header({ viewMode, setViewMode, onInfoClick }: HeaderProps) {
    const { eventName, logoUrl, selectedPhotos, photoLimit, whatsappNumber } = useAppStore();
    const count = selectedPhotos.length;
    const isOverLimit = count > photoLimit;

    const generateWhatsAppLink = () => {
        const names = selectedPhotos.map(p => p.name || p.id).join('\n• ');
        const text = `Hi! 👋\n\nI've selected ${count} photos:\n\n• ${names}\n\nThank you!`;
        const phone = whatsappNumber.replace(/\D/g, '');
        return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    };

    return (
        <div className="fixed top-0 left-0 right-0 h-16 bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl z-50 px-3 flex items-center justify-between border-b dark:border-gray-800">
            {/* Left: Branding */}
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden relative border dark:border-gray-700 shrink-0">
                    {logoUrl ? (
                        <Image src={logoUrl} alt="Logo" fill className="object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs">📸</div>
                    )}
                </div>
                <span className="font-semibold text-sm truncate max-w-[100px] sm:max-w-[150px] dark:text-gray-100">
                    {eventName}
                </span>
            </div>

            {/* Right: Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Counter */}
                <div className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${isOverLimit
                        ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                        : "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-200"
                    }`}>
                    {count}/{photoLimit}
                </div>

                {/* WhatsApp Button */}
                {count > 0 && (
                    <Link href={generateWhatsAppLink()} target="_blank">
                        <Button
                            size="sm"
                            className={`h-8 px-3 rounded-full text-xs font-medium ${isOverLimit
                                    ? 'bg-amber-500 hover:bg-amber-600'
                                    : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                                }`}
                        >
                            <MessageCircle size={14} className="mr-1" />
                            <span className="hidden sm:inline">Send</span> WA
                        </Button>
                    </Link>
                )}

                {/* Grid Toggle */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setViewMode(viewMode === 'swipe' ? 'grid' : 'swipe')}
                    className="text-gray-600 dark:text-gray-300 h-8 w-8"
                >
                    {viewMode === 'swipe' ? <Grip size={18} /> : <Layers size={18} />}
                </Button>

                {/* Info Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onInfoClick}
                    className="text-gray-600 dark:text-gray-300 h-8 w-8"
                >
                    <Info size={18} />
                </Button>
            </div>
        </div>
    );
}
