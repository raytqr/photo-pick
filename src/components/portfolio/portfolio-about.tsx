"use client";

import { Camera, PenTool, Video } from 'lucide-react';
import { getPlaceholderImage } from '@/lib/gdrive-utils';

interface PortfolioAboutProps {
    title: string;
    body: string | null;
    imageUrl: string | null;
    photographerName: string;
}

export default function PortfolioAbout({ title, body, imageUrl, photographerName }: PortfolioAboutProps) {
    const titleWords = title?.split(' ') || ['ABOUT', 'ME'];
    const mainTitle = titleWords.slice(0, -1).join(' ');
    const lastWord = titleWords.slice(-1)[0];

    return (
        <section id="about" className="relative py-24 md:py-32 px-6 bg-neutral-950 overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
                    <div className="order-1 space-y-8">
                        <div>
                            <span className="text-neutral-500 tracking-widest uppercase text-sm mb-2 block">Who I Am</span>
                            <h2 className="text-5xl md:text-7xl font-bold leading-[0.9]">
                                <span className="block text-white mb-2">{mainTitle}</span>
                                <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white to-white/10">{lastWord}</span>
                            </h2>
                        </div>
                        <div className="p-8 bg-white/5 rounded-3xl backdrop-blur-sm border border-white/5">
                            <p className="text-neutral-300 leading-relaxed text-lg font-light whitespace-pre-line">{body || `Hi, I'm ${photographerName}. I specialize in capturing beautiful moments.`}</p>
                        </div>
                        <div className="flex flex-wrap gap-4">
                            {[{ icon: Camera, label: 'Photography' }, { icon: PenTool, label: 'Editing' }, { icon: Video, label: 'Videography' }].map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm text-neutral-300"><item.icon size={16} /><span className="uppercase tracking-wide">{item.label}</span></div>
                            ))}
                        </div>
                    </div>
                    <div className="relative order-2">
                        <div className="relative aspect-[4/5] w-full max-w-md mx-auto">
                            <div className="absolute inset-0 bg-white/5 rounded-3xl rotate-6 blur-lg transform scale-95" />
                            <img src={imageUrl || getPlaceholderImage('about')} alt={photographerName} className="relative z-10 w-full h-full object-cover rounded-3xl grayscale hover:grayscale-0 transition-all duration-700 shadow-2xl" onError={(e) => { (e.target as HTMLImageElement).src = getPlaceholderImage('about'); }} />
                            <div className="absolute -bottom-6 -right-6 z-20 bg-white text-black p-6 rounded-3xl shadow-xl hidden md:block"><p className="font-bold text-3xl">✨</p><p className="text-xs uppercase tracking-wider font-semibold">Capturing Moments</p></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
