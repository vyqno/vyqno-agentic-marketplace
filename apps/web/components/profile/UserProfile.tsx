"use client";

import { useActiveAccount } from "thirdweb/react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Loader2, Save, Plus, X, Upload, ExternalLink } from "lucide-react";
import Link from "next/link";

function Avatar({ seed, size = 80 }: { seed: string; size?: number }) {
  return (
    <img
      src={`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(seed)}`}
      alt="avatar"
      width={size}
      height={size}
      className="rounded-2xl border border-black/5"
    />
  );
}

function TagEditor({
  tags,
  onChange,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
}) {
  const [input, setInput] = useState("");
  const add = () => {
    const t = input.trim();
    if (t && !tags.includes(t)) onChange([...tags, t]);
    setInput("");
  };
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium"
          >
            {tag}
            <button onClick={() => onChange(tags.filter((t) => t !== tag))}>
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
          placeholder="Add skill tag…"
          className="flex-1 bg-white/50 border border-black/5 px-3 py-1.5 rounded-lg text-xs focus:outline-none focus:border-primary/30"
        />
        <button
          onClick={add}
          className="text-primary hover:text-primary/70 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

interface Agent {
  id: string;
  name: string;
  description: string;
  skill_tags: string[];
  is_free: boolean;
  price_usdc: number;
  query_count: number;
  status: string;
  image_url?: string;
}

function AgentRow({
  agent,
  ownerWallet,
  onUpdated,
}: {
  agent: Agent;
  ownerWallet: string;
  onUpdated: () => void;
}) {
  const [tags, setTags] = useState<string[]>(agent.skill_tags ?? []);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);

  const saveTags = async () => {
    setSaving(true);
    await fetch(`/api/agents/${agent.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skill_tags: tags, owner_wallet: ownerWallet }),
    });
    setSaving(false);
    onUpdated();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadMsg(null);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`/api/agents/${agent.id}/documents`, {
      method: "POST",
      body: fd,
    });
    const json = await res.json();
    setUploadMsg(res.ok ? `✓ ${json.message}` : `✗ ${json.error}`);
    setUploading(false);
    e.target.value = "";
  };

  return (
    <Card className="border-black/5">
      <CardContent className="p-6 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar seed={agent.name} size={48} />
            <div>
              <Link href={`/agent/${agent.id}`} className="font-bold hover:text-primary transition-colors flex items-center gap-1">
                @{agent.name} <ExternalLink className="w-3 h-3 opacity-40" />
              </Link>
              <p className="text-xs text-foreground/50 line-clamp-1 max-w-xs">{agent.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant={agent.status === "active" ? "accent" : "glass"}>{agent.status}</Badge>
            <span className="text-xs font-bold text-foreground/50">
              {agent.is_free ? "FREE" : `$${Number(agent.price_usdc).toFixed(4)}`}
            </span>
          </div>
        </div>

        <div>
          <p className="text-[10px] uppercase font-bold tracking-widest text-foreground/40 mb-2">Skill Tags</p>
          <TagEditor tags={tags} onChange={setTags} />
          {JSON.stringify(tags) !== JSON.stringify(agent.skill_tags) && (
            <Button size="sm" onClick={saveTags} disabled={saving} className="mt-3 gap-1.5 text-xs h-7 px-3">
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
              Save tags
            </Button>
          )}
        </div>

        <div>
          <p className="text-[10px] uppercase font-bold tracking-widest text-foreground/40 mb-2">Upload Knowledge (.md, max 10 MB)</p>
          <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-primary hover:text-primary/70 transition-colors">
            <Upload className="w-3.5 h-3.5" />
            {uploading ? "Indexing…" : "Choose file"}
            <input
              type="file"
              accept=".md"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>
          {uploadMsg && (
            <p className={`mt-1 text-[11px] font-medium ${uploadMsg.startsWith("✓") ? "text-green-600" : "text-red-500"}`}>
              {uploadMsg}
            </p>
          )}
        </div>

        <div className="text-[10px] text-foreground/30 font-mono">
          {agent.query_count ?? 0} total queries
        </div>
      </CardContent>
    </Card>
  );
}

export default function UserProfile() {
  const account = useActiveAccount();
  const wallet = account?.address ?? null;

  const [profile, setProfile] = useState<{ display_name?: string; avatar_seed?: string; bio?: string } | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editAvatarSeed, setEditAvatarSeed] = useState("");

  const fetchProfile = async (w: string) => {
    setLoadingProfile(true);
    const [pRes, aRes] = await Promise.all([
      fetch(`/api/user?wallet=${w}`),
      fetch(`/api/agents?owner_wallet=${w}&limit=50`),
    ]);
    const pJson = await pRes.json();
    const aJson = await aRes.json();
    const p = pJson.user ?? {};
    setProfile(p);
    setEditName(p.display_name ?? "");
    setEditBio(p.bio ?? "");
    setEditAvatarSeed(p.avatar_seed ?? "");
    setAgents(aJson.agents ?? []);
    setLoadingProfile(false);
  };

  useEffect(() => {
    if (!wallet) return;
    fetchProfile(wallet);
  }, [wallet]);

  const saveProfile = async () => {
    if (!wallet) return;
    setSavingProfile(true);
    await fetch("/api/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        wallet_address: wallet,
        display_name: editName || null,
        bio: editBio || null,
        avatar_seed: editAvatarSeed || null,
      }),
    });
    await fetchProfile(wallet);
    setSavingProfile(false);
  };

  if (!wallet) {
    return (
      <div className="pt-40 text-center text-foreground/40 font-medium">
        Connect your wallet to view your profile.
      </div>
    );
  }

  if (loadingProfile) {
    return (
      <div className="pt-40 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-foreground/30" />
      </div>
    );
  }

  const avatarSeed = editAvatarSeed || wallet;
  const shortWallet = `${wallet.slice(0, 6)}…${wallet.slice(-4)}`;

  return (
    <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto flex flex-col gap-12">
      {/* Identity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-black/5 shadow-premium">
          <CardHeader className="pt-10 px-8 pb-4">
            <CardTitle className="text-2xl">Your Profile</CardTitle>
          </CardHeader>
          <CardContent className="px-8 pb-10 flex flex-col gap-8">
            <div className="flex items-start gap-6">
              <div className="flex flex-col items-center gap-3">
                <Avatar seed={avatarSeed} size={80} />
                <p className="text-[10px] text-foreground/40 font-mono">{shortWallet}</p>
              </div>
              <div className="flex-1 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-foreground/40">Display Name</label>
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Your name or alias"
                    className="bg-white/50 border border-black/5 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-primary/30 transition-all font-medium"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-foreground/40">Bio</label>
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="What do you build?"
                    rows={2}
                    className="bg-white/50 border border-black/5 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-primary/30 transition-all font-medium resize-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-foreground/40">Avatar Seed (any text)</label>
                  <input
                    value={editAvatarSeed}
                    onChange={(e) => setEditAvatarSeed(e.target.value)}
                    placeholder="Leave blank to use wallet address"
                    className="bg-white/50 border border-black/5 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-primary/30 transition-all font-medium font-mono"
                  />
                </div>
                <Button onClick={saveProfile} disabled={savingProfile} className="self-start gap-2">
                  {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Profile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Agents */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-outfit font-black text-2xl tracking-tight">Your Agents</h2>
          <Link href="/create">
            <Button variant="outline" size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Deploy New
            </Button>
          </Link>
        </div>
        {agents.length === 0 ? (
          <p className="text-foreground/40 text-sm font-medium">No agents deployed yet.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {agents.map((agent) => (
              <AgentRow
                key={agent.id}
                agent={agent}
                ownerWallet={wallet}
                onUpdated={() => fetchProfile(wallet)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
