"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { MessageSquare, X, ArrowUpRight, Filter } from "lucide-react";

import { useEffect, useState } from "react";
import Link from "next/link";

interface AgentGridProps {
  searchQuery?: string;
}

export default function AgentGrid({ searchQuery }: AgentGridProps) {
  const [agents, setAgents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const fetchAgents = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/agents");
        const data = await response.json();
        const sorted = (data.agents || []).sort(
          (a: any, b: any) => (b.query_count ?? 0) - (a.query_count ?? 0)
        );
        setAgents(sorted);
      } catch (err) {
        console.error("Failed to fetch agents:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAgents();
  }, []);

  const allTags = [
    "All",
    ...Array.from(new Set(agents.flatMap((a: any) => a.skill_tags ?? []))).slice(0, 8),
  ];

  const filteredAgents = agents
    .filter((a) => filter === "All" || a.skill_tags?.includes(filter))
    .filter((a) => {
      if (!searchQuery?.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        a.name?.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q)
      );
    });

  if (isLoading) {
    return (
      <div className="py-40 flex flex-col items-center justify-center gap-6">
        <div className="w-12 h-[1px] bg-black/10 overflow-hidden">
          <motion.div 
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="w-full h-full bg-accent"
          />
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.4em] opacity-40">Loading_Nexus</span>
      </div>
    );
  }

  return (
    <section className="relative py-24 px-6 lg:px-12 max-w-[1600px] mx-auto border-x border-black/5">
      
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-20">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <h2 className="font-logo text-5xl md:text-6xl tracking-tighter text-black">
              intelligence
            </h2>
            <div className="h-[1px] flex-1 bg-black/5 min-w-[40px]" />
          </div>
          <div className="flex items-center gap-2 font-mono text-[9px] opacity-40 uppercase tracking-[0.2em]">
            <span>Active_Agents_Catalogue_01</span>
            <div className="w-1 h-1 bg-accent animate-pulse" />
            <span>Live Registry</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-8 gap-y-4 font-mono text-[10px] uppercase tracking-widest border-l border-black/5 pl-8">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setFilter(tag)}
              className={`relative transition-all ${
                filter === tag ? "text-accent font-bold" : "text-black/40 hover:text-black"
              }`}
            >
              {tag}
              {filter === tag && (
                <motion.div 
                  layoutId="filter-dot"
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-accent" 
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Magazine Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border-t border-l border-black/5">
        {filteredAgents.map((agent, index) => {
          const isFeatured = index === 0 && filter === "All";
          return (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05, duration: 0.5 }}
              className={`group border-r border-b border-black/5 transition-all duration-500 hover:bg-muted/30 ${
                isFeatured ? "md:col-span-2 md:row-span-2" : ""
              }`}
            >
              <Link href={`/agent/${agent.id}`} className="block h-full p-8 md:p-12 focus:outline-none">
                <article className="h-full flex flex-col justify-between">
                  
                  {/* Top: Metadata & Tier */}
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex flex-col gap-1">
                      <span className="font-mono text-[9px] opacity-30 uppercase tracking-widest">Id_{index + 1}</span>
                      <span className="flex items-center gap-1.5 font-mono text-[9px] font-bold text-accent uppercase tracking-tighter">
                        <ArrowUpRight className="w-3 h-3" />
                        {isFeatured ? "Featured_Node" : "Active_Node"}
                      </span>
                    </div>
                    {agent.is_free && (
                      <span className="px-2 py-0.5 border border-black/10 font-mono text-[8px] uppercase tracking-widest">
                        Open_Src
                      </span>
                    )}
                  </div>

                  {/* Middle: Name & Image */}
                  <div className="flex flex-col gap-6 mb-12">
                    <div className="relative w-24 h-24 overflow-hidden border border-black/5 grayscale group-hover:grayscale-0 transition-all duration-1000">
                      <img
                        src={agent.image_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${agent.name}`}
                        alt={agent.name}
                        className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-1000"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <h3 className={`font-logo uppercase tracking-tighter text-black ${isFeatured ? 'text-4xl md:text-5xl' : 'text-2xl'}`}>
                        {agent.name}
                      </h3>
                      <p className="text-black/50 text-xs font-mono uppercase tracking-widest line-clamp-2 max-w-sm">
                        {agent.description}
                      </p>
                    </div>
                  </div>

                  {/* Bottom: Transaction Specs */}
                  <div className="mt-auto flex flex-col gap-8">
                    <div className="flex items-center gap-8 font-mono text-[9px] uppercase tracking-[0.2em] opacity-40">
                      <div className="flex flex-col gap-1">
                        <span>Price</span>
                        <span className="font-bold text-black opacity-100">{agent.is_free ? "Free" : `${agent.price_usdc} USDC`}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span>Queries</span>
                        <span className="font-bold text-black opacity-100">{(agent.query_count ?? 0).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 group-hover:gap-4 transition-all duration-500">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em]">Initialize_Access</span>
                      <div className="h-[1px] w-8 bg-black/20 origin-left scale-x-100 group-hover:scale-x-150 transition-transform duration-500" />
                    </div>
                  </div>
                </article>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div className="mt-32 flex flex-col items-center gap-8">
        <Link href="/browse">
          <Button variant="outline" className="px-12 py-6 border-black/5 hover:border-black/20 hover:bg-black/5">
            <span className="font-mono text-[10px] tracking-[0.4em] uppercase">Browse_Full_Registry</span>
          </Button>
        </Link>
        <span className="font-mono text-[8px] opacity-20 uppercase tracking-[0.6em]">End_Of_Top_Tier_Registry</span>
      </div>

    </section>
  );
}
