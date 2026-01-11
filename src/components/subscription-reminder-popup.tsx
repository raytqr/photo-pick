"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, Sparkles, X, Crown, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface SubscriptionReminderPopupProps {
    tier: string | null | undefined;
    expiresAt: string | null | undefined;
    eventsRemaining: number | null | undefined;
}

type ReminderType = "expiring_soon" | "expired" | "low_credits" | null;

export function SubscriptionReminderPopup({
    tier,
    expiresAt,
    eventsRemaining,
}: SubscriptionReminderPopupProps) {
    const [open, setOpen] = useState(false);
    const [reminderType, setReminderType] = useState<ReminderType>(null);
    const [daysUntilExpiry, setDaysUntilExpiry] = useState(0);

    useEffect(() => {
        // Skip for free tier or no subscription
        if (!tier || tier === "free" || tier === "none") return;

        const expiry = expiresAt ? new Date(expiresAt) : null;

        // Calculate days until expiry
        let days = 0;
        if (expiry) {
            const now = new Date();
            const diffTime = expiry.getTime() - now.getTime();
            days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            setDaysUntilExpiry(days);
        }

        // Determine which reminder to show
        let typeToShow: ReminderType = null;

        // Priority 1: Expired
        if (expiry && days <= 0) {
            typeToShow = "expired";
        }
        // Priority 2: Expiring soon (within 7 days)
        else if (expiry && days <= 7) {
            typeToShow = "expiring_soon";
        }
        // Priority 3: Low credits (less than 2 remaining)
        else if (eventsRemaining !== null && eventsRemaining !== undefined && eventsRemaining < 2) {
            typeToShow = "low_credits";
        }

        if (!typeToShow) return;

        // Check if already dismissed today
        const dismissKey = `vibe_reminder_${typeToShow}_dismissed`;
        const lastDismissed = localStorage.getItem(dismissKey);

        if (lastDismissed) {
            const dismissedDate = new Date(lastDismissed);
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);

            // If dismissed today, don't show again
            if (dismissedDate >= todayStart) return;
        }

        // Show the popup after a short delay
        const timer = setTimeout(() => {
            setReminderType(typeToShow);
            setOpen(true);
        }, 2000);

        return () => clearTimeout(timer);
    }, [tier, expiresAt, eventsRemaining]);

    const handleClose = () => {
        setOpen(false);
        // Store dismissal timestamp
        if (reminderType) {
            const dismissKey = `vibe_reminder_${reminderType}_dismissed`;
            localStorage.setItem(dismissKey, new Date().toISOString());
        }
    };

    // Popup content based on reminder type
    const getPopupContent = () => {
        switch (reminderType) {
            case "expired":
                return {
                    icon: AlertTriangle,
                    iconBg: "from-red-600 to-orange-600",
                    iconColor: "text-white",
                    title: "Subscription Expired! ⚠️",
                    description: "Your pro features have been disabled. Renew now to continue creating unlimited events.",
                    actionText: "Renew Now",
                    actionLink: "/pricing",
                    bgGradient: "from-red-500/10 to-orange-500/10",
                    borderColor: "border-red-500/30",
                };
            case "expiring_soon":
                return {
                    icon: Clock,
                    iconBg: "from-amber-500 to-yellow-500",
                    iconColor: "text-white",
                    title: `Expiring in ${daysUntilExpiry} Days! ⏰`,
                    description: "Don't lose your pro features. Extend your subscription to keep your galleries running.",
                    actionText: "Extend Plan",
                    actionLink: "/pricing",
                    bgGradient: "from-amber-500/10 to-yellow-500/10",
                    borderColor: "border-amber-500/30",
                };
            case "low_credits":
                return {
                    icon: Sparkles,
                    iconBg: "from-purple-600 to-pink-600",
                    iconColor: "text-white",
                    title: "Credits Running Low! 📊",
                    description: `You have ${eventsRemaining || 0} event${(eventsRemaining || 0) === 1 ? "" : "s"} remaining. Credits will reset on your next billing date.`,
                    actionText: "View Plans",
                    actionLink: "/pricing",
                    bgGradient: "from-purple-500/10 to-pink-500/10",
                    borderColor: "border-purple-500/30",
                };
            default:
                return null;
        }
    };

    const content = getPopupContent();
    if (!content) return null;

    const IconComponent = content.icon;

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className={`bg-[#0a0a0a] border ${content.borderColor} text-white w-full max-w-md rounded-3xl p-6 shadow-2xl relative overflow-hidden`}
                    >
                        {/* Background gradient */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${content.bgGradient} pointer-events-none`} />

                        {/* Close button */}
                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors z-10"
                        >
                            <X size={20} />
                        </button>

                        {/* Content */}
                        <div className="relative z-10">
                            {/* Icon */}
                            <div className="flex justify-center mb-6">
                                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${content.iconBg} flex items-center justify-center shadow-lg shadow-purple-500/20`}>
                                    <IconComponent className={`w-8 h-8 ${content.iconColor}`} />
                                </div>
                            </div>

                            {/* Title & Description */}
                            <h2 className="text-center text-2xl font-black mb-4">
                                {content.title}
                            </h2>

                            <p className="text-center text-gray-300 mb-6">
                                {content.description}
                            </p>

                            {/* Current tier badge */}
                            <div className="flex justify-center mb-6">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                                    <Crown size={16} className="text-amber-400" />
                                    <span className="text-sm font-bold uppercase">{tier} Plan</span>
                                </div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex gap-3">
                                <Button
                                    onClick={handleClose}
                                    variant="ghost"
                                    className="flex-1 h-12 rounded-xl bg-white/5 hover:bg-white/10 font-bold text-gray-300"
                                >
                                    Remind Later
                                </Button>
                                <Button
                                    asChild
                                    className="flex-1 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 font-bold hover:scale-105 transition-all text-white"
                                >
                                    <Link href={content.actionLink} onClick={handleClose}>
                                        {content.actionText}
                                        <ArrowRight className="ml-2" size={18} />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
