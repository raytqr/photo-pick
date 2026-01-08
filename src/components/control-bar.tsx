"use client";

import { X, Heart, Star, Undo2, ArrowDown } from "lucide-react";

interface ControlBarProps {
    onUndo: () => void;
    canUndo: boolean;
    onReject: () => void;
    onSuperLike: () => void;
    onSelect: () => void;
    onMaybe: () => void;
}

export function ControlBar({ onUndo, canUndo, onReject, onSuperLike, onSelect, onMaybe }: ControlBarProps) {

    return (
        <div className="fixed bottom-0 inset-x-0 p-6 pb-8 flex justify-center items-end bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none z-50">
            <div className="flex items-center gap-4 pointer-events-auto">

                {/* Undo */}
                <div className="flex flex-col items-center gap-1">
                    <button
                        onClick={onUndo}
                        disabled={!canUndo}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${canUndo
                            ? "bg-gray-800 text-yellow-500 hover:scale-110 border border-yellow-500/30"
                            : "bg-gray-900 text-gray-600 border border-gray-800 cursor-not-allowed"
                            }`}
                    >
                        <Undo2 size={22} />
                    </button>
                    <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Undo</span>
                </div>

                {/* Reject */}
                <div className="flex flex-col items-center gap-1">
                    <button
                        onClick={onReject}
                        className="w-14 h-14 rounded-full bg-black/60 backdrop-blur-md border border-red-500/50 text-red-500 flex items-center justify-center transition-all hover:scale-110 active:scale-95 hover:bg-red-500 hover:text-white"
                    >
                        <X size={28} strokeWidth={3} />
                    </button>
                    <span className="text-[10px] font-medium text-red-500/80 uppercase tracking-wide">Pass</span>
                </div>

                {/* Super Like */}
                <div className="flex flex-col items-center gap-1 bg-blue-500/10 p-1.5 rounded-2xl border border-blue-500/30 -translate-y-4">
                    <button
                        onClick={onSuperLike}
                        className="w-12 h-12 rounded-xl bg-blue-500 text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                    >
                        <Star size={24} fill="white" />
                    </button>
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wide">Super</span>
                </div>

                {/* Select */}
                <div className="flex flex-col items-center gap-1">
                    <button
                        onClick={onSelect}
                        className="w-14 h-14 rounded-full bg-black/60 backdrop-blur-md border border-green-500/50 text-green-500 flex items-center justify-center transition-all hover:scale-110 active:scale-95 hover:bg-green-500 hover:text-white"
                    >
                        <Heart size={28} strokeWidth={3} />
                    </button>
                    <span className="text-[10px] font-medium text-green-500/80 uppercase tracking-wide">Like</span>
                </div>

                {/* Maybe - Hidden/Small */}
                <div className="flex flex-col items-center gap-1">
                    <button
                        onClick={onMaybe}
                        className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-md border border-yellow-500/50 text-yellow-500 flex items-center justify-center transition-all hover:scale-110 active:scale-95 hover:bg-yellow-500 hover:text-black"
                    >
                        <ArrowDown size={22} />
                    </button>
                    <span className="text-[10px] font-medium text-yellow-500/80 uppercase tracking-wide">Maybe</span>
                </div>

            </div>
        </div>
    );
}
