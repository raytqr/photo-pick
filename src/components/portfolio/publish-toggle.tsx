"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Loader2, Rocket } from "lucide-react";
import { togglePortfolioPublish } from "@/actions/portfolio";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface PublishToggleProps {
    isPublished: boolean;
    variant?: "default" | "prominent";
}

export function PublishToggle({ isPublished: initialPublished, variant = "default" }: PublishToggleProps) {
    const router = useRouter();
    const [isPublished, setIsPublished] = useState(initialPublished);
    const [loading, setLoading] = useState(false);

    const handleToggle = async () => {
        setLoading(true);
        const newStatus = !isPublished;
        const result = await togglePortfolioPublish(newStatus);
        setLoading(false);

        if (result.success) {
            setIsPublished(newStatus);
            toast.success(newStatus ? "🎉 Portfolio published!" : "Portfolio unpublished");
            router.refresh();
        } else {
            toast.error(result.error || "Failed to update");
        }
    };

    if (variant === "prominent") {
        return (
            <Button
                onClick={handleToggle}
                disabled={loading}
                className={`h-14 px-8 rounded-2xl font-bold text-lg transition-all duration-300 ${isPublished
                        ? "bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white"
                        : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-500/25"
                    }`}
            >
                {loading ? (
                    <Loader2 size={20} className="mr-2 animate-spin" />
                ) : isPublished ? (
                    <EyeOff size={20} className="mr-2" />
                ) : (
                    <Rocket size={20} className="mr-2" />
                )}
                {isPublished ? "Unpublish Portfolio" : "Publish Portfolio"}
            </Button>
        );
    }

    return (
        <Button
            onClick={handleToggle}
            disabled={loading}
            variant="outline"
            className={`rounded-xl font-semibold transition-all duration-300 ${isPublished
                    ? "border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:border-red-500/50"
                    : "border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20 hover:border-green-500/50"
                }`}
        >
            {loading ? (
                <Loader2 size={16} className="mr-2 animate-spin" />
            ) : isPublished ? (
                <EyeOff size={16} className="mr-2" />
            ) : (
                <Rocket size={16} className="mr-2" />
            )}
            {isPublished ? "Unpublish" : "Publish Now"}
        </Button>
    );
}
