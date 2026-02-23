"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Check, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface ImageViewerProps {
    url: string | null;
    onClose: () => void;
    // Optional action buttons for grid view
    actions?: {
        status: string;
        onSuperLike?: () => void;
        onSelect?: () => void;
        onMaybe?: () => void;
        onReject?: () => void;
    };
    photoName?: string;
}

export function ImageViewer({ url, onClose, actions, photoName }: ImageViewerProps) {
    return (
        <AnimatePresence>
            {url && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[60] bg-black/95 flex flex-col backdrop-blur-sm"
                    onClick={onClose}
                >
                    {/* Close Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/10 z-[70]"
                        onClick={onClose}
                    >
                        <X size={28} />
                    </Button>

                    {/* Photo Name */}
                    {photoName && (
                        <div className="absolute top-4 left-4 z-[70]">
                            <p className="text-white/60 text-xs font-mono">{photoName}</p>
                        </div>
                    )}

                    {/* Image */}
                    <div className="flex-1 flex items-center justify-center p-4 pb-2">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full h-full max-w-5xl"
                            style={{ maxHeight: actions ? 'calc(100vh - 120px)' : 'calc(100vh - 40px)' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Image
                                src={url}
                                alt="Full Preview"
                                fill
                                className="object-contain"
                                sizes="100vw"
                            />
                        </motion.div>
                    </div>

                    {/* Action Buttons (when in grid view) */}
                    {actions && (
                        <motion.div
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 30, opacity: 0 }}
                            transition={{ delay: 0.1 }}
                            className="px-4 pb-6 pt-2 safe-bottom"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-center gap-3 max-w-lg mx-auto">
                                {/* Reject */}
                                {actions.status !== 'rejected' && actions.onReject && (
                                    <button
                                        onClick={() => { actions.onReject?.(); onClose(); }}
                                        className="flex flex-col items-center gap-1 group"
                                    >
                                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center transition-all group-hover:scale-110 group-active:scale-95 group-hover:bg-red-500/40">
                                            <X size={24} className="text-red-400" />
                                        </div>
                                        <span className="text-[10px] text-red-400/80">Reject</span>
                                    </button>
                                )}

                                {/* Maybe */}
                                {actions.status !== 'maybe' && actions.onMaybe && (
                                    <button
                                        onClick={() => { actions.onMaybe?.(); onClose(); }}
                                        className="flex flex-col items-center gap-1 group"
                                    >
                                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-yellow-500/20 border-2 border-yellow-500 flex items-center justify-center transition-all group-hover:scale-110 group-active:scale-95 group-hover:bg-yellow-500/40">
                                            <HelpCircle size={24} className="text-yellow-400" />
                                        </div>
                                        <span className="text-[10px] text-yellow-400/80">Maybe</span>
                                    </button>
                                )}

                                {/* Select */}
                                {actions.status !== 'selected' && actions.onSelect && (
                                    <button
                                        onClick={() => { actions.onSelect?.(); onClose(); }}
                                        className="flex flex-col items-center gap-1 group"
                                    >
                                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center transition-all group-hover:scale-110 group-active:scale-95 group-hover:bg-green-500/40">
                                            <Check size={28} className="text-green-400" />
                                        </div>
                                        <span className="text-[10px] text-green-400/80">Select</span>
                                    </button>
                                )}

                                {/* Super Like */}
                                {actions.status !== 'superLiked' && actions.onSuperLike && (
                                    <button
                                        onClick={() => { actions.onSuperLike?.(); onClose(); }}
                                        className="flex flex-col items-center gap-1 group"
                                    >
                                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center transition-all group-hover:scale-110 group-active:scale-95 group-hover:bg-blue-500/40">
                                            <Star size={24} className="text-blue-400" />
                                        </div>
                                        <span className="text-[10px] text-blue-400/80">Super Like</span>
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
