"use client";

import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "./provider";
import { Oswald, Geist } from 'next/font/google';
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});


//import type { Metadata } from 'next';

const oswald = Oswald({ 
  variable: '--font-oswald',
  subsets: ['latin'],
  //weight: ['300', '400', '600', '700'],
});

// export const metadata: Metadata = {
//   title: 'Swiftab | Restaurant Management',
//   description: 'Streamline your restaurant operations and maximize covers.',
// };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className={`${oswald.variable} antialiased`}>
        <Toaster />
        <Providers>{children}</Providers>
        
      </body>
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </html>
  );
}