"use client"
import { motion } from 'motion/react';

export default function Showcase() {
  return (
    <section className="py-24 md:py-32 bg-paper-dim overflow-hidden relative" id="platform">
      <div className="container-custom">
        <div className="max-w-[800px] mx-auto text-center mb-16 md:mb-20 px-4">
          <h2 className="text-[clamp(2.5rem,5vw,3.5rem)] text-ink font-medium leading-[1.1] tracking-tight mb-5 md:mb-6">
            Tools for flawless service
          </h2>
          <p className="text-lg md:text-xl leading-relaxed font-light text-ink-faint">
            A suite of turn-key solutions for monetizing and growing your restaurant's operational efficiency.
          </p>
        </div>
        
        <div className="relative max-w-[1000px] mx-auto">
          <div className="absolute top-10 bottom-10 left-1/2 -translate-x-[0.5px] w-[1px] bg-line hidden md:block"></div>
          
          <div className="flex flex-col gap-16 md:gap-24 relative z-10">
            {/* Step 1 */}
            <div className="flex items-center max-md:flex-col gap-8 md:gap-12 group">
              <div className="w-full md:w-1/2 md:pr-16 md:text-right relative text-center md:text-right">
                {/* Number circle for mobile */}
                <div className="md:hidden w-10 h-10 rounded-full bg-white border border-line shadow-sm flex items-center justify-center font-medium text-ink mb-6 mx-auto">1</div>
                
                <motion.h3 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  className="text-2xl md:text-3xl font-medium tracking-tight text-ink mb-3 md:mb-4"
                >
                  Easily manage floor plans
                </motion.h3>
                <motion.p 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: 0.1 }}
                  className="text-base md:text-lg font-light text-ink-faint leading-relaxed"
                >
                  Our drag-and-drop editor empowers everyone on your team to build, test, and deploy the perfect floor layout right from the dashboard.
                </motion.p>
              </div>
              
              {/* Center number */}
              <div className="absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white border border-line shadow-[0_2px_10px_rgba(0,0,0,0.05)] hidden md:flex items-center justify-center font-medium text-ink z-10">
                1
              </div>
              
              <div className="w-full md:w-1/2 md:pl-16 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] md:w-[300px] h-[250px] md:h-[300px] bg-teal/10 rounded-full blur-[60px] pointer-events-none"></div>
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  className="relative bg-white border border-line rounded-2xl shadow-xl overflow-hidden aspect-[4/3]"
                >
                  <div className="absolute inset-0 bg-ink/[0.02] flex items-center justify-center p-6 md:p-8">
                     {/* Mock UI */}
                     <div className="w-full h-full bg-white rounded border border-line shadow-sm flex flex-col p-4">
                       <div className="w-full h-8 bg-paper-dim rounded mb-4"></div>
                       <div className="flex-1 grid grid-cols-3 gap-2">
                         <div className="bg-teal/20 rounded border border-teal/30"></div>
                         <div className="bg-paper-dim rounded border border-line"></div>
                         <div className="bg-paper-dim rounded border border-line"></div>
                       </div>
                     </div>
                  </div>
                </motion.div>
              </div>
            </div>
            
            {/* Step 2 */}
            <div className="flex items-center max-md:flex-col-reverse gap-8 md:gap-12 group md:flex-row-reverse">
              <div className="w-full md:w-1/2 md:pl-16 relative text-center md:text-left">
                 {/* Number circle for mobile */}
                 <div className="md:hidden w-10 h-10 rounded-full bg-white border border-line shadow-sm flex items-center justify-center font-medium text-ink mb-6 mt-10 mx-auto">2</div>
                 
                <motion.h3 
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  className="text-2xl md:text-3xl font-medium tracking-tight text-ink mb-3 md:mb-4"
                >
                  Optimize for every service
                </motion.h3>
                <motion.p 
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: 0.1 }}
                  className="text-base md:text-lg font-light text-ink-faint leading-relaxed"
                >
                  Tailor how you seat your guests. Target your floor, pricing, and table combinations by shift segments and event type.
                </motion.p>
              </div>
              
              {/* Center number */}
              <div className="absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white border border-line shadow-[0_2px_10px_rgba(0,0,0,0.05)] hidden md:flex items-center justify-center font-medium text-ink z-10">
                2
              </div>
              
              <div className="w-full md:w-1/2 md:pr-16 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] md:w-[300px] h-[250px] md:h-[300px] bg-[#F25A5A]/10 rounded-full blur-[60px] pointer-events-none"></div>
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  className="relative bg-white border border-line rounded-2xl shadow-xl overflow-hidden aspect-[4/3]"
                >
                  <div className="absolute inset-0 bg-ink/[0.02] flex items-center justify-center p-6 md:p-8">
                     <div className="w-full h-full flex gap-4">
                       <div className="w-1/3 bg-white rounded border border-line shadow-sm"></div>
                       <div className="flex-1 bg-white rounded border border-line shadow-sm"></div>
                     </div>
                  </div>
                </motion.div>
              </div>
            </div>
            
            {/* Step 3 */}
            <div className="flex items-center max-md:flex-col gap-8 md:gap-12 group">
              <div className="w-full md:w-1/2 md:pr-16 md:text-right relative text-center md:text-right">
                 {/* Number circle for mobile */}
                 <div className="md:hidden w-10 h-10 rounded-full bg-white border border-line shadow-sm flex items-center justify-center font-medium text-ink mb-6 mt-10 mx-auto">3</div>
                 
                <motion.h3 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  className="text-2xl md:text-3xl font-medium tracking-tight text-ink mb-3 md:mb-4"
                >
                  Maximize table turns
                </motion.h3>
                <motion.p 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: 0.1 }}
                  className="text-base md:text-lg font-light text-ink-faint leading-relaxed"
                >
                  Learn what drives flow with real-time tracking and full-funnel analytics. Know exactly where the bottlenecks are.
                </motion.p>
              </div>
              
              {/* Center number */}
              <div className="absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white border border-line shadow-[0_2px_10px_rgba(0,0,0,0.05)] hidden md:flex items-center justify-center font-medium text-ink z-10">
                3
              </div>
              
              <div className="w-full md:w-1/2 md:pl-16 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] md:w-[300px] h-[250px] md:h-[300px] bg-[#5A73F2]/10 rounded-full blur-[60px] pointer-events-none"></div>
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  className="relative bg-white border border-line rounded-2xl shadow-xl overflow-hidden aspect-[4/3]"
                >
                  <div className="absolute inset-0 bg-ink/[0.02] flex items-center justify-center p-6 md:p-8">
                     <div className="w-full h-full flex flex-col gap-4">
                       <div className="flex-1 bg-white rounded border border-line shadow-sm"></div>
                       <div className="h-1/3 bg-white rounded border border-line shadow-sm"></div>
                     </div>
                  </div>
                </motion.div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </section>
  );
}
