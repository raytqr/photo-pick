"use client";

import { useState } from 'react';
import { X, ZoomIn, ArrowDown } from 'lucide-react';
import { getPlaceholderImage } from '@/lib/gdrive-utils';
import type { PortfolioItem } from '@/actions/portfolio';

interface PortfolioGalleryProps {
    items: PortfolioItem[];
    customTitle?: string | null;
}

export default function PortfolioGallery({ items, customTitle }: PortfolioGalleryProps) {
    const [activeCategory, setActiveCategory] = useState('All');
    const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
    const [showAll, setShowAll] = useState(false);

    const rawCategories = Array.from(new Set(items.map(item => item.category)));
    const regularCats = rawCategories.filter(c => c !== 'Other' && c !== 'Others').sort();
    const categories = ['All', ...regularCats];
    if (rawCategories.includes('Others')) categories.push('Others');
    if (rawCategories.includes('Other')) categories.push('Other');

    const filteredItems = activeCategory === 'All' ? items : items.filter(item => item.category === activeCategory);
    const INITIAL_LIMIT = 9;
    const displayItems = showAll ? filteredItems : filteredItems.slice(0, INITIAL_LIMIT);

    return (
        <section id="portfolio" className="py-24 bg-black min-h-screen px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-5xl md:text-7xl font-bold text-white uppercase tracking-tight">{customTitle || 'SELECTED WORKS'}</h2>
                    <p className="text-neutral-500 text-xl italic">A collection of moments frozen in time</p>
                </div>
                {categories.length > 1 && (
                    <div className="flex flex-wrap justify-center gap-3 mb-12">
                        {categories.map((cat) => (
                            <button key={cat} onClick={() => { setActiveCategory(cat); setShowAll(false); }} className={`px-6 py-2 rounded-full text-sm font-medium tracking-wide transition-all duration-300 ${activeCategory === cat ? 'bg-white text-black scale-105' : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800 border border-neutral-800'}`}>{cat}</button>
                        ))}
                    </div>
                )}
                <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                    {displayItems.map((item) => (
                        <div key={item.id} className="break-inside-avoid relative group cursor-pointer overflow-hidden rounded-2xl" onClick={() => setSelectedItem(item)}>
                            <img src={item.image_url} alt={item.title} className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110" onError={(e) => { (e.target as HTMLImageElement).src = getPlaceholderImage('gallery'); }} />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4">
                                <span className="text-neutral-300 text-xs uppercase tracking-widest mb-2">{item.category}</span>
                                <h3 className="text-white font-bold text-xl text-center">{item.title}</h3>
                                <ZoomIn className="text-white mt-4 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-100" />
                            </div>
                        </div>
                    ))}
                </div>
                {!showAll && filteredItems.length > INITIAL_LIMIT && (
                    <div className="flex justify-center mt-12"><button onClick={() => setShowAll(true)} className="group flex items-center gap-2 px-8 py-3 rounded-full border border-white/20 text-white font-medium hover:bg-white hover:text-black transition-all duration-300">See All Works<ArrowDown size={16} className="group-hover:translate-y-1 transition-transform" /></button></div>
                )}
                {items.length === 0 && <div className="text-center py-20"><p className="text-neutral-500 text-lg">No portfolio items yet</p></div>}
            </div>
            {selectedItem && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4" onClick={() => setSelectedItem(null)}>
                    <button className="fixed top-6 right-6 z-[110] bg-white/10 p-2 rounded-full text-white hover:bg-white hover:text-black transition-all duration-300" onClick={(e) => { e.stopPropagation(); setSelectedItem(null); }}><X size={32} /></button>
                    <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
                        <img src={selectedItem.image_url} alt={selectedItem.title} className="w-auto h-auto max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl" />
                        <div className="mt-6 text-center"><h3 className="text-white text-2xl font-bold">{selectedItem.title}</h3><p className="text-purple-400 italic mt-1">{selectedItem.category}</p></div>
                    </div>
                </div>
            )}
        </section>
    );
}
