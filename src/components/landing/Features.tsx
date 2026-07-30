"use client"
import { motion } from 'motion/react';

const featuresData = [
  {
    title: "Host Stand",
    desc: "End walk-in bleed and maximize daily cover counts. Automate SMS waitlists and instantly pace the dining floor to eliminate the chaos of manual host stand calculations.",
    route: "/features/host-stand",
    cta: "Review Host Analytics",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    ),
    image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=800",
    blob: "bg-[#C1C9F6]"
  },
  {
    title: "Kitchen Line",
    desc: "Crush ticket times and eliminate line bottlenecks. Route KDS tickets with precision to stop misfires between expo and the line during a Friday night rush.",
    route: "/features/kitchen-line",
    cta: "Analyze Line Metrics",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
    ),
    image: "https://images.unsplash.com/photo-1578474846511-04ba529f0b88?auto=format&fit=crop&q=80&w=800",
    blob: "bg-[#F7D4D4]"
  },
  {
   title: "Floor Servers",
    desc: "Drive higher table turn-rates and inflate average check sizes. Equip staff with handheld billing and instant upsell prompts to turn tables faster while driving bigger tip percentages.",
    route: "/features/floor-servers",
    cta: "Inspect Server Tools",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
    ),
    image: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&q=80&w=800",
    blob: "bg-[#C1F6E0]"
  },
  {
    title: "Management",
    desc: "Plug shift margin leaks and optimize weekly labor percentages. Execute real-time food cost auditing and track labor variances by the hour before they destroy your profit margins.",
    route: "/features/management",
    cta: "Audit Admin Controls",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
    ),
    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=800",
    blob: "bg-[#F7E7D4]"
  }
];

export default function Features() {
  return (
    <section className="relative py-24 md:py-32 bg-white overflow-hidden" id="features">
      <div className="container-custom">
        <div className="text-center max-w-175 mx-auto mb-16 md:mb-24 px-4">
          <h2 className="text-[clamp(2.5rem,5vw,4rem)] text-ink font-medium leading-[1.1] tracking-tight mb-6">
            Solutions for every station
          </h2>
          <p className="text-lg md:text-xl leading-relaxed font-light text-ink-faint">
            Make reliable cross-platform data and easy-to-use service tools accessible to your entire restaurant.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 md:gap-8">
          {featuresData.map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
              className="group relative h-115 md:h-105 rounded-2xl p-px overflow-hidden"
            >
              <div className={`absolute -top-32 -left-32 w-87.5 h-87.5 rounded-full blur-[80px] opacity-[0.4] pointer-events-none ${feature.blob}`}></div>
              
              <div className="relative h-full w-full rounded-2xl bg-white border border-line flex flex-col bg-opacity-80 backdrop-blur-sm overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="h-[45%] w-full relative overflow-hidden shrink-0">
                  <img src={feature.image} alt={feature.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent"></div>
                 
                </div>
                <div className="p-6 md:p-8 flex flex-col flex-1">
                  <h3 className="text-xl md:text-2xl font-medium tracking-tight text-ink mb-3">{feature.title}</h3>
                 <p className="text-ink-faint font-light text-[15px] leading-relaxed mb-auto line-clamp-2 md:line-clamp-3">
  {feature.desc}
</p>

                  
                  <a href={feature.route} target='_blank' className="inline-flex items-center text-[14px] font-medium text-teal hover:text-teal-deep transition-colors mt-6">
                    Learn More
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 7 10" className="w-1.75 h-2.5 ml-1.5 mt-px group-hover:translate-x-1 transition-transform" aria-hidden="true"><path fill="currentColor" d="m0 9.501 6.998-3.844V4.343L0 .499V2.21L5.08 5 0 7.79z"></path></svg>
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
