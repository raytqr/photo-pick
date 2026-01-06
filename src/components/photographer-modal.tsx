"use client";

import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

// Since I haven't created the Dialog UI component yet, I'll make a custom modal using Framer Motion 
// to ensure it works beautifully without dependency setup overhead for Shadcn Dialog right now.

interface PhotographerModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function PhotographerModal({ isOpen, onClose }: PhotographerModalProps) {
    const { logoUrl, bio, portfolio, eventName } = useAppStore();

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.95 }}
                        className="fixed inset-x-4 top-[10%] bottom-[10%] md:inset-x-auto md:w-[600px] md:left-1/2 md:-translate-x-1/2 bg-white dark:bg-gray-950 z-[70] rounded-2xl shadow-2xl overflow-hidden flex flex-col border dark:border-gray-800"
                    >
                        {/* Header */}
                        <div className="p-4 border-b dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-900">
                            <h2 className="text-lg font-bold">About Photographer</h2>
                            <Button variant="ghost" size="icon" onClick={onClose}><X size={20} /></Button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Profile */}
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden border-2 border-primary/20">
                                    {logoUrl ? <Image src={logoUrl} alt="Logo" width={96} height={96} className="w-full h-full object-cover" /> : null}
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">Event</p>
                                    <h3 className="text-xl font-bold">{eventName}</h3>
                                    <div className="h-1 w-12 bg-primary mx-auto rounded-full" />
                                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed max-w-sm mx-auto">
                                        {bio || "No bio provided."}
                                    </p>
                                </div>
                            </div>

                            {/* Portfolio Grid */}
                            {portfolio.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-sm font-bold uppercase text-gray-500 tracking-wider">Portfolio</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {portfolio.map((url, i) => (
                                            <div key={i} className="relative aspect-square rounded-md overflow-hidden bg-gray-100">
                                                <Image src={url} alt="Portfolio" fill className="object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
