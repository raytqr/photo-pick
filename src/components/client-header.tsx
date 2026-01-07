"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Info, Grip, Layers, MessageCircle, RotateCcw, Send, Copy, Check, X } from "lucide-react";
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
    const [showSendModal, setShowSendModal] = useState(false);
    const [copied, setCopied] = useState(false);

    const count = selectedPhotos.length;
    const isOverLimit = count > photoLimit;
    const totalPhotos = sourceImages.length + selectedPhotos.length + maybePhotos.length + rejectedPhotos.length;
    const reviewedCount = selectedPhotos.length + maybePhotos.length + rejectedPhotos.length;

    const generateMessage = () => {
        const names = selectedPhotos.map(p => p.name || p.id).join('\n• ');
        return `Hi! 👋\n\nI've selected ${count} photos:\n\n• ${names}\n\nThank you!`;
    };

    const generateWhatsAppLink = () => {
        const text = generateMessage();
        const phone = whatsappNumber.replace(/\D/g, '');
        return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(generateMessage());
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleRestart = () => {
        if (eventSlug) {
            localStorage.removeItem(`selections-${eventSlug}`);
            localStorage.removeItem(`onboarding-${eventSlug}`);
        }
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
                    {/* Counter */}
                    <div className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${isOverLimit
                            ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                            : "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-200"
                        }`}>
                        {count}/{photoLimit}
                    </div>

                    {/* Send Button */}
                    {count > 0 && (
                        <Button
                            size="sm"
                            onClick={() => setShowSendModal(true)}
                            className={`h-8 px-3 rounded-full text-xs font-medium ${isOverLimit
                                    ? 'bg-amber-500 hover:bg-amber-600'
                                    : 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700'
                                }`}
                        >
                            <Send size={14} className="mr-1" />
                            Send
                        </Button>
                    )}

                    {/* Restart Button */}
                    {reviewedCount > 0 && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowRestartConfirm(true)}
                            className="text-gray-600 dark:text-gray-300 h-8 w-8"
                            title="Restart"
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

            {/* Send Options Modal */}
            {showSendModal && (
                <div className="fixed inset-0 z-[100] bg-black/70 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setShowSendModal(false)}>
                    <div
                        className="bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-sm p-6 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold dark:text-white">Send {count} Photos</h3>
                            <Button variant="ghost" size="icon" onClick={() => setShowSendModal(false)} className="h-8 w-8">
                                <X size={18} />
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {/* Copy Option */}
                            <button
                                onClick={handleCopy}
                                className="w-full flex items-center gap-4 p-4 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                            >
                                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                    {copied ? <Check className="text-green-600" size={24} /> : <Copy size={24} className="text-gray-600 dark:text-gray-300" />}
                                </div>
                                <div className="text-left">
                                    <p className="font-medium dark:text-white">{copied ? 'Copied!' : 'Copy to Clipboard'}</p>
                                    <p className="text-sm text-gray-500">Copy photo list to paste anywhere</p>
                                </div>
                            </button>

                            {/* WhatsApp Option */}
                            <Link href={generateWhatsAppLink()} target="_blank" onClick={() => setShowSendModal(false)}>
                                <button className="w-full flex items-center gap-4 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 transition border border-green-200 dark:border-green-800">
                                    <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                                        <MessageCircle size={24} className="text-white" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium text-green-700 dark:text-green-400">Send via WhatsApp</p>
                                        <p className="text-sm text-green-600/70 dark:text-green-500/70">Open WhatsApp with message</p>
                                    </div>
                                </button>
                            </Link>
                        </div>

                        {/* Preview */}
                        <div className="pt-2 border-t dark:border-gray-800">
                            <p className="text-xs text-gray-500 mb-2">Preview:</p>
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 max-h-32 overflow-y-auto text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                                {generateMessage()}
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                                All your {reviewedCount} reviewed photos will be reset.
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
                                Restart
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
