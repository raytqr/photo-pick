"use client";

import { useAppStore } from "@/store/useAppStore";
import { X, Heart, Star, HelpCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ControlBarProps {
    onSwipe: (dir: 'left' | 'right' | 'up' | 'down') => void;
    canSwipe: boolean;
}

export function ControlBar({ onSwipe, canSwipe }: ControlBarProps) {
    const undoLastAction = useAppStore(state => state.undoLastAction);
    const history = useAppStore(state => state.history);
    const hasHistory = history.length > 0;

    return (
        <div className="fixed bottom-6 left-0 right-0 flex items-center justify-center gap-4 z-40 px-4 pointer-events-none">
            {/* Pointer events auto so clicking buttons works, but clicking gaps doesn't block underlying (unlikely issue here) */}
            <div className="flex items-center gap-3 pointer-events-auto bg-white/10 dark:bg-black/20 backdrop-blur-md p-2 rounded-full shadow-lg border border-white/20">

                <Button
                    size="icon"
                    variant="ghost"
                    className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 text-yellow-500 hover:bg-yellow-100 dark:hover:bg-gray-700"
                    onClick={undoLastAction}
                    disabled={!hasHistory}
                >
                    <RotateCcw size={20} />
                </Button>

                <Button
                    size="icon"
                    variant="ghost"
                    className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 text-red-500 hover:scale-110 transition border-2 border-transparent hover:border-red-500"
                    onClick={() => onSwipe('left')}
                    disabled={!canSwipe}
                >
                    <X size={28} />
                </Button>

                <Button
                    size="icon"
                    variant="ghost"
                    className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-500 hover:scale-110 transition border-2 border-transparent hover:border-blue-500"
                    onClick={() => onSwipe('up')}
                    disabled={!canSwipe}
                >
                    <Star size={24} />
                </Button>

                <Button
                    size="icon"
                    variant="ghost"
                    className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 text-green-500 hover:scale-110 transition border-2 border-transparent hover:border-green-500"
                    onClick={() => onSwipe('right')}
                    disabled={!canSwipe}
                >
                    <Heart size={28} fill="currentColor" className="text-green-500" />
                </Button>

                <Button
                    size="icon"
                    variant="ghost"
                    className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 hover:scale-110 transition border-2 border-transparent hover:border-yellow-600"
                    onClick={() => onSwipe('down')}
                    disabled={!canSwipe}
                >
                    <HelpCircle size={24} />
                </Button>

            </div>
        </div>
    );
}
