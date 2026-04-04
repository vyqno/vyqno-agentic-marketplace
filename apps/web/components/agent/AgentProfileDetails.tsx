"use client";

import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Brain, Database, ExternalLink, MessageSquare, Wallet } from "lucide-react";

export default function AgentProfileDetails({ agent }: { agent: any }) {
  const tags: string[] = agent.skillTags ?? agent.skill_tags ?? [];
  const queryCount: number = agent.queryCount ?? agent.query_count ?? 0;
  const walletAddress: string = agent.walletAddress ?? agent.wallet_address ?? "";
  const shortWallet = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : "—";

  return (
    <div className="flex flex-col gap-8">
      {/* Identity Card */}
      <Card className="shadow-premium border-black/5">
        <CardHeader className="pt-10 px-8 pb-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border border-black/5 shadow-inner shrink-0">
              <img src={agent.image} alt={agent.name} className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <CardTitle className="text-3xl truncate">{agent.name}</CardTitle>
                <Badge variant="accent">{agent.status}</Badge>
              </div>
              <CardDescription className="text-base">{agent.handle}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-8 pb-8 flex flex-col gap-6">
          <p className="text-foreground/70 text-base leading-relaxed">
            {agent.description}
          </p>

          {/* Skill tags from DB */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag: string) => (
                <Badge key={tag} variant="glass">{tag}</Badge>
              ))}
            </div>
          )}

          {/* Always-true capability badges */}
          <div className="flex flex-wrap gap-2 pt-1 border-t border-black/5">
            <Badge variant="glass"><Brain className="w-3 h-3 mr-1" /> Llama 3.3-70b</Badge>
            <Badge variant="glass"><Database className="w-3 h-3 mr-1" /> pgvector RAG</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Real stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-6 border-black/5">
          <span className="text-[11px] uppercase font-bold tracking-widest text-foreground/40 block mb-2">
            Total Queries
          </span>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black font-outfit">{queryCount.toLocaleString()}</span>
            <MessageSquare className="w-4 h-4 text-foreground/30 mb-1" />
          </div>
        </Card>
        <Card className="p-6 border-black/5">
          <span className="text-[11px] uppercase font-bold tracking-widest text-foreground/40 block mb-2">
            Price per Query
          </span>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black font-outfit">
              {agent.isFree ? "FREE" : `$${Number(agent.priceUsdc ?? 0).toFixed(4)}`}
            </span>
          </div>
        </Card>
      </div>

      {/* On-chain identity */}
      {walletAddress && (
        <Card className="border-black/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Wallet className="w-4 h-4 text-primary" />
              On-chain Identity
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-foreground/40 uppercase font-bold tracking-widest">Agent Wallet</span>
              <a
                href={`https://sepolia.basescan.org/address/${walletAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm font-mono text-primary hover:underline"
              >
                {shortWallet}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-foreground/40 uppercase font-bold tracking-widest">Network</span>
              <span className="text-sm font-semibold text-foreground/70">Base Sepolia</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-foreground/40 uppercase font-bold tracking-widest">Payment</span>
              <span className="text-sm font-semibold text-foreground/70">USDC via x402</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
