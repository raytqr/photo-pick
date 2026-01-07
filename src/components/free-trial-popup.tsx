"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FreeTrialPopupProps {
    tier: string | null | undefined;
}

export function FreeTrialPopup({ tier }: FreeTrialPopupProps) {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        // Only show for free tier users
        if (tier !== 'free') return;

        // Check if already seen
        const hasSeen = localStorage.getItem("vibe_trial_popup_seen");
        if (!hasSeen) {
            // Delay slightly for effect
            const timer = setTimeout(() => {
                setOpen(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [tier]);

    const handleClose = () => {
        setOpen(false);
        localStorage.setItem("vibe_trial_popup_seen", "true");
    };

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-[#0a0a0a] border border-white/10 text-white w-full max-w-md rounded-3xl p-6 shadow-2xl relative"
                    >
                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/20 animate-bounce">
                                <Sparkles className="w-8 h-8 text-white" />
                            </div>
                        </div>

                        <h2 className="text-center text-2xl font-black mb-4">
                            Special Gift for You! 🎁
                        </h2>

                        <div className="text-center space-y-4 mb-6">
                            <p className="text-gray-300">
                                Welcome to VibeSelect! To get you started, we've unlocked a special trial:
                            </p>

                            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold">
                                        2
                                    </div>
                                    <span className="font-bold">Free Events</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                                        7
                                    </div>
                                    <span className="font-bold">Days Validity</span>
                                </div>
                            </div>

                            <p className="text-sm text-gray-500">
                                Try out all the features and start delivering beautiful galleries today.
                            </p>
                        </div>

                        <Button
                            onClick={handleClose}
                            className="w-full h-12 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 font-bold hover:scale-105 transition-all text-white"
                        >
                            Claim Offer 🚀
                        </Button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
