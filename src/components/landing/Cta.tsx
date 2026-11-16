"use client"
export default function CTA() {
  return (
    <section className="relative overflow-hidden text-center py-40 px-8 bg-white text-ink max-sm:py-24 max-sm:px-5" id="cta">
      <div className="absolute inset-0 z-0 pointer-events-none">
         <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-teal/5 blur-[100px]"></div>
         <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[50%] rounded-full bg-[#5A73F2]/5 blur-[100px]"></div>
      </div>
      
      <h2 className="relative z-10 font-display font-medium text-[clamp(2.5rem,4vw,3.5rem)] leading-tight max-w-[800px] mx-auto mb-6 tracking-tight">
        Ready to take control?
      </h2>
      <p className="relative z-10 text-lg text-ink-faint max-w-xl mx-auto mb-10 font-light">
        Our entire suite of tools comes standard. Set up your floor plan in under ten minutes and experience flawless service tonight.
      </p>
      
      <div className="relative z-10 flex items-center justify-center gap-6 flex-wrap">
        <button onClick={() => alert("Thank you for your interest! We will contact you shortly.")} className="px-8 py-4 bg-teal text-white rounded-[40px] text-base font-medium hover:bg-teal-deep transition-colors duration-300 shadow-[0_4px_14px_rgba(0,128,128,0.2)]">
          Start for free
        </button>
        <button onClick={() => alert("Redirecting to sales scheduling...")} className="text-teal font-medium flex items-center gap-1 hover:text-teal-deep transition-colors group text-base">
          Talk to sales
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 7 10" className="w-[7px] h-[10px] mt-0.5 group-hover:translate-x-0.5 transition-transform" aria-hidden="true"><path fill="currentColor" d="m0 9.501 6.998-3.844V4.343L0 .499V2.21L5.08 5 0 7.79z"></path></svg>
        </button>
      </div>
    </section>
  );
}
