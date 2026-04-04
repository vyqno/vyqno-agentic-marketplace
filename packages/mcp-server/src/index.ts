#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const API_URL = process.env.AGENTNET_API_URL ?? "https://agentnet.xyz";
const API_KEY = process.env.AGENTNET_API_KEY ?? "";

function headers(): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (API_KEY) h["X-AgentNet-Key"] = API_KEY;
  return h;
}

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { ...headers(), ...(options?.headers ?? {}) },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`AgentNet API error ${res.status}: ${text}`);
  }
  return res.json();
}

const server = new McpServer({ name: "agentnet", version: "0.1.0" });

server.tool(
  "list_agents",
  "List all active AI agents on AgentNet. Returns name, description, price, skill tags, and query count. No API key needed for free agents.",
  {
    tag: z.string().optional().describe("Filter by skill tag, e.g. DeFi, Security, Research"),
    search: z.string().optional().describe("Search agents by name or description"),
  },
  async ({ tag, search }) => {
    const params = new URLSearchParams();
    if (tag) params.set("tags", tag);
    if (search) params.set("search", search);
    const data = await apiFetch(`/api/agents?${params}`);
    const agents = (data.agents ?? []) as any[];
    if (agents.length === 0) {
      return { content: [{ type: "text" as const, text: "No agents found." }] };
    }
    const lines = agents.map((a: any) => {
      const price = a.is_free ? "FREE" : `$${Number(a.price_usdc).toFixed(4)}/query`;
      const tags = a.skill_tags?.join(", ") ?? "—";
      return `**@${a.name}** — ${price}\n  ${(a.description ?? "").slice(0, 100)}...\n  Tags: ${tags} | Queries: ${(a.query_count ?? 0).toLocaleString()}`;
    });
    return {
      content: [{ type: "text" as const, text: `## AgentNet — ${agents.length} agent${agents.length !== 1 ? "s" : ""}\n\n${lines.join("\n\n")}` }],
    };
  }
);

server.tool(
  "get_agent",
  "Get full profile of a specific AgentNet agent including description, price, skill tags, and onchain wallet.",
  { name: z.string().describe("Agent name, e.g. solidity-auditor") },
  async ({ name }) => {
    const data = await apiFetch(`/api/agents/${encodeURIComponent(name)}`);
    const a = data.agent ?? data;
    const price = a.is_free ? "FREE" : `$${Number(a.price_usdc).toFixed(4)} USDC per query`;
    return {
      content: [{
        type: "text" as const,
        text: [
          `## @${a.name}`,
          `**Description:** ${a.description}`,
          `**Price:** ${price}`,
          `**Skill Tags:** ${a.skill_tags?.join(", ") ?? "none"}`,
          `**Total Queries:** ${(a.query_count ?? 0).toLocaleString()}`,
          `**Status:** ${a.status}`,
          a.wallet_address ? `**Wallet:** ${a.wallet_address} (Base Sepolia)` : "",
        ].filter(Boolean).join("\n"),
      }],
    };
  }
);

server.tool(
  "ask_agent",
  "Ask an AgentNet agent a question. Free agents answer instantly. Paid agents require AGENTNET_API_KEY with USDC credits (auto-deducted). The agent uses its private RAG knowledge base to answer.",
  {
    agent_name: z.string().describe("Agent name, e.g. solidity-auditor or defi-analyst"),
    question: z.string().describe("The question to ask"),
  },
  async ({ agent_name, question }) => {
    if (!API_KEY) {
      const data = await apiFetch(`/api/agents/${encodeURIComponent(agent_name)}`).catch(() => null);
      const a = data?.agent ?? data;
      if (a && !a.is_free) {
        return {
          content: [{
            type: "text" as const,
            text: `@${agent_name} is a paid agent ($${Number(a.price_usdc).toFixed(4)}/query). Set AGENTNET_API_KEY in your MCP config to use paid agents. Get a key at: ${API_URL}/connect`,
          }],
        };
      }
    }
    const data = await apiFetch(`/api/agents/${encodeURIComponent(agent_name)}/ask`, {
      method: "POST",
      body: JSON.stringify({ question }),
    });
    return {
      content: [{ type: "text" as const, text: `**@${agent_name} says:**\n\n${data.answer}` }],
    };
  }
);

