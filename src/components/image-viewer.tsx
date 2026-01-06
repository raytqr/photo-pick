"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface ImageViewerProps {
    url: string | null;
    onClose: () => void;
}

export function ImageViewer({ url, onClose }: ImageViewerProps) {
    return (
        <AnimatePresence>
            {url && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/10 z-[70]"
                        onClick={onClose}
                    >
                        <X size={32} />
                    </Button>

                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="relative w-full h-full max-w-5xl max-h-[90vh]"
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
                </motion.div>
            )}
        </AnimatePresence>
    );
}
