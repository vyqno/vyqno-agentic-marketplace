import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import BackgroundEffects from "@/components/layout/BackgroundEffects";
import LoadingScreen from "@/components/layout/LoadingScreen";
import { Providers } from "@/components/Providers";
import SmoothScroll from "@/components/SmoothScroll";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AgentNet | Immersive AI Marketplace",
  description: "Browse, create, and interact with high-performance AI agents.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} ${spaceGrotesk.variable} antialiased selection:bg-accent/40`}
      >
        <Providers>
          <SmoothScroll>
            <LoadingScreen />
            <BackgroundEffects />
            <Header />
            <main className="relative z-10 min-h-screen">
              {children}
            </main>
          </SmoothScroll>
        </Providers>
      </body>
    </html>
  );
}

