"use client";

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

interface PortfolioNavbarProps {
    photographerName: string;
    sections: { section_key: string; is_visible: boolean }[];
    contactButtonText: string;
    onContactClick: () => void;
}

const SECTION_LABELS: Record<string, string> = { hero: "Home", about: "About", portfolio: "Portfolio", pricing: "Pricing", contact: "Contact" };

export default function PortfolioNavbar({ photographerName, sections, contactButtonText, onContactClick }: PortfolioNavbarProps) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (e: React.MouseEvent, sectionKey: string) => {
        e.preventDefault();
        const element = document.getElementById(sectionKey);
        if (element) { element.scrollIntoView({ behavior: 'smooth' }); setMobileOpen(false); }
    };

    const visibleSections = sections.filter(s => s.is_visible && s.section_key !== 'contact');

    return (
        <>
            <nav className={`fixed top-0 left-0 right-0 z-50 flex justify-center p-4 transition-all duration-300 ${isScrolled ? 'pt-4' : 'pt-6'}`}>
                <div className="relative flex items-center justify-between px-6 py-3 backdrop-blur-xl bg-white/5 border border-white/10 rounded-full w-[90%] md:w-auto transition-all duration-500">
                    <div className="flex items-center justify-between w-full md:w-auto md:mr-12">
                        <a href="#hero" onClick={(e) => scrollToSection(e, 'hero')} className="font-bold text-white tracking-wide">{photographerName}</a>
                        <button className="md:hidden text-white p-1" onClick={() => setMobileOpen(true)}><Menu size={24} /></button>
                    </div>
                    <ul className="hidden md:flex items-center gap-8">
                        {visibleSections.map((section) => (
                            <li key={section.section_key}><a href={`#${section.section_key}`} onClick={(e) => scrollToSection(e, section.section_key)} className="text-sm font-medium text-neutral-400 hover:text-white transition-colors duration-300 uppercase tracking-wider cursor-pointer">{SECTION_LABELS[section.section_key] || section.section_key}</a></li>
                        ))}
                        <li><button onClick={onContactClick} className="bg-white text-black px-5 py-2 rounded-full text-sm font-bold hover:bg-neutral-200 transition-colors">{contactButtonText}</button></li>
                    </ul>
                </div>
            </nav>
            {mobileOpen && (
                <>
                    <div onClick={() => setMobileOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden" />
                    <div className="fixed top-0 right-0 h-full w-[75%] max-w-[300px] bg-black/90 backdrop-blur-2xl border-l border-white/10 z-[70] p-6 flex flex-col md:hidden">
                        <div className="flex justify-end mb-8"><button onClick={() => setMobileOpen(false)} className="text-white p-2 hover:bg-white/10 rounded-full"><X size={28} /></button></div>
                        <ul className="flex flex-col gap-6">
                            {visibleSections.map((section) => (
                                <li key={section.section_key}><a href={`#${section.section_key}`} onClick={(e) => scrollToSection(e, section.section_key)} className="text-2xl font-bold text-neutral-300 hover:text-white hover:pl-2 transition-all block">{SECTION_LABELS[section.section_key] || section.section_key}</a></li>
                            ))}
                        </ul>
                        <div className="mt-auto"><button onClick={() => { onContactClick(); setMobileOpen(false); }} className="w-full bg-white text-black px-6 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-neutral-200 transition-colors">{contactButtonText}</button></div>
                    </div>
                </>
            )}
        </>
    );
}
