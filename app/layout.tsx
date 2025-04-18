import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { SWRConfig } from "swr";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ArthaLens - AI-Powered Financial Research",
    template: "%s | ArthaLens",
  },
  description:
    "AI-powered financial research platform for earnings call analysis, document chat, and risk factor analysis",
  keywords: [
    "financial research",
    "AI analysis",
    "earnings calls",
    "risk analysis",
    "financial documents",
  ],
  authors: [{ name: "ArthaLens Team" }],
  // viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
};

export function generateViewport(): Viewport {
  return {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SWRConfig>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <NuqsAdapter>{children}</NuqsAdapter>
          </ThemeProvider>
        </SWRConfig>
      </body>
    </html>
  );
}
