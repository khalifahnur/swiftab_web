"use client";

import CTA from "@/components/landing/Cta";
import Features from "@/components/landing/Features";
import Footer from "@/components/landing/Footer";
import Hero from "@/components/landing/Hero";
import MobileApp from "@/components/landing/MobileApp";
import Navbar from "@/components/landing/Navbar";
import Showcase from "@/components/landing/Showcase";
import Testimonials from "@/components/landing/Testimonial";
import { ReactLenis } from 'lenis/react';


export default function Home() {
  return (
    <ReactLenis root>
      <div className="font-body text-ink antialiased bg-ink min-h-screen relative selection:bg-teal selection:text-white">
        <Navbar />
        <div className="relative z-10 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-b-[2rem] md:rounded-b-[3rem] mb-225 md:mb-162.5 lg:mb-150">
          <main>
            <Hero />
            <Features />
            <Showcase />
            <MobileApp />
            <Testimonials />
          </main>
          <div className="rounded-b-[2rem] md:rounded-b-[3rem] overflow-hidden">
            <CTA />
          </div>
        </div>
        <div className="fixed bottom-0 left-0 w-full h-225 md:h-162.5 lg:h-150 z-0">
          <Footer />
        </div>
      </div>
    </ReactLenis>
  );
}