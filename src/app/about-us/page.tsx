import AboutUs from '@/components/landing/AboutUs'
import Footer from '@/components/landing/Footer'
import Navbar from '@/components/landing/Navbar'
import ReactLenis from 'lenis/react'
import React from 'react'

export default function page() {
  return (
    <ReactLenis root>
      <div className="font-body text-ink antialiased bg-ink min-h-screen relative selection:bg-teal selection:text-white">
        <Navbar />
        <div className="relative z-10 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
          <main>
            <AboutUs />
          </main>
        </div>
        <div className="fixed bottom-0 left-0 w-full h-225 md:h-162.5 lg:h-150 z-0">
          <Footer />
        </div>
      </div>
    </ReactLenis>
  )
}
