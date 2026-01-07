"use client";

import { useState, useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Info, Grip, Layers, MessageCircle, RotateCcw, Send, Copy, Check, X, FileText, Hash } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface HeaderProps {
    viewMode: 'swipe' | 'grid';
    setViewMode: (mode: 'swipe' | 'grid') => void;
    onInfoClick: () => void;
}

// Generate unique code from photo IDs
function generateSubmissionCode(photoIds: string[]): string {
    const hash = photoIds.join('').split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
    }, 0);
    const code = Math.abs(hash).toString(36).toUpperCase().slice(0, 6);
    return `SEL-${code}`;
}

export function Header({ viewMode, setViewMode, onInfoClick }: HeaderProps) {
    const { eventName, eventSlug, logoUrl, selectedPhotos, maybePhotos, rejectedPhotos, sourceImages, photoLimit, whatsappNumber } = useAppStore();
    const [showRestartConfirm, setShowRestartConfirm] = useState(false);
    const [showSendModal, setShowSendModal] = useState(false);
    const [copiedType, setCopiedType] = useState<string | null>(null);

    const count = selectedPhotos.length;
    const isOverLimit = count > photoLimit;
    const totalPhotos = sourceImages.length + selectedPhotos.length + maybePhotos.length + rejectedPhotos.length;
    const reviewedCount = selectedPhotos.length + maybePhotos.length + rejectedPhotos.length;

    // Generate unique code
    const submissionCode = useMemo(() => {
        return generateSubmissionCode(selectedPhotos.map(p => p.id));
    }, [selectedPhotos]);

    // Filename only list (for Lightroom/Finder filter)
    const filenameList = useMemo(() => {
        return selectedPhotos.map(p => p.name || p.id).join('\n');
    }, [selectedPhotos]);

    const generateMessage = () => {
        const names = selectedPhotos.map(p => p.name || p.id).join('\n• ');
        return `Hi! 👋\n\nCode: ${submissionCode}\nTotal: ${count} photos\n\n• ${names}\n\nThank you!`;
    };

    const generateWhatsAppLink = () => {
        const text = generateMessage();
        const phone = whatsappNumber.replace(/\D/g, '');
        return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    };

    const handleCopy = async (type: 'message' | 'filenames' | 'code') => {
        try {
            let text = '';
            if (type === 'message') text = generateMessage();
            if (type === 'filenames') text = filenameList;
            if (type === 'code') text = submissionCode;

            await navigator.clipboard.writeText(text);
            setCopiedType(type);
            setTimeout(() => setCopiedType(null), 2000);
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
                        className="bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md p-6 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold dark:text-white">Send {count} Photos</h3>
                            <Button variant="ghost" size="icon" onClick={() => setShowSendModal(false)} className="h-8 w-8">
                                <X size={18} />
                            </Button>
                        </div>

                        {/* Unique Code */}
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">Submission Code</p>
                                    <p className="text-2xl font-mono font-bold text-purple-700 dark:text-purple-300">{submissionCode}</p>
                                </div>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleCopy('code')}
                                    className="border-purple-300 text-purple-600 hover:bg-purple-100 dark:border-purple-700 dark:text-purple-400"
                                >
                                    {copiedType === 'code' ? <Check size={14} /> : <Copy size={14} />}
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {/* Copy Full Message */}
                            <button
                                onClick={() => handleCopy('message')}
                                className="w-full flex items-center gap-4 p-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                            >
                                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0">
                                    {copiedType === 'message' ? <Check className="text-green-600" size={20} /> : <Copy size={20} className="text-gray-600 dark:text-gray-300" />}
                                </div>
                                <div className="text-left flex-1">
                                    <p className="font-medium dark:text-white text-sm">{copiedType === 'message' ? 'Copied!' : 'Copy Full Message'}</p>
                                    <p className="text-xs text-gray-500">With code and photo names</p>
                                </div>
                            </button>

                            {/* Copy Filenames Only (for Lightroom) */}
                            <button
                                onClick={() => handleCopy('filenames')}
                                className="w-full flex items-center gap-4 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition border border-blue-200 dark:border-blue-800"
                            >
                                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                                    {copiedType === 'filenames' ? <Check className="text-white" size={20} /> : <FileText size={20} className="text-white" />}
                                </div>
                                <div className="text-left flex-1">
                                    <p className="font-medium text-blue-700 dark:text-blue-400 text-sm">{copiedType === 'filenames' ? 'Copied!' : 'Copy Filenames Only'}</p>
                                    <p className="text-xs text-blue-600/70 dark:text-blue-500/70">For Lightroom / Finder filter</p>
                                </div>
                            </button>

                            {/* WhatsApp */}
                            <Link href={generateWhatsAppLink()} target="_blank" onClick={() => setShowSendModal(false)}>
                                <button className="w-full flex items-center gap-4 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 transition border border-green-200 dark:border-green-800">
                                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                                        <MessageCircle size={20} className="text-white" />
                                    </div>
                                    <div className="text-left flex-1">
                                        <p className="font-medium text-green-700 dark:text-green-400 text-sm">Send via WhatsApp</p>
                                        <p className="text-xs text-green-600/70 dark:text-green-500/70">Open WhatsApp with message</p>
                                    </div>
                                </button>
                            </Link>
                        </div>

                        {/* Help Guide */}
                        <div className="pt-3 border-t dark:border-gray-800 space-y-3">
                            <details className="group">
                                <summary className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
                                    <Hash size={14} />
                                    How to use in Lightroom / Finder
                                    <span className="text-xs text-gray-400 group-open:hidden">Click to expand</span>
                                </summary>
                                <div className="mt-3 space-y-3 text-xs text-gray-600 dark:text-gray-400">
                                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                                        <p className="font-medium text-gray-800 dark:text-gray-200 mb-2">📁 For Finder / Explorer:</p>
                                        <ol className="list-decimal list-inside space-y-1">
                                            <li>Copy filenames using "Copy Filenames Only"</li>
                                            <li>Open your photo folder</li>
                                            <li>Search each filename to find & select photos</li>
                                            <li>Copy selected photos to new folder</li>
                                        </ol>
                                    </div>
                                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                                        <p className="font-medium text-blue-800 dark:text-blue-300 mb-2">📷 For Adobe Lightroom:</p>
                                        <ol className="list-decimal list-inside space-y-1">
                                            <li>Copy filenames using "Copy Filenames Only"</li>
                                            <li>In Lightroom, go to Library → Filter Bar (\ key)</li>
                                            <li>Click "Text" → select "Filename" → "Contains"</li>
                                            <li>Paste one filename at a time to find</li>
                                            <li>Or use Smart Collection with filename rules</li>
                                        </ol>
                                    </div>
                                    <p className="text-center text-gray-500">
                                        💡 Pro tip: Create a Smart Collection in Lightroom for faster filtering!
                                    </p>
                                </div>
                            </details>
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
