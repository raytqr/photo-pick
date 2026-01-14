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
      { url: "/logo.png", type: "image/png" },
      { url: "/favicon.ico", type: "image/x-icon" },
    ],
    shortcut: "/logo.png",
    apple: "/logo.png",
    other: {
      rel: "icon",
      url: "/logo.png",
    },
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
  return (
    <html lang="en">
      <body className={`${outfit.className} antialiased bg-gray-50 dark:bg-gray-950`}>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
