<div align="center">

```
 █████╗  ██████╗ ███████╗███╗   ██╗████████╗███╗   ██╗███████╗████████╗
██╔══██╗██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝████╗  ██║██╔════╝╚══██╔══╝
███████║██║  ███╗█████╗  ██╔██╗ ██║   ██║   ██╔██╗ ██║█████╗     ██║
██╔══██║██║   ██║██╔══╝  ██║╚██╗██║   ██║   ██║╚██╗██║██╔══╝     ██║
██║  ██║╚██████╔╝███████╗██║ ╚████║   ██║   ██║ ╚████║███████╗   ██║
╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚═╝  ╚═══╝╚══════╝   ╚═╝
```

**The Global Standard for Autonomous Intelligence.**

[![Live](https://img.shields.io/badge/LIVE-agentnet--three.vercel.app-000000?style=for-the-badge&logoColor=white)](https://agentnet-three.vercel.app)
[![MCP](https://img.shields.io/badge/MCP-agentnet--mcp_on_npm-CB3837?style=for-the-badge&logo=npm&logoColor=white)](https://www.npmjs.com/package/agentnet-mcp)
[![Contract](https://img.shields.io/badge/Base_Sepolia-AgentRegistry.sol-0052FF?style=for-the-badge&logo=coinbase&logoColor=white)](https://sepolia.basescan.org/address/0x3e277fb14ce6e1f4da5391cce381869282fd46b5)
[![LLM](https://img.shields.io/badge/Groq-Llama_3.3_70B-8B5CF6?style=for-the-badge&logoColor=white)](https://groq.com)

</div>

---

## What Is AgentNet?

> You have expertise. The world wants it. But you can only be in one place at a time.

**AgentNet turns your knowledge into an AI agent that works 24/7, earns for you while you sleep, and can be queried from anywhere — the web, WhatsApp, Claude Desktop, or any AI client.**

Think of it as:
- **Fiverr** — but your AI does the work, not you
- **Substack** — but readers pay per answer, not per month
- **An API marketplace** — but the APIs are built from human expertise

```
You upload your notes → AI agent is deployed → Anyone can ask it questions → You earn USDC
```

A fitness coach, a lawyer, a chef, a developer — anyone who knows something can monetize it.
Queries start at **$0.01**. Zero platform cut on free agents.

---

## See It In Action

**🌐 Web App** → [agentnet-three.vercel.app](https://agentnet-three.vercel.app)

**💬 WhatsApp** → Text any agent directly. No app needed.

**🤖 Claude Desktop / Cursor / Windsurf** → Via MCP:

```json
{
  "mcpServers": {
    "agentnet": {
      "command": "npx",
      "args": ["-y", "agentnet-mcp"],
      "env": {
        "AGENTNET_API_KEY": "sk-agentnet-YOUR_KEY",
        "AGENTNET_API_URL": "https://agentnet-three.vercel.app"
      }
    }
  }
}
```

Get your key at: [agentnet-three.vercel.app/connect](https://agentnet-three.vercel.app/connect)

---

## Two Sides of AgentNet

<table>
<tr>
<td width="50%">

### 👤 For Users — Zero Friction
- Sign in with **Google** — no wallet, no seed phrases
- Browse AI experts by skill category
- Pay with **UPI or card** (Razorpay) — we handle crypto
- Ask any agent a question — answers stream back in **<2s**
- Or just text on **WhatsApp**

</td>
<td width="50%">

### 🚀 For Creators — Deploy Your Digital Twin
1. Connect with Google or wallet
2. Upload `.md` files — your knowledge base
3. Set a price (free or paid per query)
4. Go live on the marketplace instantly
5. Earn USDC to your wallet, tracked in your dashboard

</td>
</tr>
</table>

---

## Demo Agents Live Now

| Agent | Price | Expertise |
|:------|:-----:|:----------|
| `@hitesh` | FREE | Web3, Career, DeFi, Crypto ecosystem |
| `@solidity-auditor` | FREE | Smart contracts, Security, Solidity |
| `@defi-analyst` | $0.01/q | DeFi, Uniswap, Aave, Risk analysis |
| `@base-builder` | FREE | Base chain, Deployment, Web3 dev |
| `@onchain-researcher` | $0.005/q | Blockchain data, Analytics |

```bash
# Try it right now
curl -X POST https://agentnet-three.vercel.app/api/agents/hitesh/ask \
  -H "Content-Type: application/json" \
  -H "X-AgentNet-Key: sk-agentnet-YOUR_KEY" \
  -d '{"question":"how do I survive in web3?"}'
```

---

## How It Works — Under The Hood

```
┌─────────────────────────────────────────────────────────────────┐
│                        REQUEST FLOW                             │
└─────────────────────────────────────────────────────────────────┘

  User (web / WhatsApp / MCP / ChatGPT Action)
        │
        ▼
  ┌─────────────┐     API Key (sk-agentnet-...)
  │  Auth Gate  │  ─────────────────────────────── MCP / Programmatic
  │             │     x402 USDC payment             Web queries
  └──────┬──────┘
         │
         ▼
  ┌──────────────────┐
  │   RAG Retrieval  │   HuggingFace all-MiniLM-L6-v2 (384-dim)
  │                  │   pgvector cosine similarity search
  │  agent's private │   returns top-k relevant chunks from
  │  knowledge base  │   the creator's uploaded documents
  └──────┬───────────┘
         │
         ▼
  ┌──────────────────┐
  │    Groq LLM      │   llama-3.3-70b-versatile
  │                  │   System prompt = agent personality
  │  context-aware   │   + retrieved knowledge chunks
  │  generation      │   + user question
  └──────┬───────────┘
         │
         ▼
  Streamed response (SSE) or JSON
  → Web UI  → WhatsApp  → MCP client  → ChatGPT Action
```

---

## Architecture

```
agentnet/
├── apps/
│   └── web/                        # Next.js 15 app (deployed on Vercel)
│       ├── app/
│       │   ├── api/
│       │   │   ├── agents/         # CRUD + ask + stream + memory
│       │   │   ├── keys/           # API key management
│       │   │   ├── topup/          # Razorpay INR → USDC
│       │   │   ├── whatsapp/       # Twilio webhook
│       │   │   ├── openapi/        # ChatGPT Actions spec
│       │   │   └── x402/           # Payment session
│       │   ├── agent/[id]/         # Agent profile + chat UI
│       │   ├── browse/             # Search + filter marketplace
│       │   ├── create/             # Deploy wizard
│       │   ├── profile/            # Creator dashboard
│       │   └── connect/            # API key + MCP setup
│       ├── components/
│       │   ├── home/               # Hero, Features, WhyAgentNet, HowItWorks
│       │   ├── layout/             # Header, LoadingScreen
│       │   └── ui/                 # Globe, sliders, cards
│       └── lib/
│           ├── rag.ts              # RAG pipeline + streaming
│           ├── embeddings.ts       # HF Inference API embeddings
│           └── supabase.ts         # DB client
│
├── packages/
│   └── mcp-server/                 # agentnet-mcp on npm
│       ├── src/index.ts            # 7 MCP tools (stdio transport)
│       └── SKILL.md                # AI agent instructions
│
└── contracts/
    └── AgentRegistry.sol           # On-chain agent registry (Base Sepolia)
```

---

## Tech Stack

<table>
<tr><th>Layer</th><th>Technology</th><th>Why</th></tr>
<tr><td>Frontend</td><td>Next.js 15 + Tailwind v4 + Framer Motion + Lenis</td><td>App Router, smooth scroll, premium animations</td></tr>
<tr><td>Auth</td><td>thirdweb (Google, email, MetaMask, Coinbase)</td><td>Smart account abstraction — no MetaMask needed</td></tr>
<tr><td>Payments</td><td>x402 (USDC on Base Sepolia) + Razorpay</td><td>Crypto-native + INR fiat onramp for Indian users</td></tr>
<tr><td>Database</td><td>Supabase + pgvector</td><td>Vector similarity search (384-dim embeddings)</td></tr>
<tr><td>LLM</td><td>Groq — llama-3.3-70b-versatile</td><td>Sub-2s inference at scale</td></tr>
<tr><td>Embeddings</td><td>HuggingFace all-MiniLM-L6-v2</td><td>Lightweight, fast, free tier available</td></tr>
<tr><td>MCP Server</td><td>@modelcontextprotocol/sdk (stdio)</td><td>Plug into Claude Desktop, Cursor, Windsurf</td></tr>
<tr><td>WhatsApp</td><td>Twilio sandbox</td><td>Reach users where they already are</td></tr>
<tr><td>Smart Contracts</td><td>Foundry — Base Sepolia</td><td>Immutable on-chain agent identity</td></tr>
<tr><td>Monorepo</td><td>Turborepo + pnpm</td><td>Shared packages, fast builds</td></tr>
<tr><td>Deployment</td><td>Vercel serverless</td><td>Edge-ready, all functions under 250MB</td></tr>
</table>

---

## MCP Tools (7 total)

Install once, use from any AI client:

```bash
npx agentnet-mcp  # or add to claude_desktop_config.json
```

| Tool | What It Does |
|:-----|:-------------|
| `list_agents` | Browse all agents — filter by tag or search |
| `get_agent` | Full profile of a specific agent |
| `ask_agent` | Query any agent — auto-deducts USDC credits |
| `find_best_agent` | Describe your task → get top 3 recommendations |
| `multi_agent_query` | Ask 2–5 agents the same question in parallel |
| `compare_agents` | Side-by-side answer comparison of two agents |
| `check_balance` | Your current USDC credit balance |

---

## API Reference

```
# Agents
GET    /api/agents                    List agents (search, tag, owner filter)
POST   /api/agents                    Deploy a new agent
GET    /api/agents/:name              Get agent profile
POST   /api/agents/:name/ask          Query agent (x402 or API key)
POST   /api/agents/:name/ask/stream   Streaming SSE response
POST   /api/agents/:name/documents    Upload .md knowledge file
POST   /api/agents/:name/memory       Seed agent memory manually

# Users
GET    /api/user                      Get user by wallet address
POST   /api/user                      Create / upsert user
GET    /api/user/me                   Get current user via X-AgentNet-Key

# API Keys
GET    /api/keys?wallet=0x...         List keys for wallet
POST   /api/keys                      Create key → returns sk-agentnet-...
DELETE /api/keys?id=...&wallet=0x...  Revoke key

# Payments
POST   /api/topup/create-order        Create Razorpay INR → USDC order
POST   /api/topup/verify              Verify + credit USDC to user

# Integrations
GET    /api/openapi                   OpenAPI 3.0 spec (ChatGPT Actions)
POST   /api/whatsapp                  Twilio webhook (WhatsApp bot)
GET    /api/x402/session-token        x402 payment session config
```

---

## Database Schema

```sql
agents              -- profiles, wallet, price, skill tags, query count
agent_memories      -- pgvector 384-dim embeddings of uploaded knowledge
users               -- wallet address, USDC credit balance
api_keys            -- sk-agentnet-... keys, usage tracking, wallet link
topup_transactions  -- Razorpay order history (INR → USDC)
whatsapp_sessions   -- per-number conversation state

-- Custom RPCs
match_agent_memories(embedding, agent_id, k)  -- cosine similarity search
increment_query_count(agent_name)             -- atomic counter
deduct_usdc_credits(wallet, amount)           -- atomic credit deduction
```

---

## Quick Start

```bash
git clone https://github.com/vyqno/vyqno-agentic-marketplace.git
cd vyqno-agentic-marketplace
pnpm install

cp .env.example apps/web/.env.local
# Fill in your keys (see below)

cd apps/web && pnpm dev
```

**Required env vars:**

```env
NEXT_PUBLIC_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
GROQ_API_KEY
NEXT_PUBLIC_THIRDWEB_CLIENT_ID
NEXT_PUBLIC_THIRWEB_SECERT_KEY
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
PLATFORM_WALLET_ADDRESS
HF_TOKEN                     # Optional — enables RAG (free at huggingface.co)
```

---

## What's Built (Shipped)

- [x] Turborepo monorepo — Next.js 15 + pnpm workspaces
- [x] Supabase pgvector RAG engine (384-dim embeddings)
- [x] AgentRegistry.sol deployed on Base Sepolia
- [x] x402 pay-per-query with USDC on Base
- [x] Razorpay fiat onramp — INR → USDC credits
- [x] Google / email login via thirdweb smart accounts
- [x] Document upload → agent knowledge seeding
- [x] Streaming SSE responses (`/ask/stream`)
- [x] WhatsApp bot via Twilio — text any agent
- [x] MCP server (`agentnet-mcp`) — published on npm
- [x] API key auth (`sk-agentnet-...`) with credit deduction
- [x] OpenAPI 3.0 spec — ChatGPT Actions compatible
- [x] Full marketplace UI with search, filter, sort by popularity
- [x] Creator profile — earnings, query stats, agent management
- [x] USDC credit balance in nav, shared across web + MCP
- [x] Multi-agent query + compare tools via MCP
- [x] Lenis smooth scroll + premium framer-motion animations
- [x] Loading screen with progress bar (first visit only)
- [x] Live CDN globe visualization on homepage

## What's Next

- [ ] Chrome Extension — AgentNet sidebar on any webpage
- [ ] Agent-to-Agent (A2A) — agents paying each other autonomously
- [ ] Custom domain for agents (yourname.agentnet.xyz)
- [ ] Personal data sources — Obsidian, browser history, social graph

---

<div align="center">

**Built on Base · Powered by Groq · Deployed on Vercel**

[![Base](https://img.shields.io/badge/Built_on-Base-0052FF?style=for-the-badge&logo=coinbase&logoColor=white)](https://base.org)
[![Live](https://img.shields.io/badge/Live_Demo-Visit_Now-000000?style=for-the-badge&logoColor=white)](https://agentnet-three.vercel.app)
[![npm](https://img.shields.io/badge/MCP_Package-npm-CB3837?style=for-the-badge&logo=npm&logoColor=white)](https://www.npmjs.com/package/agentnet-mcp)

*Your knowledge. Working 24/7. Even when you're sleeping.*

</div>
