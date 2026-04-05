"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Video, Stethoscope, BookOpen, Terminal } from "lucide-react";

const audiences = [
  {
    Icon: Video,
    who: "Content Creators",
    example: "500 DMs a day asking the same questions? Your AI twin handles them. You earn. You sleep.",
    stat: "50M+ creators globally",
  },
  {
    Icon: Stethoscope,
    who: "Doctors and Lawyers",
    example: "Your 40 years of expertise, available 24/7 at $0.01 per question. Your knowledge never retires.",
    stat: "1.3B knowledge workers",
  },
  {
    Icon: BookOpen,
    who: "Educators and Coaches",
    example: "Your lecture notes answering students at 3am. Your workout plan guiding a thousand clients at once.",
    stat: "Global $250B creator economy",
  },
  {
    Icon: Terminal,
    who: "Developers",
    example: "Build on top via our OpenAPI spec or MCP server. AgentNet as infrastructure for your next product.",
    stat: "Full API and MCP support",
  },
];

const comparisons = [
  {
    problem: "Experts can only talk to 1 person at a time",
    solution: "Your AI talks to unlimited people simultaneously",
  },
  {
    problem: "YouTube takes 45% of your ad revenue",
    solution: "You get paid directly. No middleman.",
  },
  {
    problem: "$20/mo subscriptions most people will never pay",
    solution: "$0.01 per question. Anyone can afford it.",
  },
  {
    problem: "Your knowledge disappears when you retire",
    solution: "Your knowledge is preserved, monetized, accessible forever",
  },
  {
    problem: "Platforms can ban you and cut your income overnight",
    solution: "Your agent lives on-chain. Nobody can take it down.",
  },
];

// ── Wipe Reveal Wrapper ────────────────────────────────────────────────
function WipeReveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div
        initial={{ clipPath: "inset(0 100% 0 0)" }}
        animate={isInView ? { clipPath: "inset(0 0% 0 0)" } : {}}
        transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </div>
  );
}

// ── Slide Up Wrapper ───────────────────────────────────────────────────
function SlideUp({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <div ref={ref} className={className}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </div>
  );
}

