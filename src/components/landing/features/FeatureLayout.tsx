"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight} from "lucide-react";


export interface FeatureStat {
  value: string;
  label: string;
}

export interface FeatureSection {
  heading: string;
  paragraphs: string[];
  pullQuote?: string;
}

export interface AnalyticsMetric {
  title: string;
  description: string;
}

export interface FeaturePageContent {
  eyebrow: string;
  headline: string[];
  dek: string;
  stats: FeatureStat[];
  sections: FeatureSection[];
  analyticsTitle: string;
  analyticsIntro: string;
  analyticsMetrics: AnalyticsMetric[];
  analyticsClosing: string;
  ctaLabel: string;
}

function PerforatedRule() {
  return (
    <div
      aria-hidden="true"
      className="h-px w-full"
      style={{
        backgroundImage:
          "radial-gradient(circle, #C1440E 1.5px, transparent 1.5px)",
        backgroundSize: "14px 100%",
      }}
    />
  );
}

function StatStamp({ value, label, rotate }: FeatureStat & { rotate: number }) {
  return (
    <div
      className="monofont border-2 border-[#1A1815] bg-[#F0F0EE] px-5 py-4 text-[#1A1815]"
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <div className="text-2xl font-semibold sm:text-3xl">{value}</div>
      <div className="mt-1.5 text-[11px] uppercase tracking-wide text-[#1A1815]/60">
        {label}
      </div>
    </div>
  );
}

export default function FeaturePageLayout({
  content,
}: {
  content: FeaturePageContent;
}) {
  const prefersReducedMotion = useReducedMotion();
  const reveal = {
    initial: { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: { duration: prefersReducedMotion ? 0 : 0.35 },
  };

  return (
    <main
      className= "displayfont bodyfont monofont bg-white text-[#1A1815] pt-10"
    >
     

      <div className="px-6 py-16 sm:px-10 sm:py-20 lg:px-16 lg:py-24">
        <motion.div
          {...reveal}
          className="monofont mb-6 flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-[#1A1815]/60" 
        >
          <span className="h-2 w-2 bg-[#008080]" aria-hidden="true" />
          {content.eyebrow}
        </motion.div>

        <motion.h1
          {...reveal}
          className="displayfont max-w-4xl text-[clamp(2.25rem,7vw,4.5rem)] uppercase leading-[0.95] tracking-[-0.01em]"
        >
          {content.headline.map((line, i) => (
            <React.Fragment key={i}>
              {line}
              {i < content.headline.length - 1 && <br />}
            </React.Fragment>
          ))}
        </motion.h1>

        <motion.p
          {...reveal}
          className="bodyfont mt-6 max-w-xl text-lg leading-relaxed text-[#1A1815]/80"
        >
          {content.dek}
        </motion.p>
      </div>

      <PerforatedRule />

      <div className="grid grid-cols-1 gap-4 px-6 py-10 sm:grid-cols-3 sm:px-10 lg:px-16">
        {content.stats.map((stat, i) => (
          <motion.div
            {...reveal}
            key={stat.label}
            transition={{
              ...reveal.transition,
              delay: prefersReducedMotion ? 0 : i * 0.05,
            }}
          >
            <StatStamp {...stat} rotate={i % 2 === 0 ? -1.5 : 1.5} />
          </motion.div>
        ))}
      </div>

      <PerforatedRule />

      <div className="px-6 py-14 sm:px-10 lg:px-16">
        {content.sections.map((section, i) => (
          <React.Fragment key={section.heading}>
            <motion.section {...reveal} className="mx-auto max-w-3xl py-10">
              <div className="monofont mb-3 text-xs text-[#008080]">
                {String(i + 1).padStart(2, "0")} /{" "}
                {String(content.sections.length).padStart(2, "0")}
              </div>
              <h2
                className="displayfont mb-5 text-[clamp(1.5rem,3.5vw,2.25rem)] uppercase leading-tight tracking-[-0.01em]"
              >
                {section.heading}
              </h2>
              {section.pullQuote && (
                <blockquote
                  className="bodyfont my-6 border-l-2 border-[#C1440E] pl-5 text-xl italic leading-snug text-[#1A1815]"
                >
                  {section.pullQuote}
                </blockquote>
              )}
              {section.paragraphs.map((p, pi) => (
                <p
                  key={pi}
                  className="bodyfont mb-4 text-[17px] leading-relaxed text-[#1A1815]/85"
                >
                  {p}
                </p>
              ))}
            </motion.section>
            {i < content.sections.length - 1 && (
              <div className="mx-auto max-w-3xl">
                <PerforatedRule />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      <motion.div
        {...reveal}
        className="bg-[#1A1815] px-6 py-16 text-[#F0F0EE] sm:px-10 sm:py-20 lg:px-16"
      >
        <div
          className="monofont mb-4 text-xs uppercase tracking-[0.15em] text-[#F0F0EE]/50"
        >
          Analytics
        </div>
        <h2
          className="displayfont mb-4 max-w-2xl text-[clamp(1.75rem,4vw,2.75rem)] uppercase leading-tight"
        >
          {content.analyticsTitle}
        </h2>
        <p
          className="bodyfont mb-10 max-w-xl text-base leading-relaxed text-[#F0F0EE]/75"
        >
          {content.analyticsIntro}
        </p>

        <div className="mb-10 grid grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-2">
          {content.analyticsMetrics.map((metric) => (
            <div key={metric.title} className="border-t border-[#F0F0EE]/15 pt-4">
              <div
                className="monofont mb-1.5 text-sm font-medium uppercase tracking-wide text-[#F0F0EE]"
              >
                {metric.title}
              </div>
              <div className="bodyfont text-sm leading-relaxed text-[#F0F0EE]/65">
                {metric.description}
              </div>
            </div>
          ))}
        </div>

        <p
          className="bodyfont mb-8 max-w-xl text-base leading-relaxed text-[#F0F0EE]/75"
        >
          {content.analyticsClosing}
        </p>

        <button
          type="button"
          className="monofont group inline-flex -rotate-2 items-center gap-2 border-2 border-[#F0F0EE] bg-[#008080] px-6 py-3.5 text-sm font-semibold uppercase tracking-wider text-[#F0F0EE] transition-transform duration-150 hover:rotate-0 hover:bg-[#005F5F] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#008080]/50"
        >
          {content.ctaLabel}
          <ArrowRight
            className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </button>
      </motion.div>
    </main>
  );
}