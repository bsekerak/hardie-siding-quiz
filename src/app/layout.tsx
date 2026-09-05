import type { Metadata, Viewport } from "next";
import { QuizProvider } from "@/context/QuizContext";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { SiteFooter } from "@/components/ui/SiteFooter";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Siding Journey Guide & Product Selector | James Hardie",
    template: "%s | James Hardie Siding Journey Guide",
  },
  description:
    "Answer 14 questions and get an engineered James Hardie specification: Hardie® Zone product line, profile, texture, ColorPlus® palette, transparent cost range and the exact questions to ask your contractor.",
  keywords: [
    "James Hardie siding",
    "fiber cement siding",
    "ColorPlus Technology",
    "HardiePlank",
    "siding cost estimate",
    "HZ5 HZ10",
  ],
  openGraph: {
    title: "James Hardie Siding Journey Guide & Product Selector",
    description:
      "Get an engineered siding specification, a climate-matched product line, three curated ColorPlus® palettes and a transparent cost range.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#16382C",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-stone-100">
        <QuizProvider>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </QuizProvider>
      </body>
    </html>
  );
}
