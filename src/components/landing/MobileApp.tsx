"use client"
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

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
                Take the floor <br className="hidden lg:block"/> with you.
              </h2>
              <p className="text-lg md:text-xl leading-relaxed font-light text-ink-faint mb-10">
                Swiftab Mobile puts the entire restaurant in your pocket. Manage waitlists, approve comp requests, and monitor live sales from anywhere. Available on iOS and Android.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button onClick={() => alert("Redirecting to App Store...")} className="flex items-center justify-center sm:justify-start gap-3 bg-ink text-white w-full sm:w-auto px-6 py-3 rounded-xl hover:bg-ink-soft transition-colors shadow-md hover:shadow-lg">
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05 1.9-3.17 1.9-1.1 0-2.07-.63-3.13-.63-1.07 0-1.93.63-3.13.63-1.12 0-2.25-.97-3.23-1.95-2.1-2.1-4.08-6.07-4.08-9.52 0-4.07 2.45-6.2 4.7-6.2 1.15 0 2.2.73 3.1.73 1.02 0 2.1-.8 3.3-.8 1.4 0 2.63.53 3.55 1.55-3.07 1.83-2.55 6.13.43 7.37-.73 1.93-1.72 3.8-2.35 4.92zm-3.8-17.78c.67-.83 1.12-1.92 1.12-3-.95.05-2.1.6-2.82 1.37-.6.65-1.13 1.77-1.13 2.87.97.12 2.17-.42 2.83-1.24z"/>
                  </svg>
                  <div className="flex flex-col items-start text-left">
                    <span className="text-[10px] uppercase tracking-wider opacity-80 leading-none mb-1">Download on the</span>
                    <span className="text-[15px] font-medium leading-none">App Store</span>
                  </div>
                </button>
                
                <button onClick={() => alert("Redirecting to Google Play...")} className="flex items-center justify-center sm:justify-start gap-3 bg-ink text-white w-full sm:w-auto px-6 py-3 rounded-xl hover:bg-ink-soft transition-colors shadow-md hover:shadow-lg">
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.13 2.058c-.372.355-.589.873-.589 1.503v16.878c0 .63.217 1.148.589 1.503l.063.053 9.47-9.47v-.123L3.193 2.005l-.063.053zm10.093 10.09l3.15-3.15L5.753 2.915c-.495-.282-1.042-.23-1.46.11l12.03 12.03-3.102-2.907zm-7.618 8.828c.418.34 1.015.39 1.51-.107l10.57-6.07-3.057-3.058-9.023 9.235zM17.18 9.87l2.87 1.637c.82.467.82 1.233 0 1.703l-2.87 1.638-3.32-3.32 3.32-3.32z" />
                  </svg>
                  <div className="flex flex-col items-start text-left">
                    <span className="text-[10px] uppercase tracking-wider opacity-80 leading-none mb-1">GET IT ON</span>
                    <span className="text-[15px] font-medium leading-none">Google Play</span>
                  </div>
                </button>
              </div>
            </motion.div>
          </div>
          
          <div className="w-full lg:w-1/2 flex justify-center relative">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-teal/20 rounded-full blur-[80px]"></div>
             
             <motion.div
               initial={{ opacity: 0, y: 40 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true, margin: "-100px" }}
               transition={{ duration: 0.7 }}
               className="relative w-[280px] md:w-[320px] h-[580px] md:h-[650px] bg-ink rounded-[3rem] md:rounded-[3.5rem] border-[8px] md:border-[12px] border-ink shadow-2xl flex-shrink-0"
             >
                <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-20">
                   <div className="w-24 h-6 bg-ink rounded-b-2xl"></div>
                </div>
                
                <div className="relative w-full h-full bg-white rounded-[2.2rem] md:rounded-[2.7rem] overflow-hidden">
                  <Image
                    src="/swiftab/image0.jpeg" 
                    alt="Mobile dashboard" 
                    fill
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent"></div>
                  

                </div>
             </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
