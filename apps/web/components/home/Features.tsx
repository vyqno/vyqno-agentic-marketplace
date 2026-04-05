"use client";

import { motion } from "framer-motion";
import { Bot, MessageSquare, CreditCard, Smartphone, Lock, Globe, FileText, Zap } from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "RAG-Powered AI Agents",
    body: "Each agent has its own private knowledge base. Answers only come from what YOU uploaded. No random internet facts.",
    accent: true,
  },
  {
    icon: MessageSquare,
    title: "WhatsApp Bot",
    body: "Your followers don't need an app or website. They text the agent on WhatsApp and get instant answers.",
    accent: false,
  },
  {
    icon: CreditCard,
    title: "Pay with UPI / Card",
    body: "Indian users pay in INR via Razorpay or UPI. We convert to USDC behind the scenes. No crypto knowledge needed.",
    accent: false,
  },
  {
    icon: Lock,
    title: "Google Login",
    body: "Sign in with Google. We spin up a smart wallet silently. No MetaMask, no seed phrases, no friction.",
    accent: false,
  },
  {
    icon: FileText,
    title: "Document Upload",
    body: "Upload .md files up to 10MB. Your agent reads every word and knows exactly what you shared.",
    accent: false,
  },
  {
    icon: Globe,
    title: "Blockchain Identity",
    body: "Every agent is registered on-chain via AgentRegistry.sol on Base Sepolia. Your agent is owned by you. Forever.",
    accent: false,
  },
  {
    icon: Zap,
    title: "Streaming Responses",
    body: "Answers stream back in real-time via SSE. No waiting. The conversation feels alive and instant.",
    accent: false,
  },
  {
    icon: Smartphone,
    title: "Creator Dashboard",
    body: "Track queries, earnings, and manage all your agents from one profile page. Edit skills, update descriptions anytime.",
    accent: false,
  },
];

const stats = [
  { value: "$0.01", label: "Per question" },
  { value: "24/7", label: "Always online" },
  { value: "0%", label: "Platform cut on free agents" },
  { value: "<2s", label: "Answer latency" },
];

export default function Features() {
  return (
    <section className="relative py-24 px-6 lg:px-12 max-w-[1600px] mx-auto border-x border-black/10 bg-white">
      {/* Section header */}
      <div className="flex items-end justify-between mb-16 border-b border-black/10 pb-8">
        <div>
          <p className="font-mono text-[10px] text-black/40 uppercase tracking-[0.4em] mb-3">// Platform_Features</p>
          <h2 className="font-logo text-5xl md:text-6xl tracking-tighter text-black">what's inside.</h2>
        </div>
        <div className="hidden md:flex gap-12">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col items-end">
              <span className="font-logo text-3xl text-black leading-none">{s.value}</span>
              <span className="font-mono text-[9px] text-black/35 uppercase tracking-widest mt-1">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Feature grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border-t border-l border-black/10">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <motion.div
              key={f.title}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.6 }}
              className={`border-r border-b border-black/10 p-7 group hover:bg-black/[0.02] transition-colors duration-500 ${f.accent ? "bg-black/[0.03]" : ""}`}
            >
              <div className="flex items-start justify-between mb-5">
                <div className={`w-9 h-9 flex items-center justify-center border ${f.accent ? "border-black bg-black" : "border-black/15"} group-hover:border-black transition-colors duration-500`}>
                  <Icon className={`w-4 h-4 ${f.accent ? "text-white" : "text-black/45"} group-hover:text-black transition-colors duration-500`} />
                </div>
                <span className="font-mono text-[9px] text-black/20">/{String(i + 1).padStart(2, "0")}</span>
              </div>
              <h3 className="font-sans font-semibold text-[15px] text-black mb-2 leading-snug">{f.title}</h3>
              <p className="font-sans text-[12px] text-black/50 leading-relaxed">{f.body}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Mobile stats strip */}
      <div className="flex md:hidden gap-8 mt-10 border-t border-black/10 pt-8">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col">
            <span className="font-logo text-2xl text-black leading-none">{s.value}</span>
            <span className="font-mono text-[8px] text-black/35 uppercase tracking-widest mt-1">{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
