import type { Metadata } from "next";
import { Geist_Mono, Space_Grotesk } from "next/font/google";

import "./globals.css";
import { AppChrome } from "@/components/layout/app-chrome";
import { AuthProvider } from "@/lib/auth-context";
import { SettingsProvider } from "@/components/settings/settings-provider";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { VisitTracker } from "@/components/visit-tracker";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: {
    default:
      "Arcitype — Next-Gen Mechanical Typing Test & Performance Insights",
    template: "%s | Arcitype",
  },
  description: siteConfig.description,
  keywords: [
    "typing test",
    "free typing test",
    "typing speed test",
    "online typing test",
    "wpm test",
    "words per minute test",
    "typing practice",
    "typing trainer",
    "typing speed",
    "check typing speed",
    "type test",
    "keyboard test",
    "mechanical keyboard sounds",
    "keyboard sound test",
    "typing sound",
    "monkeytype alternative",
    "Arcitype",
  ],
  authors: [{ name: siteConfig.creator, url: siteConfig.creatorUrl }],
  creator: siteConfig.creator,
  publisher: siteConfig.creator,
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title:
      "Arcitype — Next-Gen Mechanical Typing Test & Performance Insights",
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: "/og.jpeg",
        width: 1500,
        height: 1016,
        alt: "Arcitype — typing test with mechanical keyboard sound engine, virtual heatmap keyboard, and AI performance diagnostics",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Arcitype — Pro Mechanical Typing Test & Trainer",
    description:
      "A satisfying pro typing test with customizable mechanical sound profiles, live key heatmap, ghost racing, and AI analytics.",
    images: ["/og.jpeg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "technology",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: siteConfig.name,
  url: siteConfig.url,
  description: siteConfig.description,
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  author: {
    "@type": "Person",
    name: siteConfig.creator,
    url: siteConfig.creatorUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        spaceGrotesk.variable
      )}
      lang="en"
      suppressHydrationWarning
    >
      {/* Blocking script: apply saved accent before first paint to prevent flash */}
      <head>
        <link
          as="fetch"
          crossOrigin="anonymous"
          href="/sounds/sound.ogg"
          rel="preload"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var a=localStorage.getItem("tc-accent");document.documentElement.setAttribute("data-accent",a||"royal")}catch(e){}})()`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          type="application/ld+json"
        />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider>
            <SettingsProvider>
              <VisitTracker />
              <AppChrome>{children}</AppChrome>
            </SettingsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
