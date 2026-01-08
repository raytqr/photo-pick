
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { X, Heart, Star } from "lucide-react";
import Image from "next/image";

export function AnimatedSwipeDemo() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [imageError, setImageError] = useState<Record<number, boolean>>({});

    // Mock cards with real images and gradient fallbacks
    const cards = [
        {
            id: 1,
            action: 'like',
            rotate: 10,
            x: 200,
            image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=60&w=400",
            gradient: "from-pink-500 to-rose-500"
        },
        {
            id: 2,
            action: 'nope',
            rotate: -10,
            x: -200,
            image: "https://images.unsplash.com/photo-1511285560982-1351cdeb9821?auto=format&fit=crop&q=60&w=400",
            gradient: "from-purple-500 to-indigo-500"
        },
        {
            id: 3,
            action: 'super',
            rotate: 0,
            y: -200,
            image: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=60&w=400",
            gradient: "from-blue-400 to-cyan-400"
        },
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % (cards.length + 1));
        }, 2200);
        return () => clearInterval(timer);
    }, []);

    const nextCard = cards[(currentIndex + 1) % cards.length];
    const currentCard = cards[currentIndex];

    return (
        <div className="relative w-48 h-72 mx-auto my-4 perspective-1000 font-sans">
            {/* Next Card (Background Stack) - MOVED OUTSIDE AnimatePresence */}
            <div className={`absolute inset-0 bg-gradient-to-br ${nextCard?.gradient || 'from-gray-800 to-gray-900'} rounded-2xl border border-gray-700 shadow-xl transform scale-95 translate-y-2 overflow-hidden z-0`}>
                {!imageError[nextCard?.id] && nextCard && (
                    <Image
                        src={nextCard.image}
                        alt="Next Photo"
                        fill
                        className="object-cover opacity-40 blur-[1px]"
                        sizes="200px"
                        unoptimized
                        onError={() => setImageError(prev => ({ ...prev, [nextCard.id]: true }))}
                    />
                )}
                <div className="absolute inset-0 bg-black/20" />
            </div>

            <AnimatePresence mode="popLayout">
                {currentIndex < cards.length ? (
                    <motion.div
                        key={cards[currentIndex].id}
                        initial={{ x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 }}
                        animate={{
                            x: cards[currentIndex].x || 0,
                            y: cards[currentIndex].y || 0,
                            rotate: cards[currentIndex].rotate || 0,
                            opacity: 1
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6, ease: "easeInOut", delay: 0.4 }}
                        className={`absolute inset-0 bg-gradient-to-br ${cards[currentIndex].gradient} rounded-2xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col z-10`}
                    >
                        {/* Image */}
                        <div className="absolute inset-0">
                            {!imageError[cards[currentIndex].id] && (
                                <Image
                                    src={cards[currentIndex].image}
                                    alt="Demo Photo"
                                    fill
                                    className="object-cover"
                                    sizes="200px"
                                    priority
                                    unoptimized
                                    onError={() => setImageError(prev => ({ ...prev, [cards[currentIndex].id]: true }))}
                                />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        </div>

                        {/* Overlay Badge */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5, type: "spring" }}
                            className={`absolute top-4 ${cards[currentIndex].action === 'like' ? 'left-4 -rotate-12' : cards[currentIndex].action === 'nope' ? 'right-4 rotate-12' : 'bottom-16 left-1/2 -translate-x-1/2'} 
                            px-3 py-1 border-4 font-black rounded-lg text-lg uppercase tracking-wider shadow-lg bg-black/20 backdrop-blur-sm z-20
                            ${cards[currentIndex].action === 'like' ? 'border-green-500 text-green-500' :
                                    cards[currentIndex].action === 'nope' ? 'border-red-500 text-red-500' :
                                        'border-blue-500 text-blue-500'}`}
                        >
                            {cards[currentIndex].action === 'super' ? 'SUPER' : cards[currentIndex].action.toUpperCase()}
                        </motion.div>

                        {/* Card Info */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 z-10 text-left">
                            <div className="h-4 w-24 bg-white/80 rounded mb-2 shadow-sm" />
                            <div className="h-2 w-16 bg-white/50 rounded shadow-sm" />
                        </div>
                    </motion.div>
                ) : (
                    <div key="reset-spacer" />
                )}
            </AnimatePresence>

            {/* Controls Hints */}
            <div className="absolute -bottom-10 left-0 right-0 flex justify-center gap-4 opacity-50">
                <div className="p-2 bg-red-500/20 rounded-full"><X size={16} className="text-red-500" /></div>
                <div className="p-2 bg-blue-500/20 rounded-full"><Star size={16} className="text-blue-500" /></div>
                <div className="p-2 bg-green-500/20 rounded-full"><Heart size={16} className="text-green-500" /></div>
            </div>
        </div>
    );
}
