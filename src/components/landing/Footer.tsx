export default function Footer() {
  return (
    <footer className="bg-ink text-white w-full h-[900px] md:h-[650px] lg:h-[600px] flex flex-col pt-16 md:pt-24 pb-8 px-6 md:px-8 overflow-hidden relative">
      <div className="container-custom mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] gap-8 md:gap-12 z-10 relative flex-1">
        <div>
          <a href="#hero" className="font-display text-2xl font-semibold tracking-wider text-white italic mb-4 block">
            Swiftab.
          </a>
          <p className="text-sm text-white/70 max-w-xs mb-6 leading-relaxed">
            Real-time floor intelligence designed for restaurants that prioritize the art of service.
          </p>
          <div className="flex gap-3">
            {['Ig', 'X', 'In'].map((social) => (
              <span key={social} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs text-white/70 transition-colors hover:bg-teal hover:text-white cursor-pointer">
                {social}
              </span>
            ))}
          </div>
        </div>
        
        <div className="flex flex-col">
          <h4 className="font-semibold text-sm mb-4 text-white">Product</h4>
          <ul className="flex flex-col gap-3">
            <li><a href="#features" className="text-sm text-white/70 hover:text-white transition-colors">Features</a></li>
            <li><a href="#platform" className="text-sm text-white/70 hover:text-white transition-colors">Platform</a></li>
            <li><a href="#mobile" className="text-sm text-white/70 hover:text-white transition-colors">Mobile App</a></li>
            <li><a href="#reviews" className="text-sm text-white/70 hover:text-white transition-colors">Reviews</a></li>
          </ul>
        </div>
        
        <div className="flex flex-col">
          <h4 className="font-semibold text-sm mb-4 text-white">Resources</h4>
          <ul className="flex flex-col gap-3">
            <li><a href="#cta" className="text-sm text-white/70 hover:text-white transition-colors">Documentation</a></li>
            <li><a href="#cta" className="text-sm text-white/70 hover:text-white transition-colors">FAQs</a></li>
            <li><a href="#cta" className="text-sm text-white/70 hover:text-white transition-colors">Case studies</a></li>
            <li><a href="#cta" className="text-sm text-white/70 hover:text-white transition-colors">Support</a></li>
          </ul>
        </div>
        
        <div className="flex flex-col">
          <h4 className="font-semibold text-sm mb-4 text-white">Company</h4>
          <ul className="flex flex-col gap-3">
            <li><a href="#hero" className="text-sm text-white/70 hover:text-white transition-colors">About</a></li>
            <li><a href="#hero" className="text-sm text-white/70 hover:text-white transition-colors">Careers</a></li>
            <li><a href="#hero" className="text-sm text-white/70 hover:text-white transition-colors">Blog</a></li>
            <li><a href="#cta" className="text-sm text-white/70 hover:text-white transition-colors">Contact</a></li>
          </ul>
        </div>
      </div>
      
      {/* Big SWIFTAB text at bottom */}
      <div className="w-full text-center z-10 relative mt-auto pt-10">
        <h2 className="text-[20vw] font-display font-bold leading-[0.75] tracking-tighter text-white/5 pointer-events-none select-none">
          SWIFTAB
        </h2>
      </div>
      
      <div className="container-custom mx-auto pt-8 border-t border-white/10 flex items-center justify-between flex-wrap gap-4 z-10 relative mt-8">
        <p className="text-sm text-white/50">© 2026 Swiftab. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#hero" className="text-sm text-white/50 hover:text-white transition-colors">Privacy Policy</a>
          <a href="#hero" className="text-sm text-white/50 hover:text-white transition-colors">Terms of Service</a>
          <a href="#hero" className="text-sm text-white/50 hover:text-white transition-colors">Cookies</a>
        </div>
      </div>
    </footer>
  );
}
