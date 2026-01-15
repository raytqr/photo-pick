"use client";

import { ChevronDown } from 'lucide-react';
import { getPlaceholderImage } from '@/lib/gdrive-utils';

interface PortfolioHeroProps {
    title: string;
    subtitle: string;
    imageUrl: string | null;
    photographerName: string;
}

export default function PortfolioHero({ title, subtitle, imageUrl, photographerName }: PortfolioHeroProps) {
    const scrollToPortfolio = () => {
        const element = document.getElementById('portfolio');
        if (element) element.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <section id="hero" className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-black">
            <div className="absolute inset-0 z-0">
                <img src={imageUrl || getPlaceholderImage('hero')} alt="Hero Background" className="w-full h-full object-cover opacity-40 grayscale" onError={(e) => { (e.target as HTMLImageElement).src = getPlaceholderImage('hero'); }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/80" />
            </div>
            <div className="relative z-10 flex flex-col items-center text-center px-4">
                <div className="relative">
                    <h1 className="font-bold text-5xl md:text-7xl lg:text-8xl tracking-tighter text-white leading-none uppercase">{title}</h1>
                    <span className="text-3xl md:text-5xl text-white/80 absolute -bottom-4 right-0 md:-right-8 italic drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">{photographerName}</span>
                </div>
                <p className="mt-16 text-neutral-400 text-sm md:text-base tracking-[0.2em] uppercase">{subtitle}</p>
                <div className="mt-16">
                    <button onClick={scrollToPortfolio} className="group relative px-8 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-medium hover:bg-white hover:text-black transition-all duration-300 flex items-center gap-2">
                        Explore Portfolio <ChevronDown size={16} className="group-hover:translate-y-1 transition-transform" />
                    </button>
                </div>
            </div>
        </section>
    );
}
