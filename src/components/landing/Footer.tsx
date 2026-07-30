"use client";

import React from "react";
import Image from "next/image";


export default function Footer() {

  const year = new Date().getFullYear();
  const socialLinksData = [
    {
      name: "Instagram",

      src: "/swiftab/socials/instagram.svg", 
      url: "https://www.instagram.com/reel/DafJ1htIGtr/?igsh=MWQ0cmhibjdpb2Q4ZA==",
    },
    {
      name: "Facebook",
      src: "/swiftab/socials/facebook.svg",
      url: "https://www.facebook.com/share/v/1JFZxLYXgW/",
    },
    {
      name: "TikTok",
      src: "/swiftab/socials/tiktok.svg",
      url: "#",
    },
    {
      name: "X",
      src: "/swiftab/socials/x.svg",
      url: "#",
    },
  ];

  return (
    <footer className="bg-ink text-white w-full h-full md:h-auto lg:h-auto flex flex-col pt-16 md:pt-24 pb-8 px-6 md:px-8 relative">
      <div className="container-custom mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] gap-8 md:gap-12 z-10 relative flex-1">
        <div>
          <a
            href="#hero"
            className="font-display text-2xl font-semibold tracking-wider text-white italic mb-4 block"
          >
            <Image
              src={"/assets/logo/logo2.png"}
              alt="swiftab_logo"
              width={150}
              height={100}
              className=" object-cover items-center justify-center"
            />
          </a>
          <p className="text-sm text-white/70 max-w-xs mb-6 leading-relaxed">
            Real-time floor intelligence designed for restaurants that prioritize
            the art of service.
          </p>
          <div className="flex gap-3">
            {socialLinksData.map(({ name, src: componentSrc, url }) => (
              <a
                key={name}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center transition-colors hover:bg-teal cursor-pointer group"
                aria-label={`Follow us on ${name}`}
              >
                <Image
                  src={componentSrc}
                  alt={`${name} icon`}
                  width={16}
                  height={16}
                  className="w-4 h-4 
                    filter brightness(0.7)  
                    transition-all duration-300 
                    group-hover:brightness(1) "
                />
              </a>
            ))}
          </div>
        </div>

        <div className="flex flex-col">
          <h4 className="font-semibold text-sm mb-4 text-white">Product</h4>
          <ul className="flex flex-col gap-3">
            <li>
              <a
                href="#features"
                className="text-sm text-white/70 hover:text-white transition-colors"
              >
                Features
              </a>
            </li>
            <li>
            </li>
            <li>
              <a
                href="https://play.google.com/store/apps/details?id=com.lifkha.swiftabapps"
                className="text-sm text-white/70 hover:text-white transition-colors"
              >
                Mobile App
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-sm text-white/70 hover:text-white transition-colors"
              >
                Reviews
              </a>
            </li>
          </ul>
        </div>

        <div className="flex flex-col">
          <h4 className="font-semibold text-sm mb-4 text-white">Resources</h4>
          <ul className="flex flex-col gap-3">
            <li>
              {/* <a
                href="#cta"
                className="text-sm text-white/70 hover:text-white transition-colors"
              >
                Documentation
              </a> */}
            </li>
            <li>
              <a
                href="/contact"
                className="text-sm text-white/70 hover:text-white transition-colors"
              >
                FAQs
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-sm text-white/70 hover:text-white transition-colors"
              >
                Case studies
              </a>
            </li>
            <li>
              <a
                href="/contact"
                className="text-sm text-white/70 hover:text-white transition-colors"
              >
                Support
              </a>
            </li>
          </ul>
        </div>

        <div className="flex flex-col">
          <h4 className="font-semibold text-sm mb-4 text-white">Company</h4>
          <ul className="flex flex-col gap-3">
            <li>
              <a
                href="/about-us"
                className="text-sm text-white/70 hover:text-white transition-colors"
              >
                About
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-sm text-white/70 hover:text-white transition-colors"
              >
                Careers
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-sm text-white/70 hover:text-white transition-colors"
              >
                Blog
              </a>
            </li>
            <li>
              <a
                href="/contact"
                className="text-sm text-white/70 hover:text-white transition-colors"
              >
                Contact
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="w-full text-center z-10 relative pt-10">
        <h2 className="text-[20vw] font-display font-bold leading-[0.75] tracking-tighter text-white/5 pointer-events-none select-none">
          SWIFTAB
        </h2>
      </div>
      <div className="container-custom pt-4 border-t border-white/10 flex flex-col items-center gap-4 z-10 relative mt-auto sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <p className="text-sm text-white/50 text-center sm:text-left">
          {`© ${year} Swiftab. All rights reserved.`}
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center sm:justify-end sm:flex-wrap-reverse">
          <a
            href="/privacy-policy"
            className="text-sm text-white/50 hover:text-white transition-colors"
          >
            Privacy Policy
          </a>
          <a
            href="/terms-of-service"
            className="text-sm text-white/50 hover:text-white transition-colors"
          >
            Terms of Service
          </a>
          <a
            href="#hero"
            className="text-sm text-white/50 hover:text-white transition-colors"
          >
            Cookies
          </a>
        </div>
      </div>

    </footer>
  );
}