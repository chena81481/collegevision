import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/layout/Footer";
import { CommandPalette } from "@/components/crm/CommandPalette";
import { AnalyticsProvider } from "./providers";
import LeadPopup from "@/components/LeadPopup";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CollegeVision | Right Online Degree. Without the bias.",
  description: "Find and compare 100% verified UGC-DEB online and distance degrees in India.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CollegeVision",
  },
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen flex flex-col`}
      >
        <AnalyticsProvider>
          <div className="flex-1">
            {children}
          </div>
          <LeadPopup />
          <CommandPalette />
          <Footer />
        </AnalyticsProvider>
      </body>
    </html>
  );
}