export default function WhyAgentNet() {
  return (
    <section className="relative py-24 px-6 lg:px-12 max-w-[1600px] mx-auto border-x border-black/10">

      {/* ── Who Is It For ── */}
      <div className="mb-24">
        <div className="flex items-end justify-between mb-12 border-b border-black/10 pb-8">
          <div>
            <WipeReveal>
              <p className="font-mono text-[10px] text-black/50 uppercase tracking-[0.4em] mb-3">
                // Who_Is_This_For
              </p>
            </WipeReveal>
            <WipeReveal delay={0.1}>
              <h2 className="font-logo text-5xl md:text-6xl font-extrabold tracking-tighter text-black">
                for everyone<br />who knows something.
              </h2>
            </WipeReveal>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border-t border-l border-black/10">
          {audiences.map((a, i) => (
            <SlideUp key={a.who} delay={i * 0.1}>
              <div className="border-r border-b border-black/10 p-8 group hover:bg-black/[0.02] transition-colors duration-500 h-full">
                <a.Icon className="w-7 h-7 mb-5 text-black/70 stroke-[1.5]" />
                <h3 className="font-sans font-bold text-lg text-black mb-3">{a.who}</h3>
                <p className="font-sans text-[12px] text-black/60 leading-relaxed mb-6 italic">
                  "{a.example}"
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-accent" />
                  <span className="font-mono text-[9px] text-black/50 uppercase tracking-widest">{a.stat}</span>
                </div>
              </div>
            </SlideUp>
          ))}
        </div>
      </div>

      {/* ── Why Not ChatGPT ── */}
      <div className="mb-24">
        <div className="flex items-end justify-between mb-12 border-b border-black/10 pb-8">
          <div>
            <WipeReveal>
              <p className="font-mono text-[10px] text-black/50 uppercase tracking-[0.4em] mb-3">
                // Why_Not_ChatGPT
              </p>
            </WipeReveal>
            <WipeReveal delay={0.1}>
              <h2 className="font-logo text-3xl md:text-4xl font-extrabold tracking-tighter text-black">
                your knowledge. not the internet's.
              </h2>
            </WipeReveal>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-black/10 overflow-hidden">
          <SlideUp delay={0}>
            <div className="p-8 border-b md:border-b-0 md:border-r border-black/10">
              <p className="font-mono text-[10px] text-black/40 uppercase tracking-widest mb-4">ChatGPT</p>
              <p className="font-sans text-black/65 text-sm leading-relaxed">
                Knows everything about everything but nothing specific about{" "}
                <em className="text-black">you</em>.{" "}
                Generic answers. Doesn't pay you. Anyone can use it.
                There's no "you" in it.
              </p>
            </div>
          </SlideUp>
          <SlideUp delay={0.15}>
            <div className="p-8 bg-accent/5 border-l-0 border border-accent/20">
              <p className="font-mono text-[10px] text-accent uppercase tracking-widest mb-4">
                AgentNet Agent
              </p>
              <p className="font-sans text-black text-sm leading-relaxed">
                Knows <strong>only what you uploaded</strong>. Answers in your style.
                Every conversation earns you money. It's the difference between
                Googling and calling your personal trainer.
              </p>
            </div>
          </SlideUp>
        </div>
      </div>

      {/* ── Comparison ── */}
      <div className="mb-24">
        <div className="flex items-end justify-between mb-12 border-b border-black/10 pb-8">
          <div>
            <WipeReveal>
              <p className="font-mono text-[10px] text-black/50 uppercase tracking-[0.4em] mb-3">
                // The_Old_Way_vs_AgentNet
              </p>
            </WipeReveal>
            <WipeReveal delay={0.1}>
              <h2 className="font-logo text-3xl md:text-4xl font-extrabold tracking-tighter text-black">
                before vs. after.
              </h2>
            </WipeReveal>
          </div>
        </div>

        <div className="space-y-0">
          {comparisons.map((row, i) => (
            <SlideUp key={i} delay={i * 0.08}>
              <div className="group grid grid-cols-1 md:grid-cols-[3rem_1fr_auto_1fr] items-stretch border-b border-black/10 hover:bg-black/[0.015] transition-colors duration-300">

                {/* Index */}
                <div className="hidden md:flex items-center justify-center py-6 border-r border-black/10">
                  <span className="font-mono text-[10px] text-black/20 tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>

                {/* Problem */}
                <div className="flex items-center gap-4 px-6 py-6 md:border-r border-black/10">
                  <div className="flex-shrink-0 w-5 h-5 border border-black/15 flex items-center justify-center">
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.2" className="text-black/25" />
                    </svg>
                  </div>
                  <span className="font-sans text-[13px] text-black/45 leading-snug line-through decoration-black/15">
                    {row.problem}
                  </span>
                </div>

                {/* Arrow */}
                <div className="hidden md:flex items-center justify-center px-5">
                  <svg width="20" height="10" viewBox="0 0 20 10" fill="none">
                    <path d="M0 5h18M14 1l4 4-4 4" stroke="currentColor" strokeWidth="1" className="text-black/20" />
                  </svg>
                </div>

                {/* Solution */}
                <div className="flex items-center gap-4 px-6 py-6 pl-6 md:pl-4">
                  <div className="flex-shrink-0 w-5 h-5 bg-black flex items-center justify-center">
                    <svg width="8" height="7" viewBox="0 0 8 7" fill="none">
                      <path d="M1 3.5l2 2 4-4" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="font-sans text-[13px] text-black font-semibold leading-snug">
                    {row.solution}
                  </span>
                </div>

              </div>
            </SlideUp>
          ))}
        </div>
      </div>

      {/* ── Closing Quote CTA ── */}
      <div className="text-center flex flex-col items-center gap-6">
        <WipeReveal>
          <blockquote className="font-logo text-3xl md:text-5xl font-extrabold tracking-tighter text-black max-w-3xl leading-tight">
            "Your brain. Working 24/7.
            <span className="text-black/30"> Even when you're sleeping."</span>
          </blockquote>
        </WipeReveal>
        <SlideUp delay={0.2}>
          <a
            href="/create"
            className="inline-flex items-center gap-3 bg-accent text-white px-8 py-4 hover:bg-black transition-colors duration-300 group"
          >
            <span className="font-mono text-[11px] font-bold uppercase tracking-widest">
              Start for Free
            </span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </SlideUp>
      </div>
    </section>
  );
}
