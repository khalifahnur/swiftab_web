import FeaturePageLayout from '@/components/landing/features/FeatureLayout'
import { floorServersContent } from '@/components/landing/features/FloorServer'
import Footer from '@/components/landing/Footer'
import Navbar from '@/components/landing/Navbar'
import ReactLenis from 'lenis/react'
import { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: "Floor Servers — Swiftab",
  description:
    "Put the terminal in the apron. Handheld ordering, intelligent upsell prompts, and pay-at-the-table checkout for every server on the floor.",
};

export default function page() {
  return (
    <ReactLenis root>
      <div className="font-body text-ink antialiased bg-ink min-h-screen relative selection:bg-teal selection:text-white">
        <Navbar />
        <div className="relative z-10 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.3)] ">
          <main>
            <FeaturePageLayout content={floorServersContent} />
          </main>
        </div>
        {/* <div className="fixed bottom-0 left-0 w-full h-225 md:h-162.5 lg:h-150 z-0"> */}
          <Footer />
        {/* </div> */}
      </div>
    </ReactLenis>
  )
}
