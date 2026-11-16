import FeaturePageLayout from '@/components/landing/features/FeatureLayout'
import { hostStandContent } from '@/components/landing/features/HostStand'
import Footer from '@/components/landing/Footer'
import Navbar from '@/components/landing/Navbar'
import ReactLenis from 'lenis/react'
import { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: "Host Stand — Swiftab",
  description:
    "Digitise the arrival-to-seating workflow. Stop losing covers at the door with a live waitlist, two-way SMS, and predictive floor pacing.",
};


export default function page() {
  return (
    <ReactLenis root>
      <div className="font-body text-ink antialiased bg-ink min-h-screen relative selection:bg-teal selection:text-white">
        <Navbar />
        <div className="relative z-10 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
          <main>
            <FeaturePageLayout content={hostStandContent} />
          </main>
        </div>
        
          <Footer />
        
      </div>
    </ReactLenis>
  )
}
