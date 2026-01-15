"use client";

import { useState } from 'react';
import { Check, Star, ArrowRight } from 'lucide-react';
import type { PortfolioPricing } from '@/actions/portfolio';

interface PortfolioPricingProps {
    packages: PortfolioPricing[];
    customTitle?: string | null;
    onContactClick: () => void;
}

export default function PortfolioPricingSection({ packages, customTitle, onContactClick }: PortfolioPricingProps) {
    const rawCategories = Array.from(new Set(packages.map(p => p.category)));
    const regularCats = rawCategories.filter(c => c !== 'Other' && c !== 'Others').sort();
    const categories = ['All', ...regularCats];
    if (rawCategories.includes('Others')) categories.push('Others');
    if (rawCategories.includes('Other')) categories.push('Other');

    const [activeCategory, setActiveCategory] = useState('All');
    const filteredPackages = activeCategory === 'All' ? packages : packages.filter(p => p.category === activeCategory);

    if (packages.length === 0) return null;

    return (
        <section id="pricing" className="py-24 px-4 md:px-8 bg-neutral-950">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-5xl md:text-7xl font-bold text-white uppercase tracking-tight">{customTitle || 'PRICING'}</h2>
                    <p className="text-neutral-500 text-lg mt-4">Choose the perfect package for your needs</p>
                </div>
                {categories.length > 2 && (
                    <div className="flex flex-wrap justify-center gap-3 mb-12">
                        {categories.map((cat) => (
                            <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-6 py-2 rounded-full text-sm font-medium tracking-wide transition-all duration-300 ${activeCategory === cat ? 'bg-white text-black scale-105' : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800 border border-neutral-800'}`}>{cat}</button>
                        ))}
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredPackages.map((pkg, index) => (
                        <div key={pkg.id} className={`relative p-8 rounded-3xl border transition-all duration-500 group ${pkg.is_recommended ? 'bg-gradient-to-b from-white/10 to-transparent border-white/30 scale-105' : 'bg-white/5 border-white/10 hover:border-white/30'}`}>
                            {pkg.is_recommended && <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-white text-black text-xs font-bold rounded-full flex items-center gap-1.5 shadow-lg"><Star size={12} fill="currentColor" /> RECOMMENDED</div>}
                            <div className="mb-6"><span className="text-purple-400 text-xs font-semibold uppercase tracking-widest">{pkg.category}</span><h3 className="text-2xl font-bold text-white mt-2">{pkg.name}</h3>{pkg.subtitle && <p className="text-neutral-400 text-sm mt-1">{pkg.subtitle}</p>}</div>
                            <div className="mb-8"><div className="flex items-baseline gap-2"><span className="text-4xl font-black text-white">{pkg.price}</span>{pkg.original_price && <span className="text-neutral-500 line-through text-lg">{pkg.original_price}</span>}</div></div>
                            {pkg.features.length > 0 && <ul className="space-y-3 mb-8">{pkg.features.map((feature, i) => <li key={i} className="flex items-start gap-3 text-neutral-300"><Check size={18} className="text-green-400 flex-shrink-0 mt-0.5" /><span className="text-sm">{feature}</span></li>)}</ul>}
                            <button onClick={onContactClick} className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all duration-300 ${pkg.is_recommended ? 'bg-white text-black hover:bg-neutral-200' : 'bg-white/10 text-white border border-white/20 hover:bg-white hover:text-black'}`}>Choose Package<ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
