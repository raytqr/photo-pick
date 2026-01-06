"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import {
    ArrowRight,
    ArrowLeft,
    ArrowUp,
    ArrowDown,
    Heart,
    X,
    Star,
    HelpCircle,
    ChevronRight,
    Sparkles
} from "lucide-react";

const gestureGuides = [
    {
        direction: "right",
        icon: ArrowRight,
        action: "Like",
        color: "from-green-400 to-emerald-500",
        description: "Swipe right or tap the heart to select this photo"
    },
    {
        direction: "left",
        icon: ArrowLeft,
        action: "Pass",
        color: "from-red-400 to-rose-500",
        description: "Swipe left or tap X to skip this photo"
    },
    {
        direction: "up",
        icon: ArrowUp,
        action: "Super Like",
        color: "from-blue-400 to-indigo-500",
        description: "Swipe up for your absolute favorites"
    },
    {
        direction: "down",
        icon: ArrowDown,
        action: "Maybe",
        color: "from-yellow-400 to-amber-500",
        description: "Swipe down to save for later review"
    }
];

export default function GuidePage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white">

            {/* Header */}
            <div className="text-center pt-16 pb-8 px-6">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-sm mb-6"
                >
                    <Sparkles size={14} /> Quick Guide
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl md:text-5xl font-bold mb-4"
                >
                    How to Select Photos
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-gray-400 text-lg max-w-xl mx-auto"
                >
                    Swipe through photos like a pro. It's as easy as using Tinder!
                </motion.p>
            </div>

            {/* Gesture Cards */}
            <div className="max-w-4xl mx-auto px-6 py-12">
                <div className="grid md:grid-cols-2 gap-6">
                    {gestureGuides.map((guide, index) => (
                        <motion.div
                            key={guide.direction}
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-all"
                        >
                            <div className="flex items-start gap-6">
                                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${guide.color} flex items-center justify-center shrink-0 shadow-lg`}>
                                    <guide.icon size={28} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold mb-2">{guide.action}</h3>
                                    <p className="text-gray-400">{guide.description}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Tips Section */}
            <div className="max-w-4xl mx-auto px-6 py-12">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-3xl p-8"
                >
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                        <HelpCircle className="text-purple-400" /> Pro Tips
                    </h2>

                    <ul className="space-y-4">
                        <li className="flex items-start gap-4">
                            <ChevronRight className="text-purple-400 mt-1 shrink-0" size={20} />
                            <p className="text-gray-300">
                                <strong className="text-white">Switch to Grid View</strong> — Use the grid icon in the header to see all photos at once and manage your selections.
                            </p>
                        </li>
                        <li className="flex items-start gap-4">
                            <ChevronRight className="text-purple-400 mt-1 shrink-0" size={20} />
                            <p className="text-gray-300">
                                <strong className="text-white">Undo Mistakes</strong> — Accidentally swiped wrong? Tap the undo button to bring back the last photo.
                            </p>
                        </li>
                        <li className="flex items-start gap-4">
                            <ChevronRight className="text-purple-400 mt-1 shrink-0" size={20} />
                            <p className="text-gray-300">
                                <strong className="text-white">Check Your Limit</strong> — Keep an eye on the counter in the header to stay within your selection limit.
                            </p>
                        </li>
                        <li className="flex items-start gap-4">
                            <ChevronRight className="text-purple-400 mt-1 shrink-0" size={20} />
                            <p className="text-gray-300">
                                <strong className="text-white">Send via WhatsApp</strong> — Once done, tap the green button to send your selections directly to the photographer.
                            </p>
                        </li>
                    </ul>
                </motion.div>
            </div>

            {/* CTA */}
            <div className="text-center py-12 px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <p className="text-gray-400 mb-6">Ready to start selecting?</p>
                    <Button
                        asChild
                        size="lg"
                        className="h-14 px-10 text-lg rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                        <Link href="/">
                            Back to Gallery <ChevronRight className="ml-2" size={20} />
                        </Link>
                    </Button>
                </motion.div>
            </div>
        </div>
    );
}
