"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, ChevronsRight } from "lucide-react";
import HeroFloor from "./HeroFloor";

const channels = ["Reservations", "Floor plan", "Live orders", "M-Pesa · Card · Cash"];

export default function Hero() {
  const reduceMotion = useReducedMotion();
  const rise = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] as const },
        };

  return (
    <section id="hero" className="bg-paper pt-[124px] md:pt-[136px] pb-10 md:pb-14">
      <div className="mx-auto max-w-[1400px] px-3 sm:px-5">
        <div className="relative isolate overflow-hidden rounded-[28px] md:rounded-[40px] bg-[#062B29] text-white">
          {/* Deep-green stage with the brand's curved side panels. */}
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-[radial-gradient(120%_90%_at_50%_0%,#0F5F59_0%,#0A423E_38%,#062B29_72%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-[50%] top-1/2 -z-10 hidden aspect-square w-[62%] -translate-y-1/2 rounded-full border border-white/10 bg-white/[0.03] md:block"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-[50%] top-1/2 -z-10 hidden aspect-square w-[62%] -translate-y-1/2 rounded-full border border-white/10 bg-white/[0.03] md:block"
          />

          <div className="grid items-center gap-12 px-6 py-14 sm:px-10 md:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-10 lg:px-16 lg:py-24">
            <div className="mx-auto flex max-w-[560px] flex-col items-center text-center lg:mx-0 lg:items-start lg:text-left">
              <motion.p
                {...rise(0)}
                className="monofont mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-emerald-100/90"
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75 motion-reduce:hidden" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-300" />
                </span>
                For hosts, waiters and managers
              </motion.p>

              <motion.h1
                {...rise(0.08)}
                className="bodyfont text-balance text-[clamp(2.6rem,6.2vw,4.6rem)] font-medium leading-[1.02] tracking-[-0.025em]"
              >
                A full house,{" "}
                <span className="italic text-emerald-300">under control.</span>
              </motion.h1>

              <motion.p
                {...rise(0.16)}
                className="bodyfont mt-6 max-w-[520px] text-pretty text-[1.0625rem] leading-relaxed text-emerald-50/75 md:text-[1.15rem]"
              >
                Swiftab runs your reservations, floor plan, live orders and payments in one place.
                Hosts seat faster, waiters serve sooner, and you watch the whole night as it happens.
              </motion.p>

              <motion.div
                {...rise(0.24)}
                className="mt-9 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row"
              >
                <Link
                  href="/signup"
                  className="group inline-flex h-14 w-full items-center justify-between gap-6 rounded-full bg-white pl-7 pr-2 text-[15px] font-semibold text-[#062B29] shadow-[0_12px_30px_-10px_rgba(0,0,0,0.6)] transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-300 sm:w-auto"
                >
                  Start for free
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0A423E] text-white transition-colors group-hover:bg-teal">
                    <ChevronsRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </span>
                </Link>
                <a
                  href="#features"
                  className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full border border-white/20 px-7 text-[15px] font-medium text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-300 sm:w-auto"
                >
                  See how it works
                  <ArrowRight className="h-4 w-4" />
                </a>
              </motion.div>

              <motion.p {...rise(0.3)} className="monofont mt-5 text-[12px] tracking-wide text-emerald-100/55">
                14-day free trial · No card required
              </motion.p>
            </div>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 28, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative mx-auto w-full max-w-[560px] lg:max-w-none"
            >
              <HeroFloor />
            </motion.div>
          </div>

          <ul className="monofont flex flex-wrap items-center justify-center gap-x-8 gap-y-2 border-t border-white/10 px-6 py-5 text-[11px] uppercase tracking-[0.18em] text-emerald-100/60">
            {channels.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span aria-hidden className="h-1 w-1 rounded-full bg-emerald-300/70" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
