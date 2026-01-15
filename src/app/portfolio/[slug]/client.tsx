"use client";

import { useMemo } from 'react';
import PortfolioNavbar from '@/components/portfolio/portfolio-navbar';
import PortfolioHero from '@/components/portfolio/portfolio-hero';
import PortfolioAbout from '@/components/portfolio/portfolio-about';
import PortfolioGallery from '@/components/portfolio/portfolio-gallery';
import PortfolioPricingSection from '@/components/portfolio/portfolio-pricing';
import PortfolioContact from '@/components/portfolio/portfolio-contact';
import type { Portfolio, PortfolioSection, PortfolioItem, PortfolioPricing } from '@/actions/portfolio';

interface PortfolioData {
    portfolio: Portfolio;
    sections: PortfolioSection[];
    items: PortfolioItem[];
    pricing: PortfolioPricing[];
}

export default function PortfolioPageClient({ data }: { data: PortfolioData }) {
    const { portfolio, sections, items, pricing } = data;

    const sortedSections = useMemo(() => [...sections].sort((a, b) => a.display_order - b.display_order), [sections]);
    const sectionMap = useMemo(() => new Map(sections.map(s => [s.section_key, s])), [sections]);

    const handleContact = () => {
        if (portfolio.contact_method === 'whatsapp' && portfolio.whatsapp_number) {
            const msg = encodeURIComponent(`Hello ${portfolio.photographer_name}, I would like to book a session!`);
            window.open(`https://wa.me/${portfolio.whatsapp_number}?text=${msg}`, '_blank');
        } else if (portfolio.contact_method === 'instagram' && portfolio.instagram_handle) {
            window.open(`https://instagram.com/${portfolio.instagram_handle}`, '_blank');
        } else if (portfolio.contact_method === 'email' && portfolio.email) {
            window.open(`mailto:${portfolio.email}`, '_blank');
        }
    };

    const renderSection = (section: PortfolioSection) => {
        if (!section.is_visible) return null;
        switch (section.section_key) {
            case 'hero':
                return <PortfolioHero key="hero" title={portfolio.hero_title} subtitle={portfolio.hero_subtitle} imageUrl={portfolio.hero_image_url} photographerName={portfolio.photographer_name} />;
            case 'about':
                return <PortfolioAbout key="about" title={portfolio.about_title} body={portfolio.about_body} imageUrl={portfolio.about_image_url} photographerName={portfolio.photographer_name} />;
            case 'portfolio':
                return <PortfolioGallery key="portfolio" items={items} customTitle={section.custom_title} />;
            case 'pricing':
                return <PortfolioPricingSection key="pricing" packages={pricing} customTitle={section.custom_title} onContactClick={handleContact} />;
            case 'contact':
                return <PortfolioContact key="contact" photographerName={portfolio.photographer_name} whatsappNumber={portfolio.whatsapp_number} instagramHandle={portfolio.instagram_handle} email={portfolio.email} contactMethod={portfolio.contact_method} contactButtonText={portfolio.contact_button_text} customTitle={section.custom_title} />;
            default:
                return null;
        }
    };

    return (
        <main className="bg-black min-h-screen text-white selection:bg-purple-500/30">
            <PortfolioNavbar photographerName={portfolio.photographer_name} sections={sections} contactButtonText={portfolio.contact_button_text} onContactClick={handleContact} />
            {sortedSections.map(section => renderSection(section))}
        </main>
    );
}
