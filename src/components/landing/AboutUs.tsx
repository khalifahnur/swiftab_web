"use client";

import { motion } from "motion/react";

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-[#F0F2F5] text-stone-950 md:pt-20 overflow-hidden pt-16 rounded-b-[2rem] md:rounded-b-[3rem] mb-[900px] md:mb-[650px] lg:mb-[600px]">
      <section className="relative px-6 py-16 max-w-[1200px] mx-auto min-h-[70vh] flex items-center">
        <div className="absolute left-[-10%] md:left-[20%] top-0 bottom-0 flex items-center pointer-events-none select-none overflow-hidden opacity-30 md:opacity-100">
          <span className="text-[25vw] md:text-[12rem] font-black text-stone-200/50 -rotate-90 tracking-widest origin-center">
            ABOUT
          </span>
        </div>

        <div className="relative z-10 w-full grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 text-center md:text-left"
          >
            <h1 className="text-5xl md:text-[6rem] font-bold tracking-tight">
              About
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="flex justify-center md:justify-end w-full overflow-hidden"
          >
            <div
              className="text-[16vw] md:text-[8rem] lg:text-[10rem] font-black leading-none tracking-tighter"
              style={{
                backgroundImage:
                  "url(https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1600)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                color: "transparent",
              }}
            >
              SWIFTAB
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- INTELLIGENT HOSPITALITY SECTION --- */}
      <section className="relative px-6 py-20 md:py-32 max-w-[1200px] mx-auto">
        <div className="absolute left-0 bottom-0 pointer-events-none select-none px-6 md:px-0">
          <div className="text-[12vw] md:text-[5rem] font-black text-stone-200/50 leading-none tracking-widest">
            INTELLIGENT
            <br />
            HOSPITALITY
          </div>
        </div>

        <div className="relative z-10 grid md:grid-cols-2 gap-16 md:gap-24 items-center">
          <div className="grid grid-cols-2 gap-4 md:gap-6 relative mt-8 md:mt-0">
            <div className="space-y-4 md:space-y-6 pt-8 md:pt-12">
              <motion.img
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80&w=800"
                alt="Elegant restaurant interior"
                className="w-full aspect-[4/5] object-cover rounded-[1.5rem] md:rounded-[2rem] shadow-xl"
              />
              <motion.img
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                src="https://images.unsplash.com/photo-1581349485608-9469926a8e5e?auto=format&fit=crop&q=80&w=800"
                alt="Culinary precision in the kitchen"
                className="w-full aspect-square object-cover rounded-[1.5rem] md:rounded-[2rem] shadow-xl -mb-8 md:-mb-16"
              />
            </div>
            <div className="space-y-4 md:space-y-6">
              <motion.img
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=800"
                alt="Staff using modern POS system"
                className="w-full aspect-square object-cover rounded-[1.5rem] md:rounded-[2rem] shadow-xl"
              />
              <motion.img
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=800"
                alt="Fine dining table setting"
                className="w-full aspect-[4/5] object-cover rounded-[1.5rem] md:rounded-[2rem] shadow-xl relative z-10"
              />
            </div>
            <div className="absolute -top-6 -left-6 md:-top-12 md:-left-12 w-32 h-32 md:w-64 md:h-64 border border-stone-300 rounded-full pointer-events-none" />
            <div className="absolute -bottom-8 -right-6 md:-bottom-16 md:-right-12 w-40 h-40 md:w-80 md:h-80 border border-stone-300 rounded-full pointer-events-none" />
          </div>

          <div className="max-w-md md:ml-auto">
            <h2 className="text-3xl font-bold mb-6 md:mb-8">Elevating Hospitality</h2>
            <p className="text-[13px] text-stone-600 leading-relaxed font-medium">
              At Swiftab, we believe in the power of seamless service,
              intelligent design, and exceptional hospitality. Our mission is
              simple: to empower restaurants and create a frictionless dining
              experience. Whether it's providing real-time floor intelligence,
              synchronizing operations, or eliminating wait times, we are
              committed to transforming the industry—one perfect table at a
              time.
            </p>
          </div>
        </div>
      </section>
      <section className="px-6 py-20 md:py-32 max-w-[1200px] mx-auto overflow-hidden">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 mb-16 md:mb-24 relative">
          <div className="max-w-sm">
            <h2 className="text-3xl font-bold mb-6 md:mb-8 leading-tight">
              The Secret to
              <br />
              Flawless Service
            </h2>
            <div className="space-y-6 text-[13px] text-stone-600 leading-relaxed font-medium">
              <p>
                At Swiftab, we believe that exceptional service, no matter how
                brief, has the power to elevate an entire dining experience.
                True hospitality is more than just a transaction—it's an art
                form, a dedication to anticipating needs before they even arise.
              </p>
              <p>
                By partnering with Swiftab, you're not just upgrading your
                software—you're empowering your staff, streamlining your
                operations, and building a more profitable future. Together, we
                can turn intelligent technology into seamless service and make a
                lasting impact on every guest who walks through your doors.
              </p>
            </div>
          </div>

          <div className="flex justify-start md:justify-end items-start relative opacity-5 pointer-events-none select-none">
            <div className="text-[12vw] md:text-[6rem] font-black leading-none tracking-tighter whitespace-nowrap">
              FLAWLESS SERVICE
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <motion.img
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&q=80&w=800"
            alt="Chef plating a dish with precision"
            className="w-full h-64 md:h-72 object-cover rounded-[1.5rem] md:rounded-[2rem] shadow-md md:col-span-1"
          />
          <div className="md:col-span-2 space-y-6 md:pl-12">
            <motion.img
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              src="https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&q=80&w=1200"
              alt="Elegant restaurant dining room"
              className="w-full h-64 object-cover rounded-[1.5rem] md:rounded-[2rem] shadow-md"
            />
            {/* This image is hidden on mobile entirely by the 'hidden md:block' classes, which is perfect for preventing layout breaks */}
            <motion.img
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              src="https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&q=80&w=800"
              alt="Premium restaurant table setting"
              className="w-64 h-64 object-cover rounded-[2rem] shadow-md -ml-12 relative z-10 hidden md:block"
            />
          </div>
        </div>
      </section>
      <section className="px-6 py-20 max-w-[1200px] mx-auto text-center">
        <h2 className="text-3xl font-bold mb-8 md:mb-10">
          Flawless Service, Infinite Possibilities
        </h2>
        <div className="max-w-2xl mx-auto space-y-4 text-[13px] text-stone-600 leading-relaxed mb-16 md:mb-20 font-medium">
          <p>At Swiftab, we believe that exceptional hospitality should know no limits.</p>
          <p>
            Every restaurant has a unique vision—whether it's fine dining, a bustling bistro, or a modern cafe. When your front-of-house and kitchen teams sync perfectly, you unlock endless possibilities to elevate the guest experience.
          </p>
          <p>
            No matter your size or style, every second saved counts.
            <br />
            Together, we can create a dining environment where seamless operations meet unforgettable moments.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="w-full h-[300px] md:h-[450px] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-2xl"
        >
          <img
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1600"
            alt="Bustling premium restaurant floor"
            className="w-full h-full object-cover"
          />
        </motion.div>
      </section>
      
    </div>
  );
}