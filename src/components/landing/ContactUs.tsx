"use client";

import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';

const faqs = [
  { 
    question: "What types of restaurants is Swiftab built for?", 
    answer: "Swiftab is designed for restaurants that prioritize the art of service—ranging from bustling bistros to fine dining establishments looking to streamline operations and elevate the guest experience." 
  },
  { 
    question: "Can Swiftab manage both reservations and walk-ins?", 
    answer: "Yes, our real-time floor intelligence synchronizes reservations, waitlists, and live walk-ins on a single, intuitive dashboard to maximize table occupancy." 
  },
  { 
    question: "How long does it take to get my restaurant set up?", 
    answer: "Setup is fast and seamless. Most restaurants are fully configured and their staff trained within 24 to 48 hours, with zero disruption to daily service." 
  },
  { 
    question: "How does Swiftab speed up the billing process?", 
    answer: "Swiftab enables transparent, live bill tracking and seamless tableside payments. This eliminates the traditional back-and-forth, meaning guests never have to wait for the check." 
  },
  { 
    question: "Does Swiftab require proprietary hardware?", 
    answer: "No, Swiftab is a flexible, cloud-based platform that works seamlessly on standard modern iOS and Android tablets, as well as desktop browsers." 
  },
  { 
    question: "Do you offer customer support during service hours?", 
    answer: "Absolutely. We provide 24/7 priority support to ensure your front-of-house and kitchen teams always have the reliable backing they need during busy services." 
  }
];

export default function Contact() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-white text-stone-950 pt-20  selection:bg-stone-200 overflow-hidden font-sans rounded-b-[2rem] md:rounded-b-[3rem] mb-[900px] md:mb-[650px] lg:mb-[600px]">
      <section className="px-6 py-12 max-w-[1400px] mx-auto">
        <div className="relative rounded-[2rem] overflow-hidden bg-[#2D333A] text-white min-h-[650px] flex flex-col lg:flex-row shadow-sm">
          <div className="absolute inset-0">
             <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1600" className="w-full h-full object-cover opacity-60" alt="Resort" />
             <div className="absolute inset-0 bg-gradient-to-r from-[#2D333A]/90 via-[#2D333A]/70 to-transparent"></div>
          </div>
          
          <div className="relative z-10 flex-1 p-12 lg:p-20 flex flex-col justify-between">
           <div>
              <h1 className="text-4xl md:text-[3.5rem] font-bold mb-6 tracking-tight leading-[1.1] max-w-xl">
                Ready to Elevate<br/>Your Service?
              </h1>
              <p className="text-stone-300 max-w-sm leading-relaxed text-sm">
                Discover a platform thoughtfully designed to eliminate friction and streamline your operations. Reach out to our team to see how Swiftab can transform your dining experience.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 text-sm text-stone-300">
              <div className="col-span-2 md:col-span-1">
                <h3 className="text-white font-semibold mb-3">Location</h3>
                <p>Anantara Oceanfront Resort</p>
                <p>123 Serenity Bay Road</p>
                <p className="mt-4 text-stone-400">Monday - Sunday | 08:00 - 22:00</p>
                <p className="text-stone-400">(local time)</p>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-3">Social Media</h3>
                <ul className="space-y-1.5">
                  <li>Instagram</li>
                  <li>LinkedIn</li>
                  <li>Facebook</li>
                  <li>Tiktok</li>
                </ul>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-3">Email</h3>
                <p>support@swiftab.co.ke</p>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-3">Contact</h3>
                <p>+254 702 071 515</p>
              </div>
            </div>
          </div>
          
          <div className="relative z-10 w-full lg:w-[550px] p-6 lg:p-12 shrink-0 flex items-center justify-center">
             <div className="bg-white text-stone-950 rounded-[2rem] p-10 w-full shadow-2xl">
                <h2 className="text-2xl font-bold mb-2">Tell Us What You Need</h2>
                <p className="text-stone-500 text-sm mb-8">Our team is ready to assist you with every detail, big or small.</p>
                
                <form className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="First Name" className="w-full px-5 py-3.5 rounded-full border border-stone-200 text-sm outline-none focus:border-stone-400 transition-colors" />
                    <input type="text" placeholder="Last Name" className="w-full px-5 py-3.5 rounded-full border border-stone-200 text-sm outline-none focus:border-stone-400 transition-colors" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="Country" className="w-full px-5 py-3.5 rounded-full border border-stone-200 text-sm outline-none focus:border-stone-400 transition-colors" />
                    <input type="text" placeholder="Phone Number" className="w-full px-5 py-3.5 rounded-full border border-stone-200 text-sm outline-none focus:border-stone-400 transition-colors" />
                  </div>
                  <input type="email" placeholder="Email Address" className="w-full px-5 py-3.5 rounded-full border border-stone-200 text-sm outline-none focus:border-stone-400 transition-colors" /> 
                  <textarea 
                    placeholder="Message" 
                    rows={4}
                    className="w-full px-5 py-4 rounded-3xl border border-stone-200 text-sm outline-none focus:border-stone-400 transition-colors resize-none mt-2"
                  ></textarea>
                  
                  <label className="flex items-start gap-3 pt-2 cursor-pointer">
                    <input type="checkbox" className="mt-0.5 w-4 h-4 rounded border-stone-300 text-stone-950 focus:ring-stone-950" />
                    <span className="text-xs text-stone-500 leading-relaxed">I'd like to receive exclusive offers and updates</span>
                  </label>
                  
                  <button type="submit" className="w-full py-4 mt-6 border border-stone-200 text-stone-950 font-semibold rounded-full hover:bg-stone-950 hover:text-white transition-colors">
                    Submit
                  </button>
                </form>
             </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-24 max-w-[1200px] mx-auto mb-20">
        <div className="flex flex-col md:flex-row gap-16 lg:gap-32">
          <div className="md:w-[35%] shrink-0">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 leading-tight">Frequently Asked<br/>Questions</h2>
            <p className="text-stone-500 text-sm leading-relaxed max-w-xs">Contact us if you still have any questions to make your experience smoother.</p>
          </div>
          
          <div className="md:w-[65%]">
            <div className="divide-y divide-stone-200 border-t border-stone-200">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div key={idx} className="py-6">
                    <button 
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between text-left group gap-6"
                    >
                      <div className="flex gap-8 items-center">
                        <span className="text-sm font-semibold text-stone-400 w-6">{(idx + 1).toString().padStart(2, '0')}</span>
                        <span className="font-bold text-lg group-hover:text-stone-600 transition-colors pr-8">{faq.question}</span>
                      </div>
                      <span className="text-stone-400 group-hover:text-stone-950 transition-colors shrink-0 border border-stone-200 rounded-full p-1 bg-white">
                        {isOpen ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                      </span>
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <p className="pt-6 pl-14 text-[15px] text-stone-500 leading-relaxed max-w-xl">
                            {faq.answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
