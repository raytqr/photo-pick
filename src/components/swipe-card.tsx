"use client";

import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Photo, useAppStore } from "@/store/useAppStore";
import Image from "next/image";
import { X, Heart, Star, HelpCircle, RotateCcw } from "lucide-react";

interface SwipeCardProps {
    photo: Photo;
    onSwipe: (direction: 'left' | 'right' | 'up' | 'down') => void;
    index: number; // 0 is top
}

export function SwipeCard({ photo, onSwipe, index }: SwipeCardProps) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Rotation based on X movement
    const rotate = useTransform(x, [-200, 200], [-15, 15]);

    // Opacity indicators
    const likeOpacity = useTransform(x, [20, 150], [0, 1]);
    const nopeOpacity = useTransform(x, [-20, -150], [0, 1]);
    const superLikeOpacity = useTransform(y, [-20, -150], [0, 1]);
    const maybeOpacity = useTransform(y, [20, 150], [0, 1]);

    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const threshold = 100;

        if (info.offset.x > threshold) {
            onSwipe('right');
        } else if (info.offset.x < -threshold) {
            onSwipe('left');
        } else if (info.offset.y < -threshold) {
            onSwipe('up');
        } else if (info.offset.y > threshold) {
            onSwipe('down');
        }
    };

    // Only the top card is interactive
    const isFront = index === 0;

    return (
        <motion.div
            style={{
                x,
                y,
                rotate: isFront ? rotate : 0,
                zIndex: 50 - index,
                scale: 1 - index * 0.05,
                top: index * 10,
            }}
            className="absolute w-full h-full max-w-[400px] rounded-3xl shadow-2xl overflow-hidden bg-gray-900 cursor-grab active:cursor-grabbing border border-white/10 origin-top"
            drag={isFront ? true : false}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.6}
            onDragEnd={handleDragEnd}
            whileTap={{ scale: 1.02 }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{
                scale: 1 - index * 0.05,
                opacity: 1,
            }}
            exit={{
                opacity: 0,
                scale: 0.5,
                transition: { duration: 0.2 }
            }}
        >
            {/* Visual Feedback Overlays */}
            <motion.div style={{ opacity: likeOpacity }} className="absolute top-8 left-8 z-30 transform -rotate-12 border-4 border-green-500 rounded-lg p-2 px-4 shadow-lg bg-black/30 backdrop-blur-sm">
                <span className="text-4xl font-black text-green-500 uppercase tracking-widest">Like</span>
            </motion.div>

            <motion.div style={{ opacity: nopeOpacity }} className="absolute top-8 right-8 z-30 transform rotate-12 border-4 border-red-500 rounded-lg p-2 px-4 shadow-lg bg-black/30 backdrop-blur-sm">
                <span className="text-4xl font-black text-red-500 uppercase tracking-widest">Nope</span>
            </motion.div>

            <motion.div style={{ opacity: superLikeOpacity }} className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 border-4 border-blue-500 rounded-lg p-2 px-4 shadow-lg bg-black/30 backdrop-blur-sm flex items-center gap-2">
                <Star className="text-blue-500" size={24} fill="currentColor" />
                <span className="text-2xl font-black text-blue-500 uppercase tracking-widest">Super</span>
            </motion.div>

            <motion.div style={{ opacity: maybeOpacity }} className="absolute top-1/2 left-1/2 -translate-x-1/2 z-30 border-4 border-yellow-500 rounded-lg p-2 px-4 shadow-lg bg-black/30 backdrop-blur-sm">
                <span className="text-2xl font-black text-yellow-500 uppercase tracking-widest">Maybe</span>
            </motion.div>

            {/* Image Container - Uses object-contain to preserve aspect ratio */}
            <div className="relative w-full h-full pointer-events-none select-none bg-black flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={photo.url}
                    alt={photo.name || "Photo"}
                    className="max-w-full max-h-full w-auto h-auto object-contain pointer-events-none select-none"
                    draggable={false}
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/60 pointer-events-none" />

                {/* Re-Swipe Indicator */}
                {isFront && useAppStore.getState().restartingFrom && (
                    <div className="absolute top-4 inset-x-0 flex justify-center z-40">
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full text-xs font-bold text-white shadow-xl flex items-center gap-1.5">
                            <RotateCcw size={12} className="text-yellow-400" />
                            Swiping from {useAppStore.getState().restartingFrom === 'superLiked' ? 'Super Like' :
                                useAppStore.getState().restartingFrom === 'selected' ? 'Selected' :
                                    useAppStore.getState().restartingFrom === 'maybe' ? 'Maybe' : 'Rejected'}
                        </div>
                    </div>
                )}

                {/* Photo Name */}
                <div className="absolute bottom-6 left-6 right-6 text-white z-20">
                    <h3 className="font-bold text-lg drop-shadow-lg">{photo.name || photo.id}</h3>
                </div>
            </div>
        </motion.div>
    );
}
