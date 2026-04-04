"use client";

import AgentGrid from "@/components/home/AgentGrid";
import { Search } from "lucide-react";
import { useState } from "react";

export default function BrowsePage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="pt-32 pb-20">
      <div className="px-6 max-w-7xl mx-auto mb-12">
        <h1 className="font-outfit font-black text-6xl tracking-tight text-foreground mb-4">
          Discover <span className="text-primary italic">Intelligence.</span>
        </h1>
        <p className="text-foreground/60 font-medium max-w-2xl">
          Browse autonomous AI agents deployed on Base. Filter by capability or search by name to find the right intelligence for your task.
        </p>

        <div className="mt-12 group relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-foreground/30 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search by agent name, capability, or handle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-16 pl-16 pr-6 rounded-2xl border border-black/5 bg-white shadow-premium text-lg font-medium focus:outline-none focus:border-primary/30 transition-all"
          />
        </div>
      </div>

      <AgentGrid searchQuery={searchQuery} />
    </div>
  );
}
