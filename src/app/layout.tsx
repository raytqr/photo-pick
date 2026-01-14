import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://satsetpic.com"),
  title: {
    default: "SatSetPic — Photo Selection Made Fast",
    template: "%s | SatSetPic",
  },
  description:
    "The fastest way for photographers to share and select photos. Let clients swipe to choose their favorites. SatSet, done.",
  keywords: [
    "photo selection",
    "photographer tool",
    "client gallery",
    "photo proofing",
    "swipe photos",
    "SatSetPic",
    "Google Drive sync",
  ],
  authors: [{ name: "SatSetPic Team" }],
  icons: {
    icon: [
      { url: "/logo.png", type: "image/png", sizes: "512x512" },
      { url: "/favicon.png", type: "image/png", sizes: "48x48" },
    ],
    shortcut: "/favicon.png",
    apple: [
      { url: "/logo.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "icon",
        url: "/logo.png",
        sizes: "192x192",
      },
    ],
  },
  verification: {
    google: "r5BGQwN18XHamZGMtxtnglQGvAOUI7GBUQCzc47-QZY",
  },
  openGraph: {
    title: "SatSetPic — Photo Selection Made Fast",
    description:
      "The fastest way for photographers to share and select photos. Let clients swipe to choose their favorites.",
    url: "https://satsetpic.com",
    siteName: "SatSetPic",
    images: [
      {
        url: "/hero-mockup.png",
        width: 1200,
        height: 630,
        alt: "SatSetPic - Photo Selection App",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SatSetPic — Photo Selection Made Fast",
    description:
      "The fastest way for photographers to share and select photos. Let clients swipe to choose their favorites.",
    images: ["/hero-mockup.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // JSON-LD Structured Data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://satsetpic.com/#organization",
        "name": "SatSetPic",
        "url": "https://satsetpic.com",
        "logo": {
          "@type": "ImageObject",
          "url": "https://satsetpic.com/logo.png",
          "width": 512,
          "height": 512
        },
        "sameAs": [
          "https://instagram.com/ray_tqr",
          "https://www.linkedin.com/in/rayhanwt/"
        ],
        "contactPoint": {
          "@type": "ContactPoint",
          "email": "satsetpic@gmail.com",
          "contactType": "customer service"
        }
      },
      {
        "@type": "WebApplication",
        "@id": "https://satsetpic.com/#webapp",
        "name": "SatSetPic",
        "description": "The fastest way for photographers to share and select photos. Let clients swipe to choose their favorites.",
        "url": "https://satsetpic.com",
        "applicationCategory": "PhotographyApplication",
        "operatingSystem": "Web Browser",
        "offers": {
          "@type": "AggregateOffer",
          "lowPrice": "30000",
          "highPrice": "300000",
          "priceCurrency": "IDR",
          "offerCount": "4"
        },
        "featureList": [
          "Swipe-based photo selection",
          "Google Drive sync",
          "WhatsApp instant report",
          "Custom branding",
          "Lightroom integration"
        ],
        "screenshot": "https://satsetpic.com/hero-mockup.png"
      },
      {
        "@type": "WebSite",
        "@id": "https://satsetpic.com/#website",
        "url": "https://satsetpic.com",
        "name": "SatSetPic",
        "description": "Photo Selection Made Fast",
        "publisher": {
          "@id": "https://satsetpic.com/#organization"
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://satsetpic.com/?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      }
    ]
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${outfit.className} antialiased bg-gray-50 dark:bg-gray-950`}>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
