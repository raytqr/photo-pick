"use client";

import { useState, useEffect } from "react";
import { useAppStore, PhotoStatus } from "@/store/useAppStore";
import { Header } from "@/components/client-header";
import { SwipeCard } from "@/components/swipe-card";
import { ControlBar } from "@/components/control-bar";
import { GridView } from "@/components/grid-view";
import { PhotographerModal } from "@/components/photographer-modal";
import { OnboardingModal } from "@/components/onboarding-modal";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertTriangle, Send, MessageCircle, Grid3X3, Star, RotateCcw } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePrevious } from "@/hooks/use-previous";
import { toast } from "sonner";

export function ClientSelectionApp() {
    const [viewMode, setViewMode] = useState<'swipe' | 'grid'>('swipe');
    const [isInfoOpen, setIsInfoOpen] = useState(false);

    const store = useAppStore();
    const { sourceImages, selectedPhotos, superLikedPhotos, maybePhotos, photoLimit, whatsappNumber, eventSlug, movePhoto, undoLastAction, history } = store;

    const visibleCards = sourceImages.slice(0, 3);
    const isDeckEmpty = sourceImages.length === 0;

    // ... (rest of component) ...

    {/* Grid View */ }
    {
        viewMode === 'grid' && (
            <GridView setViewMode={setViewMode} />
        )
    }

    const prevRestartingFrom = usePrevious(store.restartingFrom);

    useEffect(() => {
        if (prevRestartingFrom && !store.restartingFrom) {
            toast.success("Re-Swipe session complete! Returning to main deck.");
        }
    }, [store.restartingFrom, prevRestartingFrom]);

    const handleSwipe = (direction: 'left' | 'right' | 'up' | 'down') => {
        if (visibleCards.length === 0) return;
        const topCard = visibleCards[0];

        let toStatus: PhotoStatus = 'rejected';
        if (direction === 'right') toStatus = 'selected';
        if (direction === 'up') toStatus = 'superLiked'; // Super Like!
        if (direction === 'down') toStatus = 'maybe';

        movePhoto(topCard.id, 'source', toStatus);
    };

    // Total selected includes regular selected + super liked
    const totalSelected = selectedPhotos.length + superLikedPhotos.length;
    const isOverLimit = totalSelected > photoLimit;
    const remainingCards = sourceImages.length;

    const generateWhatsAppLink = () => {
        let text = `Hi! 👋\n\nI've finished selecting my photos:\n\n`;

        // Super Liked (most important)
        if (superLikedPhotos.length > 0) {
            const superLikeNames = superLikedPhotos.map(p => p.name || p.id).join('\n⭐ ');
            text += `⭐ SUPER LIKE (${superLikedPhotos.length}):\n⭐ ${superLikeNames}\n\n`;
        }

        // Regular Selected
        if (selectedPhotos.length > 0) {
            const selectedNames = selectedPhotos.map(p => p.name || p.id).join('\n✅ ');
            text += `✅ Selected (${selectedPhotos.length}):\n✅ ${selectedNames}\n\n`;
        }

        text += `Total: ${totalSelected} photos selected\n\n`;

        // PC COPY PASTE STRING (For Search & Drag workflow)
        const allSelected = [...superLikedPhotos, ...selectedPhotos];
        if (allSelected.length > 0) {
            const searchString = allSelected.map(p => p.name || p.id).join(' OR ');
            text += `🖥️ *PC SEARCH STRING (For Lightroom Import):*\n\n${searchString}\n\n`;
        }

        text += `Thank you! 📸`;

        const phone = whatsappNumber.replace(/\D/g, '');
        return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 text-gray-900 dark:text-gray-100 overflow-hidden flex flex-col">

            <Header
                viewMode={viewMode}
                setViewMode={setViewMode}
                onInfoClick={() => setIsInfoOpen(true)}
            />

            <PhotographerModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />

            {/* Onboarding Guide for First-Time Users */}
            {eventSlug && <OnboardingModal eventSlug={eventSlug} />}

            {/* Main Content */}
            <main className="flex-1 relative pt-20 pb-24">

                {/* Swipe View */}
                {viewMode === 'swipe' && !isDeckEmpty && (
                    <div className="relative w-full h-[calc(100vh-200px)] flex flex-col items-center justify-center px-4">

                        {/* Context Title (Reviewing specific category) */}
                        {store.restartingFrom && (
                            <div className="absolute top-[-30px] z-20 animate-in fade-in slide-in-from-bottom-2">
                                <div className="px-4 py-1.5 rounded-full bg-purple-500 text-white text-sm font-bold shadow-lg flex items-center gap-2">
                                    <RotateCcw size={14} />
                                    Swiping from {store.restartingFrom === 'superLiked' ? 'Super Like' : store.restartingFrom.charAt(0).toUpperCase() + store.restartingFrom.slice(1)}
                                </div>
                            </div>
                        )}

                        {/* Progress Indicator */}
                        <div className={cn(
                            "absolute top-2 left-1/2 -translate-x-1/2 text-center z-10 pointer-events-none",
                            store.restartingFrom && "top-8" // Move down if title is present
                        )}>
                            <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider font-bold bg-white/50 dark:bg-black/50 px-2 py-1 rounded-full backdrop-blur-sm">
                                {remainingCards} photos remaining
                            </p>
                        </div>

                        <div className="relative w-full max-w-sm aspect-[3/4]">
                            <AnimatePresence>
                                {visibleCards.map((photo, index) => (
                                    <SwipeCard
                                        key={photo.id}
                                        photo={photo}
                                        index={index}
                                        onSwipe={handleSwipe}
                                    />
                                )).reverse()}
                            </AnimatePresence>
                        </div>

                        <ControlBar
                            onUndo={undoLastAction}
                            canUndo={history.length > 0}
                            onReject={() => handleSwipe('left')}
                            onSuperLike={() => handleSwipe('up')}
                            onSelect={() => handleSwipe('right')}
                            onMaybe={() => handleSwipe('down')}
                        />
                    </div>
                )}

                {/* Grid View */}
                {viewMode === 'grid' && (
                    <div className="overflow-y-auto h-[calc(100vh-140px)] pb-20">
                        <GridView setViewMode={setViewMode} />
                    </div>
                )}

                {/* Completion State */}
                {isDeckEmpty && viewMode === 'swipe' && (
                    <div className="flex flex-col items-center justify-center h-[calc(100vh-140px)] p-6 text-center space-y-8 animate-in fade-in zoom-in duration-500">

                        <motion.div
                            className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white shadow-2xl shadow-green-500/30"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", bounce: 0.5 }}
                        >
                            <CheckCircle2 size={48} strokeWidth={2.5} />
                        </motion.div>

                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold tracking-tight">All Done!</h2>
                            <p className="text-gray-500 dark:text-gray-400 max-w-xs">
                                You've reviewed all the photos. Ready to send your selection?
                            </p>
                        </div>

                        {/* Stats Card */}
                        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border dark:border-gray-800 shadow-xl w-full max-w-xs space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Maximum</span>
                                <span className="font-semibold tabular-nums">{photoLimit}</span>
                            </div>

                            {superLikedPhotos.length > 0 && (
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500 flex items-center gap-1">
                                        <Star size={14} className="text-blue-500" /> Super Liked
                                    </span>
                                    <span className="font-bold text-blue-500 tabular-nums">{superLikedPhotos.length}</span>
                                </div>
                            )}

                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Selected</span>
                                <span className="font-semibold tabular-nums text-green-500">{selectedPhotos.length}</span>
                            </div>

                            <div className="flex justify-between items-center border-t dark:border-gray-800 pt-4">
                                <span className="text-sm text-gray-500">Total</span>
                                <span className={`font-bold text-lg tabular-nums ${isOverLimit ? 'text-red-500' : 'text-green-500'}`}>
                                    {totalSelected}
                                </span>
                            </div>

                            {isOverLimit && (
                                <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                                    <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                                    <span>Please remove {totalSelected - photoLimit} photo(s) to proceed.</span>
                                </div>
                            )}
                        </div>

                        {!isOverLimit ? (
                            <Button
                                asChild
                                size="lg"
                                className="h-14 px-8 text-base rounded-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-xl shadow-green-500/25 transition-all hover:shadow-2xl hover:shadow-green-500/30"
                            >
                                <Link href={generateWhatsAppLink()} target="_blank">
                                    <MessageCircle className="mr-2" size={20} />
                                    Send via WhatsApp
                                </Link>
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => setViewMode('grid')}
                                className="h-12 rounded-full"
                            >
                                <Grid3X3 className="mr-2" size={18} />
                                Manage Selections
                            </Button>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
