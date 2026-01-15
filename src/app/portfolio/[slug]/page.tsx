import { Metadata } from 'next';
import { getPublicPortfolioData } from '@/actions/portfolio';
import { notFound } from 'next/navigation';
import PortfolioPageClient from './client';

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const data = await getPublicPortfolioData(slug);

    if (!data) return { title: 'Portfolio Not Found' };

    const { portfolio } = data;
    return {
        title: `${portfolio.photographer_name} | Portfolio`,
        description: portfolio.tagline || `Portfolio of ${portfolio.photographer_name}`,
        openGraph: {
            title: `${portfolio.photographer_name} | Portfolio`,
            description: portfolio.tagline || `Portfolio of ${portfolio.photographer_name}`,
            images: portfolio.hero_image_url ? [portfolio.hero_image_url] : [],
        },
        twitter: {
            card: 'summary_large_image',
            title: `${portfolio.photographer_name} | Portfolio`,
            description: portfolio.tagline || `Portfolio of ${portfolio.photographer_name}`,
        }
    };
}

export default async function PortfolioPage({ params }: Props) {
    const { slug } = await params;
    const data = await getPublicPortfolioData(slug);

    if (!data) notFound();

    return <PortfolioPageClient data={data} />;
}
