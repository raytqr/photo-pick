"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Info, Grip, Layers, MessageCircle, RotateCcw } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface HeaderProps {
    viewMode: 'swipe' | 'grid';
    setViewMode: (mode: 'swipe' | 'grid') => void;
    onInfoClick: () => void;
}

export function Header({ viewMode, setViewMode, onInfoClick }: HeaderProps) {
    const { eventName, eventSlug, logoUrl, selectedPhotos, maybePhotos, rejectedPhotos, sourceImages, photoLimit, whatsappNumber } = useAppStore();
    const [showRestartConfirm, setShowRestartConfirm] = useState(false);

    const count = selectedPhotos.length;
    const isOverLimit = count > photoLimit;
    const totalPhotos = sourceImages.length + selectedPhotos.length + maybePhotos.length + rejectedPhotos.length;
    const reviewedCount = selectedPhotos.length + maybePhotos.length + rejectedPhotos.length;

    const generateWhatsAppLink = () => {
        const names = selectedPhotos.map(p => p.name || p.id).join('\n• ');
        const text = `Hi! 👋\n\nI've selected ${count} photos:\n\n• ${names}\n\nThank you!`;
        const phone = whatsappNumber.replace(/\D/g, '');
        return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    };

    const handleRestart = () => {
        // Clear localStorage cache for this event
        if (eventSlug) {
            localStorage.removeItem(`selections-${eventSlug}`);
            localStorage.removeItem(`onboarding-${eventSlug}`);
        }
        // Reload the page to reset state
        window.location.reload();
    };

    return (
        <>
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
                    <div className="flex flex-col">
                        <span className="font-semibold text-sm truncate max-w-[80px] sm:max-w-[120px] dark:text-gray-100 leading-tight">
                            {eventName}
                        </span>
                        <span className="text-[10px] text-gray-500">
                            {reviewedCount}/{totalPhotos} reviewed
                        </span>
                    </div>
                </div>

                {/* Right: Controls */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                    {/* Counter (Selected/Limit) */}
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

                    {/* Restart Button */}
                    {reviewedCount > 0 && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowRestartConfirm(true)}
                            className="text-gray-600 dark:text-gray-300 h-8 w-8"
                            title="Restart / Reset selections"
                        >
                            <RotateCcw size={16} />
                        </Button>
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

            {/* Restart Confirmation Modal */}
            {showRestartConfirm && (
                <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4" onClick={() => setShowRestartConfirm(false)}>
                    <div
                        className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                                <RotateCcw size={28} className="text-red-600" />
                            </div>
                            <h3 className="text-lg font-bold dark:text-white">Restart Selection?</h3>
                            <p className="text-gray-500 text-sm mt-2">
                                All your {reviewedCount} reviewed photos will be reset. You'll start from the beginning.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setShowRestartConfirm(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="flex-1 bg-red-600 hover:bg-red-700"
                                onClick={handleRestart}
                            >
                                Yes, Restart
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
