"use client";

import { SignUpForm } from "@/components/auth/SignUpForm";
import Image from "next/image";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export default function Page() {
  return (
    <>
      <Navbar />     
      <main className="pt-20 bg-[#F8F9FA]">
        <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 md:py-16 displayfont">
          <div className="w-full max-w-[1150px] bg-white rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-slate-200">
            
            <div className="relative w-full md:w-[45%] h-54 md:h-auto min-h-[400px] flex flex-col justify-between p-8 md:p-10">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1600')" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/60 to-slate-900/20" />
              <div className="absolute inset-0 bg-teal-900/20 mix-blend-overlay" />
              
              <div className="relative z-10 flex items-start justify-between w-full">
                <Image
                  src="/assets/logo/logo2.png"
                  alt="Swiftab"
                  width={120}
                  height={40}
                  className="h-8 w-auto object-contain brightness-0 invert" 
                />
              </div>
              
              <div className="relative z-10">
                <h1 className="text-3xl md:text-4xl font-semibold text-white leading-[1.15] mb-6 max-w-sm tracking-tight">
                  Optimizing Operations,<br />Elevating Hospitality.
                </h1>
                <div className="flex gap-2.5 items-center">
                  <div className="w-8 h-1 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                  <div className="w-2 h-1 bg-white/30 rounded-full" />
                  <div className="w-2 h-1 bg-white/30 rounded-full" />
                </div>
              </div>
            </div>
            <div className="w-full md:w-[55%] p-8 md:p-14 lg:p-16 flex items-center justify-center bg-white relative">
              <SignUpForm />
            </div>
          </div>
        </div> 
      </main>
      <Footer />
    </>
  );
}