server.tool(
  "find_best_agent",
  "Given a task description, find the best AgentNet agent for the job. Scores agents by skill tag and description match, returns top 3 with reasoning.",
  { task: z.string().describe("Describe what you need help with") },
  async ({ task }) => {
    const data = await apiFetch("/api/agents");
    const agents = (data.agents ?? []) as any[];
    const taskLower = task.toLowerCase();
    const scored = agents.map((a: any) => {
      let score = 0;
      const desc = (a.description ?? "").toLowerCase();
      const tags = (a.skill_tags ?? []).map((t: string) => t.toLowerCase());
      if (desc.includes(taskLower.slice(0, 20))) score += 3;
      tags.forEach((t: string) => { if (taskLower.includes(t)) score += 2; });
      taskLower.split(" ").forEach((word: string) => {
        if (word.length > 4 && (desc.includes(word) || tags.some((t: string) => t.includes(word)))) score += 1;
      });
      return { ...a, score };
    }).sort((a: any, b: any) => b.score - a.score).slice(0, 3);

    if (scored.length === 0 || scored[0].score === 0) {
      return { content: [{ type: "text" as const, text: "No strong match found. Try list_agents to browse all." }] };
    }
    const lines = scored.map((a: any, i: number) => {
      const price = a.is_free ? "FREE" : `$${Number(a.price_usdc).toFixed(4)}/query`;
      return `${i + 1}. **@${a.name}** (${price})\n   ${(a.description ?? "").slice(0, 120)}`;
    });
    return {
      content: [{ type: "text" as const, text: `## Best agents for: "${task}"\n\n${lines.join("\n\n")}\n\nUse ask_agent to query any of these.` }],
    };
  }
);

server.tool(
  "multi_agent_query",
  "Ask the same question to multiple agents simultaneously and compare their answers. Great for getting diverse expert perspectives.",
  {
    agent_names: z.array(z.string()).min(2).max(5).describe("List of 2-5 agent names to query"),
    question: z.string().describe("The question to ask all agents"),
  },
  async ({ agent_names, question }) => {
    const results = await Promise.allSettled(
      agent_names.map(async (name) => {
        const data = await apiFetch(`/api/agents/${encodeURIComponent(name)}/ask`, {
          method: "POST",
          body: JSON.stringify({ question }),
        });
        return { name, answer: data.answer };
      })
    );
    const sections = results.map((r, i) => {
      const name = agent_names[i];
      if (r.status === "fulfilled") return `### @${r.value.name}\n${r.value.answer}`;
      return `### @${name}\n⚠️ Error: ${(r.reason as Error).message}`;
    });
    return {
      content: [{ type: "text" as const, text: `## Multi-Agent Query: "${question}"\n\n${sections.join("\n\n---\n\n")}` }],
    };
  }
);

server.tool(
  "compare_agents",
  "Compare two AgentNet agents side by side — price, query count, skill tags, and description.",
  {
    agent_a: z.string().describe("First agent name"),
    agent_b: z.string().describe("Second agent name"),
  },
  async ({ agent_a, agent_b }) => {
    const [dataA, dataB] = await Promise.all([
      apiFetch(`/api/agents/${encodeURIComponent(agent_a)}`),
      apiFetch(`/api/agents/${encodeURIComponent(agent_b)}`),
    ]);
    const a = dataA.agent ?? dataA;
    const b = dataB.agent ?? dataB;
    const priceA = a.is_free ? "FREE" : `$${Number(a.price_usdc).toFixed(4)}`;
    const priceB = b.is_free ? "FREE" : `$${Number(b.price_usdc).toFixed(4)}`;
    return {
      content: [{
        type: "text" as const,
        text: [
          `## Agent Comparison`,
          `| | @${a.name} | @${b.name} |`,
          `|:--|:--|:--|`,
          `| Price/query | ${priceA} | ${priceB} |`,
          `| Total queries | ${(a.query_count ?? 0).toLocaleString()} | ${(b.query_count ?? 0).toLocaleString()} |`,
          `| Tags | ${a.skill_tags?.join(", ") ?? "—"} | ${b.skill_tags?.join(", ") ?? "—"} |`,
          ``,
          `**@${a.name}:** ${a.description}`,
          ``,
          `**@${b.name}:** ${b.description}`,
        ].join("\n"),
      }],
    };
  }
);

server.tool(
  "check_balance",
  "Check your AgentNet USDC credit balance. Requires AGENTNET_API_KEY to be set.",
  {},
  async () => {
    if (!API_KEY) {
      return { content: [{ type: "text" as const, text: `No AGENTNET_API_KEY configured. Get one at ${API_URL}/connect` }] };
    }
    const data = await apiFetch("/api/user/me");
    const credits = parseFloat(data?.usdc_credits ?? "0");
    return {
      content: [{ type: "text" as const, text: `**AgentNet Balance:** ${credits.toFixed(4)} USDC\n\nTop up at: ${API_URL}/profile` }],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`AgentNet MCP server running — ${API_URL}`);
}

main().catch(console.error);
