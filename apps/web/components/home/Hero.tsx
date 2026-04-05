"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Activity, Shield } from "lucide-react";
import Link from "next/link";
import { GlobeCdn } from "@/components/ui/cobe-globe-cdn";

const TICKER_ITEMS = [
  "X402 PROTOCOL", "AUTONOMOUS AGENTS", "ZERO PLATFORM FEE",
  "BASE SEPOLIA", "RAG-POWERED", "STREAMING SSE", "ON-CHAIN IDENTITY",
  "MCP SUPPORT", "USDC PAYMENTS", "AGENTNET",
];

export default function Hero() {
  const containerRef = useRef(null);
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 1000], [0, 200]);

  const floatY1 = useTransform(scrollY, [0, 800], [0, -80]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen w-full overflow-hidden bg-white pt-24"
    >
      {/* Grid background */}
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0 bg-architect-grid opacity-[0.4] pointer-events-none"
      />

      {/* Floating coordinate labels — top-right cluster */}
      <motion.div
        style={{ y: floatY1 }}
        className="absolute top-32 right-8 lg:right-16 flex flex-col gap-3 pointer-events-none select-none"
      >
        {[
          { label: "LAT", value: "37.7749° N" },
          { label: "LNG", value: "122.4194° W" },
          { label: "ALT", value: "0.021 km" },
          { label: "NODE", value: "#1,247" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className="font-mono text-[9px] uppercase tracking-widest text-black/30 w-8">{item.label}</span>
            <div className="w-[1px] h-3 bg-black/20" />
            <span className="font-mono text-[9px] text-black/60">{item.value}</span>
          </div>
        ))}
      </motion.div>


      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-6 lg:px-12 grid grid-cols-1 md:grid-cols-2 gap-0 border-x border-black/5 min-h-screen">

        {/* LEFT — text */}
        <div className="flex flex-col justify-center pt-12 pb-24 md:border-r border-black/5 md:pr-12">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-6 mb-10 font-mono text-[9px] opacity-30 uppercase tracking-[0.3em]"
          >
            <span>[ PROTOCOL_SYS_V2 ]</span>
            <div className="h-[1px] w-12 bg-black/20" />
            <span>0x4A_73_96_C7</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-logo font-extrabold text-[15vw] md:text-[8vw] leading-[1] tracking-[-0.04em] text-black mb-10"
          >
            agentnet
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="text-2xl md:text-3xl font-sans font-medium tracking-tight leading-[1.2] mb-4"
          >
            The Global Standard for<br />
            <span className="text-black/40">Autonomous Intelligence.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.38, ease: [0.16, 1, 0.3, 1] }}
            className="font-mono text-xs leading-relaxed text-black/50 uppercase max-w-sm mb-10"
          >
            Deploy, monetize, and scale autonomous agents on a high-performance
            X402 liquidity layer.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link href="/browse">
              <button className="group flex items-center justify-between gap-16 bg-black text-white px-8 py-4 w-full max-w-sm border border-black hover:bg-[#FF4500] hover:border-[#FF4500] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em]">Enter Marketplace</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-500" />
              </button>
            </Link>

            <div className="flex gap-4 font-mono text-[9px] uppercase tracking-widest opacity-40 mt-5">
              <span className="flex items-center gap-1"><Activity className="w-3 h-3 text-[#FF4500]" />1.2k Nodes</span>
              <span className="flex items-center gap-1"><Shield className="w-3 h-3" />Verified</span>
            </div>
          </motion.div>
        </div>

        {/* RIGHT — globe */}
        <div className="hidden md:flex items-center justify-center p-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.4, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-[500px]"
          >
            <GlobeCdn />
          </motion.div>
        </div>

      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-black/10" />

      {/* Marquee ticker strip */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-black/8 overflow-hidden bg-white/60 backdrop-blur-sm">
        <style>{`
          @keyframes marquee-left {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
        <div
          className="flex whitespace-nowrap py-2"
          style={{ animation: "marquee-left 28s linear infinite" }}
        >
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="inline-flex items-center gap-4 px-6 font-mono text-[8px] uppercase tracking-[0.35em] text-black/30">
              {item}
              <span className="w-1 h-1 rounded-full bg-black/20 flex-shrink-0" />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
