"use client"
import { motion, AnimatePresence } from 'motion/react';

export default function Hero() {
  return (
    <section className="bg-paper-dim pt-32 md:pt-40 pb-10 md:pb-20 overflow-hidden relative" id="hero"> 
      <svg width="0" height="0" className="absolute pointer-events-none">
        <defs>
          <clipPath id="modernSaaSShape" clipPathUnits="objectBoundingBox">
            <path d="M 0.064,0 
                     L 0.6,0 
                     C 0.821,0, 1,0.224, 1,0.5 
                     L 1,0.92 
                     C 1,0.964, 0.971,1, 0.936,1 
                     L 0.4,1 
                     C 0.179,1, 0,0.776, 0,0.5 
                     L 0,0.08 
                     C 0,0.036, 0.029,0, 0.064,0 
                     Z" />
          </clipPath>
        </defs>
      </svg>

      <div className="container-custom relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center">
        <div className="flex flex-col items-start max-lg:items-center max-lg:text-center max-w-150 mx-auto lg:mx-0">          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[clamp(2.5rem,6vw,4.5rem)] displayfont font-display font-medium leading-[1.05] tracking-tight text-ink mb-6"
          >
            Run your restaurant, <span className="italic text-teal/80">smart and seamless.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-[clamp(1.125rem,2vw,1.25rem)] bodyfont text-ink-faint leading-relaxed mb-10 max-lg:max-w-125"
          >
            The world's best restaurants use Swiftab to power table management, handle reservations & live orders, and grow revenue across all services.
          </motion.p>
        </div>
        
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }} 
            className="relative w-full aspect-[5/4] max-w-212.5 mx-auto mt-10 lg:mt-0 flex flex-col items-center justify-center group"
          >
            {/* Soft, glowing backdrop tailored to match your dynamic shape scale */}
            <div className="absolute inset-0 bg-teal/15 rounded-[3rem] blur-[60px] transform group-hover:scale-105 transition-transform duration-1000 opacity-90 pointer-events-none"></div>
            
            {/* 
              The Video Wrapper. 
              Replaced mask styles with the modern inline hardware-accelerated clipPath.
            */}
            <div 
              className="relative w-full h-full z-10 p-2"
              style={{ clipPath: 'url(#modernSaaSShape)' }}
            >
              <div className="w-full h-full relative overflow-hidden bg-white">
                <AnimatePresence mode="wait">
                  <motion.div
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="absolute inset-0 flex items-center justify-center bg-white"
                  >
                      <video
                        src={'/swiftab/videos/dashboard-video.mp4'}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover object-top"
                      />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
            
            {/* Subtle retro dot pattern anchor positioned cleanly behind the shape */}
            <div className="absolute -z-10 -right-4 -bottom-4 w-48 h-48 opacity-30 bg-[radial-gradient(circle,rgba(0,128,128,0.3)_1.5px,transparent_1.5px)] bg-[length:16px_16px]"></div>
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
