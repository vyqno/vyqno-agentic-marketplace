"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Send, User, Bot, Sparkles, AlertCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useFetchWithPayment } from "thirdweb/react";
import { client } from "@/lib/thirdweb";

const MOCK_MESSAGES = [
  { id: "1", role: "assistant", content: "Hello! I am StrategyCore. How can I assist you with your DeFi strategies today?" },
  { id: "2", role: "user", content: "What's the current outlook for ETH liquidity on Base?" },
  { id: "3", role: "assistant", content: "Based on current on-chain data, ETH liquidity on Base has increased by 14.5% over the last 24 hours. Most of it is concentrated in Aerodrome and Uniswap v3 pools." },
];

export default function ChatInterface({ 
  agentId, 
  agentName,
  priceUsdc,
  isFree 
}: { 
  agentId: string; 
  agentName: string;
  priceUsdc?: number;
  isFree?: boolean;
}) {
  const [messages, setMessages] = useState<{ id: string; role: string; content: string }[]>([
    { id: "1", role: "assistant", content: `Hello! I am ${agentName}. How can I assist you today?` }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // useFetchWithPayment auto-intercepts 402 responses, shows the thirdweb
  // payment modal, and retries with the payment header — zero extra code needed.
  const { fetchWithPayment, isPending: isPaymentPending } = useFetchWithPayment(client);

  const handleSend = async () => {
    if (!input.trim() || isLoading || isPaymentPending) return;

    const userMessage = { id: Date.now().toString(), role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const data = await fetchWithPayment(`/api/agents/${agentName}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMessage.content }),
      });

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: (data as any)?.answer ?? "No response received.",
      }]);
    } catch (err: any) {
      console.error("Chat error:", err);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Error: ${err?.message ?? "Something went wrong."}`,
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="h-[calc(100vh-200px)] flex flex-col glass border-black/5 shadow-premium overflow-hidden">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-black/5 bg-white/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-bold tracking-tight">{agentName} Interface</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-black text-foreground/40">
            {isFree ? "FREE" : `Cost: ${priceUsdc} USDC`}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className={cn(
                "flex gap-4 max-w-[85%]",
                message.role === "user" ? "ml-auto flex-row-reverse" : ""
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                message.role === "user" ? "bg-black text-white" : "bg-primary/20 text-primary border border-primary/10"
              )}>
                {message.role === "user" ? <User size={14} /> : <Bot size={14} />}
              </div>
              <div className={cn(
                "px-5 py-3 rounded-2xl text-sm leading-relaxed",
                message.role === "user" 
                   ? "bg-black text-white rounded-tr-none" 
                  : "bg-white/80 border border-black/5 text-foreground/80 rounded-tl-none shadow-sm shadow-black/5"
              )}>
                {message.content}
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex gap-4"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Bot size={14} className="animate-spin" />
              </div>
              <div className="bg-white/80 border border-black/5 px-5 py-3 rounded-2xl rounded-tl-none italic text-xs text-foreground/40">
                Thinking...
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Pay-per-query indicator */}
      <div className="px-6 py-2 bg-accent/10 flex items-center justify-center gap-2">
        <Sparkles className="w-3 h-3 text-primary" />
        <span className="text-[10px] font-bold text-primary tracking-widest uppercase">
          X402 Protocol Active: {isFree ? "Sponsoring Gasless Query" : `${priceUsdc} USDC per message`}
        </span>
      </div>

      {/* Input */}
      <div className="p-6 bg-white/40 border-t border-black/5">
        <div className="relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={isLoading || isPaymentPending}
            placeholder={isPaymentPending ? "Awaiting payment..." : `Ask ${agentName} something...`}
            className="w-full bg-white px-6 py-4 rounded-2xl text-sm border border-black/5 focus:outline-none focus:border-primary/30 transition-all duration-300 shadow-sm disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || isPaymentPending}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-black text-white hover:bg-black/80 transition-all duration-300 active:scale-90 disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="mt-3 text-[10px] text-center text-foreground/40 font-medium">
          Automated by AgentNet • Powered by Base
        </p>
      </div>
    </Card>
  );
}

// Internal Card component to avoid import issues
function Card({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={cn("rounded-3xl border border-black/10 overflow-hidden", className)}>
      {children}
    </div>
  );
}
