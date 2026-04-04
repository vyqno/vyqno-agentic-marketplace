"use client";

import { useActiveAccount } from "thirdweb/react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Copy, Plus, Trash2, Key, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

interface ApiKey {
  id: string;
  key: string;
  label: string;
  created_at: string;
  last_used_at: string | null;
}

export default function ConnectPage() {
  const account = useActiveAccount();
  const wallet = account?.address ?? null;
  const appUrl = typeof window !== "undefined" ? window.location.origin : "https://your-app.vercel.app";

  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState("");

  const fetchKeys = async (w: string) => {
    setLoading(true);
    const res = await fetch(`/api/keys?wallet=${w}`);
    const json = await res.json();
    setKeys(json.keys ?? []);
    setLoading(false);
  };

  useEffect(() => {
    if (wallet) fetchKeys(wallet);
  }, [wallet]);

  const createKey = async () => {
    if (!wallet) return;
    setCreating(true);
    await fetch("/api/keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wallet_address: wallet, label: newLabel || "Default" }),
    });
    setNewLabel("");
    await fetchKeys(wallet);
    setCreating(false);
  };

  const deleteKey = async (id: string) => {
    if (!wallet) return;
    await fetch(`/api/keys?id=${id}&wallet=${wallet}`, { method: "DELETE" });
    setKeys((prev) => prev.filter((k) => k.id !== id));
  };

  const copyKey = (k: ApiKey) => {
    navigator.clipboard.writeText(k.key);
    setCopiedId(k.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!wallet) {
    return (
      <div className="pt-40 text-center text-foreground/40 font-medium">
        Connect your wallet to get an API key.
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 px-6 max-w-3xl mx-auto flex flex-col gap-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-outfit font-black text-5xl tracking-tight mb-3">
          Connect to AgentNet
        </h1>
        <p className="text-foreground/60 font-medium max-w-xl">
          Use your API key to query agents from Claude Desktop, Cursor, or any MCP-compatible AI client. Credits are shared with your web account.
        </p>
      </motion.div>

      <Card className="border-black/5 bg-black text-white overflow-hidden">
        <CardHeader className="px-8 pt-8 pb-4">
          <CardTitle className="text-white text-lg">Quick Install — Claude Desktop</CardTitle>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <pre className="text-xs text-white/70 leading-relaxed overflow-x-auto whitespace-pre-wrap">{`// ~/Library/Application Support/Claude/claude_desktop_config.json
{
  "mcpServers": {
    "agentnet": {
      "command": "npx",
      "args": ["-y", "agentnet-mcp"],
      "env": {
        "AGENTNET_API_KEY": "sk-agentnet-YOUR_KEY_HERE",
        "AGENTNET_API_URL": "${appUrl}"
      }
    }
  }
}`}</pre>
        </CardContent>
      </Card>

      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-outfit font-black text-2xl">Your API Keys</h2>
          <div className="flex items-center gap-2">
            <input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createKey()}
              placeholder="Label (optional)"
              className="bg-white/50 border border-black/5 px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-primary/30 w-40"
            />
            <Button onClick={createKey} disabled={creating} className="gap-2">
              <Plus className="w-4 h-4" />
              {creating ? "Creating…" : "New Key"}
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : keys.length === 0 ? (
          <p className="text-foreground/40 text-sm font-medium py-8 text-center">
            No API keys yet. Create one above.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {keys.map((k) => (
              <Card key={k.id} className="border-black/5">
                <CardContent className="p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <Key className="w-4 h-4 text-foreground/30 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{k.label}</p>
                      <p className="text-xs font-mono text-foreground/40 truncate">
                        {k.key.slice(0, 24)}••••••••
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="glass" className="text-[10px]">
                      {k.last_used_at
                        ? `Used ${new Date(k.last_used_at).toLocaleDateString()}`
                        : "Never used"}
                    </Badge>
                    <button
                      onClick={() => copyKey(k)}
                      className="p-2 rounded-lg hover:bg-black/5 transition-colors text-foreground/40 hover:text-foreground"
                    >
                      {copiedId === k.id ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteKey(k.id)}
                      className="p-2 rounded-lg hover:bg-red-50 transition-colors text-foreground/40 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
