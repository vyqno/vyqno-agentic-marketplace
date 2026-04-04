"use client";

import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Brain, Cpu, Database, Globe, ShieldCheck, Zap } from "lucide-react";

export default function AgentProfileDetails({ agent }: { agent: any }) {
  return (
    <div className="flex flex-col gap-8">
      {/* Identity Card */}
      <Card className="shadow-premium border-black/5">
        <CardHeader className="pt-10 px-8 pb-10">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-3xl overflow-hidden border border-black/5 shadow-inner">
              <img src={agent.image} alt={agent.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <CardTitle className="text-4xl">{agent.name}</CardTitle>
                <Badge variant="accent">{agent.status}</Badge>
              </div>
              <CardDescription className="text-lg">{agent.handle}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-8 pb-10">
          <p className="text-foreground/70 text-lg leading-relaxed mb-8">
            {agent.description}
          </p>
          
          <div className="flex flex-wrap gap-2">
            <Badge variant="glass"><Brain className="w-3.5 h-3.5 mr-1" /> Neural-Llama 3</Badge>
            <Badge variant="glass"><Database className="w-3.5 h-3.5 mr-1" /> Vector-RAG</Badge>
            <Badge variant="glass"><Globe className="w-3.5 h-3.5 mr-1" /> Global Tools</Badge>
            <Badge variant="glass"><ShieldCheck className="w-3.5 h-3.5 mr-1" /> Audited</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-6 border-black/5">
          <span className="text-[11px] uppercase font-bold tracking-widest text-foreground/40 block mb-2">Success Rate</span>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black font-outfit">99.2%</span>
            <span className="text-xs font-bold text-green-500 mb-1">+0.4%</span>
          </div>
        </Card>
        <Card className="p-6 border-black/5">
          <span className="text-[11px] uppercase font-bold tracking-widest text-foreground/40 block mb-2">Total Queries</span>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black font-outfit">12.4k</span>
            <span className="text-xs font-bold text-foreground/30 mb-1">ALL TIME</span>
          </div>
        </Card>
      </div>

      {/* Capabilities */}
      <Card className="border-black/5">
        <CardHeader>
          <CardTitle className="text-xl">Capabilities</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4">
          <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/50">
            <Cpu className="w-5 h-5 text-primary mt-1" />
            <div>
              <h4 className="font-bold text-sm">Autonomous Execution</h4>
              <p className="text-xs text-foreground/60 leading-relaxed">
                Can execute transactions and interact with external protocols without human intervention.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/50">
            <Zap className="w-5 h-5 text-primary mt-1" />
            <div>
              <h4 className="font-bold text-sm">Real-time Analysis</h4>
              <p className="text-xs text-foreground/60 leading-relaxed">
                Processes data streams in real-time with sub-100ms latency.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
