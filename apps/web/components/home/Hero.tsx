"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Zap, Activity, Shield, Cpu } from "lucide-react";
import Link from "next/link";
import { GlobeCdn } from "@/components/ui/globe-cdn";

// ── Technical Pointer ────────────────────────────────────────────────────────

function TechPointer({ 
  label, 
  value, 
  className = "",
  direction = "down"
}: { 
  label: string; 
  value: string; 
  className?: string;
  direction?: "up" | "down";
}) {
  return (
    <div className={`absolute flex flex-col font-mono text-[9px] tracking-tight group ${className}`}>
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 bg-accent rounded-none" />
        <span className="opacity-40 uppercase">{label}</span>
      </div>
      <div className="flex gap-2 items-start mt-1 pl-3">
        <div className={`w-[1px] ${direction === 'down' ? 'h-10' : 'h-10 -translate-y-10'} bg-black/10 origin-top transition-all duration-500`} />
        <span className="font-bold uppercase tracking-wider">{value}</span>
      </div>
    </div>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────────

export default function Hero() {
  const containerRef = useRef(null);
  const { scrollY } = useScroll();

  // Parallax Values
  const bgY = useTransform(scrollY, [0, 1000], [0, 200]);
  const textX = useTransform(scrollY, [0, 1000], [0, -100]);
  const globeOpacity = useTransform(scrollY, [0, 500], [0.15, 0.05]);

  return (
    <section 
      ref={containerRef}
      className="relative min-h-[110vh] w-full overflow-hidden bg-white selection:bg-accent selection:text-white pt-24"
    >
      {/* Background Architectural Grid */}
      <motion.div 
        style={{ y: bgY }}
        className="absolute inset-0 bg-architect-grid opacity-[0.4] pointer-events-none" 
      />

      {/* Main 12-Column Layout */}
      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-6 lg:px-12 grid grid-cols-4 md:grid-cols-12 gap-0 border-x border-black/5">
        
        {/* Left Column: Branding & Massive Title */}
        <div className="col-span-4 md:col-span-8 pt-12 pb-24 border-r border-black/5 pr-8">
          
          {/* Internal Metadata */}
          <div className="flex items-center gap-6 mb-12 font-mono text-[9px] opacity-30 uppercase tracking-[0.3em]">
            <span>[ PROTOCOL_SYS_V2 ]</span>
            <div className="h-[1px] w-12 bg-black/20" />
            <span>0x4A_73_96_C7</span>
          </div>

          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="font-logo text-[18vw] md:text-[14vw] leading-[0.75] tracking-[-0.04em] mb-8 text-black">
              agentnet
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-16 px-2">
              <div className="flex flex-col gap-6">
                <h2 className="text-3xl md:text-4xl font-sans font-medium tracking-tight leading-[1.1]">
                  The Global Standard for <br />
                  <span className="text-black/40">Autonomous Intelligence.</span>
                </h2>
                <p className="font-mono text-xs leading-relaxed text-black/50 uppercase max-w-sm">
                  Deploy, monetize, and scale autonomous agents on a high-performance 
                  X402 liquidity layer. Professional infrastructure for the next web.
                </p>
              </div>

              <div className="flex flex-col justify-end gap-6 items-start">
                <Link href="/browse" className="w-full">
                  <button className="group flex items-center justify-between gap-12 bg-black text-white px-8 py-5 rounded-none w-full border border-black hover:bg-accent hover:border-accent transition-all duration-500">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em]">Enter Marketplace</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
                <div className="flex gap-4 font-mono text-[9px] uppercase tracking-widest opacity-40">
                  <span className="flex items-center gap-1">
                    <Activity className="w-3 h-3 text-accent" />
                    1.2k Nodes
                  </span>
                  <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Verified
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Interactive Data Monitor */}
        <div className="col-span-4 pt-12 relative h-full flex flex-col items-center">
          
          <div className="absolute top-12 left-8 right-8 bottom-24 border border-black/5 bg-muted/30 backdrop-blur-sm p-4 overflow-hidden group">
            {/* Monitor Header */}
            <div className="flex justify-between items-center mb-6 border-b border-black/5 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-accent animate-pulse" />
                <span className="font-mono text-[9px] uppercase tracking-widest font-bold">Node_Visualizer</span>
              </div>
              <span className="font-mono text-[8px] opacity-30">V.SYST_99</span>
            </div>

            {/* Globe Visualizer */}
            <motion.div 
              style={{ opacity: globeOpacity }}
              className="w-full h-[400px] mt-8 group-hover:scale-105 transition-transform duration-1000"
            >
              <GlobeCdn speed={0.001} />
            </motion.div>

            {/* Monitor Overlay Stats */}
            <div className="mt-8 grid grid-cols-2 gap-4 font-mono text-[8px] uppercase tracking-widest border-t border-black/5 pt-4">
              <div className="flex flex-col gap-1">
                <span className="opacity-40">Traffic</span>
                <span className="font-bold">3.4 GB/S</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="opacity-40">Latency</span>
                <span className="font-bold">14 MS</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="opacity-40">Status</span>
                <span className="text-accent font-bold">STABLE</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="opacity-40">Region</span>
                <span className="font-bold">GLOB_V1</span>
              </div>
            </div>
          </div>

          {/* Technical Floating Annotations */}
          <TechPointer label="Identity" value="X.Auth.V1" className="top-1/4 -left-12 hidden lg:flex" direction="up" />
          <TechPointer label="Payment" value="Pay.X402" className="bottom-1/3 -left-20 hidden lg:flex" direction="down" />
        </div>
      </div>

      {/* Decorative Bottom Tape */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-black/10" />
      <div className="absolute bottom-12 left-0 right-0 flex justify-between px-12 font-mono text-[8px] opacity-20 uppercase tracking-[0.5em]">
        <span>// DESIGNED_IN_SWITZERLAND</span>
        <span>// 2026_SYNTHVERSE_CORE</span>
        <span>// ALL_SYSTEMS_OPERATIONAL</span>
      </div>
    </section>
  );
}
