import React from "react";
const row1 = [
  { quote: "Swiftab cut our average table turn by almost 20% in the first month. The floor view alone paid for itself.", author: "Maria Chen", role: "GM, Ember & Oak", initials: "MC", metric: "-20%", desc: "in table turn time" },
  { quote: "Our servers finally work off one screen instead of three clipboards and a Sharpie. Onboarding is a day, not a week.", author: "Daniel Osei", role: "Owner, Copper Kettle", initials: "DO", metric: "1 Day", desc: "average onboarding" },
  { quote: "The floor plan builder alone saved us hours every week during our patio-season resets.", author: "Priya Nair", role: "Ops Director, Salt & Vine", initials: "PN", metric: "6x", desc: "faster floor resets" },
  { quote: "Real-time analytics changed how we staff weekends. We stopped guessing and started scheduling off data.", author: "Jonas Berg", role: "GM, The Wharfside", initials: "JB", metric: "15%", desc: "reduction in labor costs" }
];

const row2 = [
  { quote: "Support actually picks up the phone. On a Friday night, that matters more than any feature list.", author: "Aaliyah Brooks", role: "Owner, Bloom Kitchen", initials: "AB", metric: "24/7", desc: "live support" },
  { quote: "We rolled Swiftab out across four locations in a single week. Every GM had live data by day two.", author: "Marco Ferretti", role: "Regional Mgr, Trattoria Bell", initials: "MF", metric: "4", desc: "locations launched weekly" },
  { quote: "The waitlist automation alone freed up our host to actually greet people instead of babysitting a clipboard.", author: "Ravi Kapoor", role: "GM, Harbor & Hearth", initials: "RK", metric: "+40%", desc: "host efficiency" },
  { quote: "It's the first system our whole team actually likes using. That's rarer than it should be.", author: "Elena Vos", role: "Owner, Nightjar", initials: "EL", metric: "100%", desc: "team adoption" }
];

const TestimonialCard: React.FC<{item: any}> = ({ item }) => (
  <div className="w-[320px] md:w-[450px] flex-shrink-0 flex flex-col bg-white border border-line rounded-2xl shadow-sm overflow-hidden">
    <div className="p-6 md:p-8 pb-6 flex-1">
      <div className="text-base md:text-[1.125rem] font-light leading-[1.6] text-ink-soft mb-6 md:mb-8 min-h-[80px]">
        "{item.quote}"
      </div>
      <div className="flex items-center gap-4 mt-auto">
        <div className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-teal/10 text-teal font-semibold text-sm flex items-center justify-center">
          {item.initials}
        </div>
        <div>
          <div className="text-[14px] md:text-[15px] font-medium text-ink">{item.author}</div>
          <div className="text-xs md:text-[13px] text-ink-faint">{item.role}</div>
        </div>
      </div>
    </div>
    <div className="bg-paper-dim border-t border-line p-5 md:p-6 flex flex-col">
      <div className="text-3xl md:text-4xl font-display font-light text-teal mb-1">{item.metric}</div>
      <div className="text-xs md:text-sm text-ink-faint">{item.desc}</div>
    </div>
  </div>
);

export default function Testimonials() {
  return (
    <section className="py-24 md:py-32 bg-white overflow-hidden" id="reviews">
      <div className="text-center mx-auto max-w-[800px] mb-16 md:mb-20 px-4">
        <h2 className="text-[clamp(2rem,4vw,3.5rem)] text-ink font-medium leading-[1.1] tracking-tight mb-4 md:mb-5">
          Driving results for the world's top restaurants
        </h2>
      </div>
      
      <div className="overflow-hidden mb-6 md:mb-8 [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
        <div className="flex w-max gap-6 md:gap-8 px-10 py-2 animate-marquee hover:[animation-play-state:paused]">
          {[...row1, ...row1].map((item, index) => (
            <TestimonialCard key={index} item={item} />
          ))}
        </div>
      </div>
      
      <div className="overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
        <div className="flex w-max gap-6 md:gap-8 px-10 py-2 animate-marquee-reverse hover:[animation-play-state:paused]">
          {[...row2, ...row2].map((item, index) => (
            <TestimonialCard key={index} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
