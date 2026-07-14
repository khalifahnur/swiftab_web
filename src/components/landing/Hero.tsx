"use client"
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {  LayoutDashboard } from 'lucide-react';

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = [
    { name: 'Dashboard', src: '/dashboard.png' },
    { name: 'Reservations', src: '/reservations.png' },
    { name: 'Orders', src: '/orders.png' },
    { name: 'Manage Menu', src: '/menu.png' },
    { name: 'Floor Plan', src: '/floor-plan.png' }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.style.display = 'none';
    e.currentTarget.nextElementSibling?.classList.remove('hidden');
    e.currentTarget.nextElementSibling?.classList.add('flex');
  };



  return (
    <section className="bg-paper-dim pt-32 md:pt-40 pb-20 md:pb-32 overflow-hidden relative" id="hero">
      <div className="absolute top-[20%] left-[-5%] w-[300px] md:w-[500px] h-[300px] bg-teal/15 rounded-full blur-[90px] rotate-[32deg] pointer-events-none"></div>
      <div className="absolute top-[10%] right-[10%] w-[300px] md:w-[400px] h-[250px] bg-[#5A73F2]/10 rounded-full blur-[80px] rotate-[31deg] pointer-events-none"></div>
      
      <div className="container-custom relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center">
        <div className="flex flex-col items-start max-lg:items-center max-lg:text-center max-w-[600px] mx-auto lg:mx-0">          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[clamp(2.5rem,6vw,4.5rem)] font-display font-medium leading-[1.05] tracking-tight text-ink mb-6"
          >
            Run your restaurant, <span className="italic text-teal/80">smart and seamless.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-[clamp(1.125rem,2vw,1.25rem)] text-ink-faint leading-relaxed mb-10 max-lg:max-w-[500px]"
          >
            The world's best restaurants use Swiftab to power table management, handle reservations & live orders, and grow revenue across all services.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full justify-start max-lg:justify-center"
          >
            <form 
              className="relative w-full max-w-[360px] flex border border-line-strong bg-white rounded-[100px] shadow-[0px_6px_16px_0px_rgba(0,128,128,0.08)] p-1.5 pl-5"
              onSubmit={(e) => {
                e.preventDefault();
                document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <input 
                type="email" 
                placeholder="Your email address..." 
                className="flex-grow w-full min-w-0 bg-transparent border-none outline-none text-ink placeholder:text-ink-faint/60 text-[15px]"
              />
              <button type="submit" className="shrink-0 bg-teal text-white px-6 py-3 rounded-[40px] text-[15px] font-medium hover:bg-teal-deep transition-all duration-300 shadow-sm whitespace-nowrap">
                Start for free
              </button>
            </form>
            <a href="#cta" className="text-teal font-medium flex items-center gap-1 hover:text-teal-deep transition-colors group px-4 whitespace-nowrap mt-4 sm:mt-0">
              Talk to sales
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 7 10" className="w-[7px] h-[10px] mt-0.5 group-hover:translate-x-0.5 transition-transform" aria-hidden="true"><path fill="currentColor" d="m0 9.501 6.998-3.844V4.343L0 .499V2.21L5.08 5 0 7.79z"></path></svg>
            </a>
          </motion.div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="relative w-full aspect-[16/9] max-w-[750px] mx-auto mt-10 lg:mt-0"
        >
          <div className="absolute inset-0 bg-ink rounded-[1.5rem] md:rounded-[2rem] shadow-2xl overflow-hidden border-[6px] md:border-[10px] border-ink flex flex-col">
            <div className="flex-1 w-full h-full bg-paper overflow-hidden flex relative rounded-[0.75rem] md:rounded-[1.25rem]">
               <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-ink rounded-full z-20"></div>
              
               <div className="w-full h-full relative bg-white">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentSlide}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0 flex items-center justify-center bg-white"
                    >
                      <img 
                        src={slides[currentSlide].src}
                        alt={`Gourmet ${slides[currentSlide].name}`}
                        className="w-full h-full object-cover object-top"
                        onError={handleImageError}
                      />
                      
                      {/* Fallback if image not found */}
                      <div className="hidden absolute inset-0 flex-col items-center justify-center p-6 text-center bg-paper-dim border-2 border-dashed border-line rounded-lg m-4">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                          <LayoutDashboard className="w-6 h-6 text-teal" />
                        </div>
                        <h4 className="text-sm font-semibold text-ink mb-1">{slides[currentSlide].name} Preview</h4>
                        <p className="text-[10px] md:text-xs text-ink-faint">
                          Please upload <span className="font-mono text-ink bg-line px-1 rounded">{slides[currentSlide].src}</span> to the public folder.
                        </p>
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10 bg-ink/80 backdrop-blur-md px-3 py-1.5 rounded-full">
                    {slides.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${currentSlide === idx ? 'w-4 bg-white' : 'bg-white/40 hover:bg-white/70'}`}
                        aria-label={`Go to slide ${idx + 1}`}
                      />
                    ))}
                  </div>
               </div>
            </div>
            
            <div className="h-2 md:h-3 bg-ink w-full relative z-20">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 md:w-24 h-1 bg-white/20 rounded-b-md"></div>
            </div>
          </div>
          
          <div className="absolute -z-10 -right-6 -bottom-6 w-32 h-32 bg-[radial-gradient(circle,rgba(0,128,128,0.2)_2px,transparent_2px)] bg-[length:12px_12px]"></div>
        </motion.div>
      </div>
      
      <div className="container-custom relative z-10 mt-20 md:mt-32">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="w-full"
        >
          <h2 className="text-[14px] md:text-[15px] font-medium text-ink-faint mb-8 text-center tracking-wide">Trusted by over 38,000 restaurants globally</h2>
          <div className="flex flex-wrap justify-center items-center gap-x-8 md:gap-x-16 gap-y-8 opacity-40 grayscale">
             <div className="text-xl md:text-2xl font-bold font-display tracking-tight">OSTERIA</div>
             <div className="text-xl md:text-2xl font-bold font-display tracking-tight">LUMEN</div>
             <div className="text-xl md:text-2xl font-bold font-display tracking-tight">NOMAD</div>
             <div className="text-xl md:text-2xl font-bold font-display tracking-tight">GUSTO</div>
             <div className="text-xl md:text-2xl font-bold font-display tracking-tight">ELEVEN</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
