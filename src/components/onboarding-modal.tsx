"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
    ArrowRight,
    ArrowLeft,
    ArrowUp,
    ArrowDown,
    Heart,
    X,
    Star,
    HelpCircle,
    Undo2,
    MessageCircle,
    Grip,
    ChevronRight
} from "lucide-react";

interface OnboardingModalProps {
    eventSlug: string;
}

export function OnboardingModal({ eventSlug }: OnboardingModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(0);

    useEffect(() => {
        // Check if user has seen onboarding for this event
        const seen = localStorage.getItem(`onboarding-${eventSlug}`);
        if (!seen) {
            setIsOpen(true);
        }
    }, [eventSlug]);

    const handleClose = () => {
        localStorage.setItem(`onboarding-${eventSlug}`, 'true');
        setIsOpen(false);
    };

    const steps = [
        {
            title: "Selamat Datang! 👋",
            description: "Ini panduan singkat cara memilih foto favorit Anda.",
            content: (
                <div className="text-center space-y-4">
                    <div className="text-6xl">📸</div>
                    <p className="text-gray-400">Geser atau ketuk tombol untuk memilih foto</p>
                </div>
            )
        },
        {
            title: "Gestur Swipe",
            description: "Geser foto ke arah yang sesuai:",
            content: (
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
                        <ArrowRight className="mx-auto text-green-500 mb-2" size={28} />
                        <p className="font-medium text-green-500">Kanan = Pilih</p>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
                        <ArrowLeft className="mx-auto text-red-500 mb-2" size={28} />
                        <p className="font-medium text-red-500">Kiri = Lewati</p>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-center">
                        <ArrowUp className="mx-auto text-blue-500 mb-2" size={28} />
                        <p className="font-medium text-blue-500">Atas = Super Like</p>
                    </div>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-center">
                        <ArrowDown className="mx-auto text-yellow-500 mb-2" size={28} />
                        <p className="font-medium text-yellow-500">Bawah = Mungkin</p>
                    </div>
                </div>
            )
        },
        {
            title: "Tombol Kontrol",
            description: "Atau gunakan tombol di bawah foto:",
            content: (
                <div className="flex justify-center gap-4">
                    <div className="text-center">
                        <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-2">
                            <Undo2 className="text-yellow-500" size={20} />
                        </div>
                        <p className="text-xs text-gray-400">Undo</p>
                    </div>
                    <div className="text-center">
                        <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-2">
                            <X className="text-red-500" size={20} />
                        </div>
                        <p className="text-xs text-gray-400">Lewati</p>
                    </div>
                    <div className="text-center">
                        <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-2">
                            <Star className="text-blue-500" size={20} />
                        </div>
                        <p className="text-xs text-gray-400">Super</p>
                    </div>
                    <div className="text-center">
                        <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-2">
                            <Heart className="text-green-500" size={20} />
                        </div>
                        <p className="text-xs text-gray-400">Pilih</p>
                    </div>
                </div>
            )
        },
        {
            title: "Counter & Limit",
            description: "Perhatikan angka di pojok kanan atas:",
            content: (
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-lg font-bold">
                        <span className="text-green-500">5</span>
                        <span className="mx-1 text-gray-400">/</span>
                        <span>50</span>
                    </div>
                    <p className="text-gray-400 text-sm">
                        <strong>5</strong> = foto yang sudah dipilih<br />
                        <strong>50</strong> = maksimal yang boleh dipilih
                    </p>
                </div>
            )
        },
        {
            title: "Toolbar Atas",
            description: "Tombol-tombol di kanan atas navbar:",
            content: (
                <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-500/10 border border-purple-500/30">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center shrink-0">
                            <MessageCircle className="text-white" size={18} />
                        </div>
                        <div className="text-left">
                            <p className="font-medium text-purple-400">Send</p>
                            <p className="text-xs text-gray-500">Kirim pilihan via WhatsApp</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-500/10 border border-gray-500/30">
                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center shrink-0">
                            <Undo2 className="text-gray-400" size={18} />
                        </div>
                        <div className="text-left">
                            <p className="font-medium text-gray-300">Restart</p>
                            <p className="text-xs text-gray-500">Mulai ulang dari awal</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-500/10 border border-gray-500/30">
                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center shrink-0">
                            <Grip className="text-gray-400" size={18} />
                        </div>
                        <div className="text-left">
                            <p className="font-medium text-gray-300">Grid/Swipe</p>
                            <p className="text-xs text-gray-500">Ganti mode tampilan</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Siap Mulai! 🚀",
            description: "Setelah selesai, kirim pilihan via WhatsApp.",
            content: (
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium">
                        <MessageCircle size={20} />
                        Send WA
                    </div>
                    <p className="text-gray-400 text-sm">
                        Tombol ini akan muncul di navbar saat ada foto terpilih
                    </p>
                </div>
            )
        }
    ];

    const currentStep = steps[step];
    const isLastStep = step === steps.length - 1;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={handleClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-gray-900 border border-gray-800 rounded-3xl max-w-md w-full p-6 space-y-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Progress dots */}
                        <div className="flex justify-center gap-1.5">
                            {steps.map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-2 h-2 rounded-full transition-colors ${i === step ? 'bg-white' : 'bg-gray-700'
                                        }`}
                                />
                            ))}
                        </div>

                        {/* Content */}
                        <div className="text-center space-y-2">
                            <h2 className="text-xl font-bold text-white">{currentStep.title}</h2>
                            <p className="text-gray-400 text-sm">{currentStep.description}</p>
                        </div>

                        <div className="py-4">
                            {currentStep.content}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            {step > 0 && (
                                <Button
                                    variant="outline"
                                    className="flex-1 h-12 rounded-full border-gray-700 text-gray-300"
                                    onClick={() => setStep(step - 1)}
                                >
                                    Kembali
                                </Button>
                            )}
                            <Button
                                className="flex-1 h-12 rounded-full bg-white text-black hover:bg-gray-200"
                                onClick={() => isLastStep ? handleClose() : setStep(step + 1)}
                            >
                                {isLastStep ? 'Mulai Memilih' : 'Lanjut'}
                                <ChevronRight size={18} className="ml-1" />
                            </Button>
                        </div>

                        {/* Skip */}
                        <button
                            className="w-full text-center text-gray-500 text-sm hover:text-white transition"
                            onClick={handleClose}
                        >
                            Lewati panduan
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
