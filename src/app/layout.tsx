import type { Metadata, Viewport } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "./provider";
import { Big_Shoulders, Fraunces, IBM_Plex_Mono } from "next/font/google";


export const viewport: Viewport = {
  themeColor: "#0F172A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, 
};

export const metadata: Metadata = {
  title: {
    default: "Swiftab | Restaurant Management Ecosystem",
    template: "%s | Swiftab",
  },
  description:
    "Master your floor plan, streamline live orders, and equip your waitstaff with high-performance POS tools.",
  keywords: [
    "restaurant management",
    "table reservations",
    "waiter pos",
    "floor plan software",
    "restaurant dashboard",
  ],
  authors: [{ name: "Swiftab Systems" }],
  openGraph: {
    type: "website",
    locale: "en_KE",
    url: "https://swiftab.co.ke",
    title: "Swiftab | Master your restaurant floor.",
    description: "The complete ecosystem for high-volume table and order management.",
    siteName: "Swiftab",
  },
  twitter: {
    card: "summary_large_image",
    title: "Swiftab | Restaurant Management Ecosystem",
    description: "Master your floor plan and streamline live orders.",
  },
};

const displayFont = Big_Shoulders({
  subsets: ["latin"],
  weight: ["700", "900"],
  variable: "--font-display",
  display: "swap",
});

const bodyFont = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-body",
  display: "swap",
});

const monoFont = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable}  antialiased`} >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}