"use client"
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
  { label: 'Features', href: '#features' }, 
  { label: 'Pricing', href: '/pricing' },   
  { label: 'Contact', href: '/contact' },  
  { label: 'About Us', href: '/about-us' }, 
];
  
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 36);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isMobileOpen]);
  
  return (
    <>
      <header className={cn("fixed top-0 left-0 right-0 z-100 transition-all duration-300", 
        isScrolled ? "bg-white/95 backdrop-blur-md shadow-sm -translate-y-9" : "bg-transparent translate-y-0"
      )}>
        <div className="bg-ink text-white h-9 text-xs font-medium tracking-wide flex justify-center items-center px-4 relative z-10">
          <span className="opacity-90">Now available in playstore <a href="https://play.google.com/store/apps/details?id=com.lifkha.swiftabapps" className="underline ml-2 hover:text-teal transition-colors">Download</a></span>
        </div>
        
        <div className={cn("transition-all duration-300", isScrolled ? "py-4" : "py-5 sm:py-6")}>
          <div className="container-custom flex items-center justify-between">
           
            <Link href={'/'} className='h-10 items-center justify-center flex'><Image src={'/assets/logo/logo2.png'} alt='swiftab_logo' width={150} height={100} className=" object-cover items-center justify-center"/></Link>
            <nav className="hidden md:flex items-center gap-8">
    {navItems.map((item) => (
      <Link
        key={item.label}
        href={item.href}
        className="text-[14px] font-medium text-ink hover:text-teal transition-colors relative group"
      >
        {item.label}
        <span className="absolute -bottom-1.5 left-0 w-0 h-1 bg-teal rounded-t-sm transition-all duration-200 group-hover:w-full"></span>
      </Link>
    ))}
  </nav>
            <div className="hidden md:flex items-center gap-6">
              <Link href="/signin" className="text-[14px] font-medium text-ink hover:text-teal transition-colors">Log In</Link>
              <Link href="/signup" className="px-7 py-2.5 bg-teal text-white rounded-[40px] text-[14px] font-medium hover:bg-teal-deep transition-colors shadow-[0_2px_8px_rgba(0,128,128,0.2)] whitespace-nowrap">
                Start For Free
              </Link>
            </div>
            <button className="md:hidden flex flex-col gap-1.5 w-6 p-1 z-[110]" onClick={() => setIsMobileOpen(!isMobileOpen)} aria-label="Toggle menu">
              <span className={cn("block h-[2px] w-full bg-ink rounded-full transition-all duration-300", isMobileOpen ? "translate-y-[8px] rotate-45" : "")}></span>
              <span className={cn("block h-[2px] w-full bg-ink rounded-full transition-all duration-300", isMobileOpen ? "opacity-0" : "")}></span>
              <span className={cn("block h-[2px] w-full bg-ink rounded-full transition-all duration-300", isMobileOpen ? "-translate-y-[8px] -rotate-45" : "")}></span>
            </button>
          </div>
        </div>
      </header>
      
      <div className={cn("md:hidden fixed inset-0 bg-white z-[90] transition-transform duration-300 ease-in-out flex flex-col pt-32 px-6", isMobileOpen ? "translate-x-0" : "translate-x-full")}>
        <nav className="flex flex-col gap-6 text-2xl font-medium text-ink mb-12">
          {navItems.map((item) =>  (
            <a key={item.label} href={item.href} onClick={() => setIsMobileOpen(false)} className="hover:text-teal transition-colors">
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex flex-col gap-4 mt-auto mb-10">
          <Link href="/signin" onClick={() => setIsMobileOpen(false)} className="w-full py-4 text-center text-lg font-medium text-ink border border-line rounded-full">Log In</Link>
          <Link href="/signup" onClick={() => setIsMobileOpen(false)} className="w-full py-4 text-center text-lg font-medium text-white bg-teal rounded-full shadow-md hover:bg-teal-deep">Start For Free</Link>
        </div>
      </div>
    </>
  );
}
