"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Bot, MessageSquare, TrendingUp, Zap } from "lucide-react";
import Image from "next/image";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AgentGrid() {
  const [agents, setAgents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const fetchAgents = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/agents");
        const data = await response.json();
        setAgents(data.agents || []);
      } catch (err) {
        console.error("Failed to fetch agents:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAgents();
  }, []);

  const filteredAgents = filter === "All" 
    ? agents 
    : agents.filter(a => a.skill_tags?.includes(filter) || a.category === filter);

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <div className="py-20 text-center text-foreground/40 font-medium">
        No agents found on the network yet.
      </div>
    );
  }
  return (
    <section className="relative py-20 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
        <div>
          <h2 className="font-outfit font-black text-4xl tracking-tight text-foreground mb-4">
            Trending Agents
          </h2>
          <p className="text-foreground/60 font-medium max-w-md">
            Discover the most efficient autonomous intelligences currently deployed on the network.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="glass" className="py-2 px-4 cursor-pointer hover:bg-black/5 transition-colors">All</Badge>
          <Badge variant="glass" className="py-2 px-4 cursor-pointer hover:bg-black/5 transition-colors">DeFi</Badge>
          <Badge variant="glass" className="py-2 px-4 cursor-pointer hover:bg-black/5 transition-colors">Writing</Badge>
          <Badge variant="glass" className="py-2 px-4 cursor-pointer hover:bg-black/5 transition-colors">Security</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredAgents.map((agent, index) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: index * 0.1, duration: 0.8, ease: "easeOut" }}
          >
            <Card className="h-full flex flex-col group/card relative">
              <CardHeader className="relative overflow-hidden pt-10 px-8">
                <div className="absolute top-0 right-0 p-4">
                  <Badge variant={agent.status === "active" ? "accent" : "secondary"}>
                    {agent.status}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-black/5 shadow-inner">
                    <img 
                      src={agent.image_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${agent.name}`} 
                      alt={agent.name} 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover/card:bg-transparent transition-colors duration-500" />
                  </div>
                  <div>
                    <CardTitle className="text-xl mb-1">{agent.name}</CardTitle>
                    <CardDescription>{agent.ens_name ? `@${agent.ens_name}` : `@${agent.name}.agent`}</CardDescription>
                  </div>
                </div>
                
                <div className="h-20 lg:h-24">
                  <p className="text-foreground/70 text-sm leading-relaxed line-clamp-3">
                    {agent.description}
                  </p>
                </div>
              </CardHeader>
              
              <CardContent className="px-8 pb-4">
                <div className="grid grid-cols-2 gap-4 py-4 border-y border-black/5">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-foreground/40">Efficiency</span>
                    <div className="flex items-center gap-1.5 text-primary">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span className="font-mono font-bold text-sm tracking-tight">{agent.efficiency || "98.5%"}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-foreground/40">Queries</span>
                    <div className="flex items-center gap-1.5 text-foreground/70">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span className="font-mono font-bold text-sm tracking-tight">{agent.query_count || 0}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="px-8 pb-10 flex items-center justify-between mt-auto">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-foreground/40 mb-1">Pricing</span>
                  <span className="font-outfit font-black text-foreground">
                    {agent.is_free ? "FREE" : `${agent.price_usdc} USDC`}
                  </span>
                </div>
                <Link href={`/agent/${agent.id}`}>
                  <Button size="sm" className="shadow-premium px-6">Interact</Button>
                </Link>
              </CardFooter>
              
              {/* Subtle light-blue glow on hover */}
              <div className="absolute inset-0 rounded-2xl border-2 border-primary/0 pointer-events-none group-hover/card:border-primary/10 transition-all duration-500 shadow-[0_0_40px_rgba(160,210,235,0)] group-hover/card:shadow-[0_0_40px_rgba(160,210,235,0.2)]" />
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-20 text-center"
      >
        <Button variant="outline" size="lg" className="px-10">
          Load More Agents
        </Button>
      </motion.div>
    </section>
  );
}
