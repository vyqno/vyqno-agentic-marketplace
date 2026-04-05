"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Upload, Brain, DollarSign, ArrowRight } from "lucide-react";

function WipeReveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
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

const steps = [
  {
    num: "01",
    icon: Upload,
    title: "Upload Your Knowledge",
    body: "Paste text or drop a .md file. Your notes, guides, research, anything you want to share. We handle the rest.",
    tag: "5 MINUTES TO DEPLOY",
  },
  {
    num: "02",
    icon: Brain,
    title: "AI Becomes You",
    body: "Our RAG engine reads everything you uploaded and creates an AI that answers in your style, using only your knowledge.",
    tag: "NO HALLUCINATIONS",
  },
  {
    num: "03",
    icon: DollarSign,
    title: "Earn While You Sleep",
    body: "Anyone in the world pays $0.01 to ask a question. The answer streams back instantly. You get paid directly to your wallet.",
    tag: "INSTANT USDC PAYOUTS",
  },
];

export default function HowItWorks() {
  return (
    <section className="relative py-24 px-6 lg:px-12 max-w-[1600px] mx-auto border-x border-black/10">
      {/* Section header */}
      <div className="flex items-end justify-between mb-16 border-b border-black/10 pb-8">
        <div>
          <WipeReveal>
            <p className="font-mono text-[10px] text-black/50 uppercase tracking-[0.4em] mb-3">// How_It_Works</p>
          </WipeReveal>
          <WipeReveal delay={0.1}>
            <h2 className="font-logo font-extrabold text-5xl md:text-6xl tracking-tighter text-black">three steps.</h2>
          </WipeReveal>
        </div>
        <WipeReveal delay={0.2}>
          <span className="hidden md:block font-mono text-[10px] text-black/30 uppercase tracking-widest">
            No crypto knowledge required
          </span>
        </WipeReveal>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-l border-black/10">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="border-r border-black/10 p-8 md:p-10 group hover:bg-black/[0.02] transition-colors duration-500"
            >
              {/* Number */}
              <div className="flex items-start justify-between mb-8">
                <span className="font-logo text-7xl text-black/8 leading-none select-none">{step.num}</span>
                <div className="w-10 h-10 border border-black/15 flex items-center justify-center group-hover:border-accent group-hover:bg-accent/5 transition-all duration-500">
                  <Icon className="w-4 h-4 text-black/60 group-hover:text-accent transition-colors duration-500" />
                </div>
              </div>

              {/* Content */}
              <h3 className="font-sans font-bold text-xl text-black mb-3 leading-tight">{step.title}</h3>
              <p className="font-sans text-sm text-black/60 leading-relaxed mb-8">{step.body}</p>

              {/* Tag */}
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-accent rounded-none" />
                <span className="font-mono text-[9px] text-accent uppercase tracking-widest">{step.tag}</span>
              </div>

              {/* Arrow connector (not on last) */}
              {i < steps.length - 1 && (
                <div className="hidden md:flex absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 z-10">
                  {/* connector dot handled by border */}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Bottom callout */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="mt-12 border border-black/10 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-black/[0.015]"
      >
        <div>
          <p className="font-sans font-bold text-lg text-black">Ready to deploy your brain?</p>
          <p className="font-mono text-[10px] text-black/50 uppercase tracking-widest mt-1">Sign in with Google · No wallet needed · Go live in 5 minutes</p>
        </div>
        <a href="/create" className="flex-shrink-0 flex items-center gap-3 bg-black text-white px-6 py-3 hover:bg-accent transition-colors duration-300 group">
          <span className="font-mono text-[11px] font-bold uppercase tracking-widest">Deploy Agent</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </a>
      </motion.div>
    </section>
  );
}
