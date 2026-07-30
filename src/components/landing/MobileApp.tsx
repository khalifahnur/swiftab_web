"use client"
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

export default function MobileApp() {
  return (
    <section className="py-24 md:py-32 bg-teal/5 overflow-hidden relative" id="mobile">
      <div className="container-custom">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-8">
          <div className="w-full lg:w-1/2 max-w-[600px] text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-[clamp(2.5rem,5vw,4rem)] text-ink font-medium leading-[1.1] tracking-tight mb-6">
  Your favorite table, <br className="hidden lg:block"/> just a tap away.
</h2>
<p className="text-lg md:text-xl leading-relaxed font-light text-ink-faint mb-10">
  Swiftab Mobile puts the ultimate dining experience in your pocket. Book reservations, browse live menus, and place your orders effortlessly from anywhere. Available on Android.
</p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                {/* <button onClick={() => alert("Redirecting to App Store...")} className="flex items-center justify-center sm:justify-start gap-3 bg-ink text-white w-full sm:w-auto px-6 py-3 rounded-xl hover:bg-ink-soft transition-colors shadow-md hover:shadow-lg">
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05 1.9-3.17 1.9-1.1 0-2.07-.63-3.13-.63-1.07 0-1.93.63-3.13.63-1.12 0-2.25-.97-3.23-1.95-2.1-2.1-4.08-6.07-4.08-9.52 0-4.07 2.45-6.2 4.7-6.2 1.15 0 2.2.73 3.1.73 1.02 0 2.1-.8 3.3-.8 1.4 0 2.63.53 3.55 1.55-3.07 1.83-2.55 6.13.43 7.37-.73 1.93-1.72 3.8-2.35 4.92zm-3.8-17.78c.67-.83 1.12-1.92 1.12-3-.95.05-2.1.6-2.82 1.37-.6.65-1.13 1.77-1.13 2.87.97.12 2.17-.42 2.83-1.24z"/>
                  </svg>
                  <div className="flex flex-col items-start text-left">
                    <span className="text-[10px] uppercase tracking-wider opacity-80 leading-none mb-1">Download on the</span>
                    <span className="text-[15px] font-medium leading-none">App Store</span>
                  </div>
                </button> */}
                
                <Link 
      href="https://play.google.com/store/apps/details?id=com.lifkha.swiftabapps"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center sm:justify-start gap-3 bg-ink text-white w-full sm:w-auto px-6 py-3 rounded-xl hover:bg-ink-soft transition-colors shadow-md hover:shadow-lg"
    >
      {/* Fixed: Updated viewBox to match the internal 512x512 path coordinates */}
      <svg 
        className="w-7 h-7" 
        xmlns="http://w3.org"  
        viewBox="0 0 512 512" 
        fill="currentColor"
      >
        <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 11.5 24 31.1 24 55.4v401.1c0 24.3 10 43.9 23 55.4L271.5 256 47 0zm412 211.1c17.5 10 27 26.6 27 44.9s-9.5 34.9-27 44.9L391.1 343l-60.1-60.1 61.3-61.2 66.7 39.4zM325.3 277.7l60.1 60.1L104.6 499l220.7-221.3z"/>
      </svg>
      <div className="flex flex-col items-start text-left">
        <span className="text-[10px] uppercase tracking-wider opacity-80 leading-none mb-1">GET IT ON</span>
        <span className="text-[15px] font-medium leading-none">Google Play</span>
      </div>
    </Link>
              </div>
            </motion.div>
          </div>
          
          <div className="w-full lg:w-1/2 flex justify-center mt-12 lg:mt-0">
            <div className="relative w-full max-w-90 aspect-9/19  ">
              <Image
                src="/swiftab/mockup.png" 
                alt="Swiftab Mobile Dashboard" 
                fill
                className="w-full h-full object-cover"
                priority
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
