import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Footer } from "@/components/layout/Footer";
import { CommandPalette } from "@/components/crm/CommandPalette";
import { AnalyticsProvider } from "./providers";
import GlobalSchema from "@/components/seo/GlobalSchema";

const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const siteUrl =
  configuredSiteUrl && !configuredSiteUrl.includes("localhost")
    ? configuredSiteUrl
    : "https://collegevision.in";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "CollegeVision: Compare 100+ Online Universities, Fees, ROI and UGC-DEB Approved Degrees",
    template: "%s | CollegeVision",
  },
  description:
    "Compare online MBA, MCA, BBA, BCA and other UGC-DEB approved degrees in India. Explore fees, placements, ROI, EMI options and verified university details on CollegeVision.",
  applicationName: "CollegeVision",
  category: "education",
  keywords: [
    "online university comparison",
    "online MBA India",
    "UGC DEB approved universities",
    "distance education India",
    "online degree ROI",
    "online colleges India",
    "compare online universities",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "CollegeVision",
    title: "CollegeVision: Compare 100+ Online Universities, Fees, ROI and UGC-DEB Approved Degrees",
    description:
      "Find the right online degree with verified university data, ROI analysis, fee transparency and EMI-aware comparisons.",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "CollegeVision: Compare 100+ Online Universities, Fees, ROI and UGC-DEB Approved Degrees",
    description:
      "Compare verified online degree options in India with fees, approvals, placements and ROI insights.",
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
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CollegeVision",
  },
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.png",
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
      <body className="antialiased bg-background text-foreground min-h-screen flex flex-col">
        <AnalyticsProvider>
          <GlobalSchema />
          <div className="flex-1">
            {children}
          </div>
          <CommandPalette />
          <Footer />
        </AnalyticsProvider>
      </body>
    </html>
  );
}
