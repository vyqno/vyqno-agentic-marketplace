<p align="center">
  <img src=".github/logo.png" width="180" alt="AgentNet Logo" />
</p>

<h1 align="center">AgentNet</h1>

<p align="center">
  <strong>Deploy your knowledge as an AI. Get paid when people ask it questions.</strong>
</p>

<p align="center">
  <a href="https://agentnet-three.vercel.app"><img src="https://img.shields.io/badge/Live-agentnet--three.vercel.app-00F0FF?style=flat-square&logo=vercel&logoColor=white" /></a>
  <a href="https://www.npmjs.com/package/agentnet-mcp"><img src="https://img.shields.io/badge/MCP-agentnet--mcp-CB3837?style=flat-square&logo=npm&logoColor=white" /></a>
  <a href="https://sepolia.basescan.org/address/0x3e277fb14ce6e1f4da5391cce381869282fd46b5"><img src="https://img.shields.io/badge/Contract-Base_Sepolia-0052FF?style=flat-square&logo=coinbase&logoColor=white" /></a>
  <a href="#"><img src="https://img.shields.io/badge/AI-Llama_3.3_70B_via_Groq-8B5CF6?style=flat-square&logoColor=white" /></a>
</p>

---

## What is AgentNet?

Imagine you're a fitness coach, a lawyer, a chef, or a developer. You have years of expertise. People constantly ask you questions — but you can only be in one place at a time.

**AgentNet lets you clone your knowledge into an AI agent.**

You upload your notes, documents, and expertise. We create an AI version of you. Anyone in the world can ask it a question for as little as $0.01. You earn money while you sleep.

> **One line:** AgentNet is Fiverr for AI. Experts deploy their knowledge, anyone pays per query, creators earn passively — from the web, WhatsApp, Claude Desktop, or any AI client.

---

## Live Demo

**Web App:** https://agentnet-three.vercel.app

**MCP Server (Claude Desktop / Cursor):**
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
Get your API key at: https://agentnet-three.vercel.app/connect

---

## For Users — No Crypto Knowledge Needed

- Sign in with **Google** — no wallet setup required
- Browse AI experts by skill (DeFi, Security, Research, etc.)
- Ask any agent a question — free agents answer instantly, paid agents charge fractions of a cent
- **Pay with UPI / card** via Razorpay — we handle the crypto behind the scenes
- Or chat with any agent directly from **WhatsApp** — no app needed
- Or query agents from **Claude Desktop, Cursor, Windsurf** via the MCP server

---

## For Creators — Deploy Your Digital Twin

1. **Connect** with Google or your wallet
2. **Upload** your knowledge — paste text or upload a `.md` file (up to 10MB)
3. **Set a price** — free, or charge per query in USDC
4. **Go live** — your agent is on the marketplace instantly
5. **Earn** — every query pays directly to your wallet, tracked in your dashboard

Your agent remembers everything you taught it. It answers in your style, using your knowledge — not generic internet information.

---

## How It Works (Technical)

```
User asks a question (web / WhatsApp / MCP / ChatGPT Action)
        │
        ▼
  [Auth Gate]             API key (MCP) or x402 payment (web)
        │
        ▼
  [RAG Retrieval]         Embed question → cosine search over agent's pgvector KB
        │                 (Falls back gracefully if HF_TOKEN not set)
        ▼
  [Groq LLM]              llama-3.3-70b-versatile + retrieved context
        │
        ▼
     Answer               Streamed (SSE) or JSON — web, WhatsApp, MCP, or ChatGPT
```

---

## Features

| Feature | Description |
|:--------|:------------|
| **AI Agents** | Each agent has its own RAG knowledge base, wallet, and price |
| **MCP Server** | `agentnet-mcp` on npm — query agents from Claude Desktop, Cursor, Windsurf |
| **API Key Auth** | `sk-agentnet-...` keys for programmatic access — tracked in DB, deducts credits |
| **OpenAPI 3.0** | `/api/openapi` — plug AgentNet into ChatGPT Actions |
| **Streaming** | SSE streaming endpoint `/api/agents/:name/ask/stream` |
| **WhatsApp Bot** | Chat with any agent via WhatsApp — type `hi` to start |
| **Fiat Onramp** | Pay in INR via UPI/card — Razorpay converts to USDC credits |
| **Google Login** | No wallet setup needed — thirdweb creates a smart account silently |
| **Document Upload** | Upload `.md` files to give your agent private knowledge |
| **User Profile** | Manage agents, track total queries, estimated earnings, agents live |
| **Onchain Identity** | Every agent has a Base Sepolia wallet and is registered on AgentRegistry.sol |
| **Credit Balance** | USDC credit chip in nav — shared across web and MCP |
| **Search + Filter** | Search agents by name/description, filter by skill tag, sorted by popularity |
| **Share Button** | Copy agent profile URL to clipboard |

---

## Tech Stack

| Layer | Technology |
|:------|:-----------|
| Frontend | Next.js 15, Tailwind v4, Framer Motion |
| Auth | thirdweb (Google, email, MetaMask, Coinbase Wallet) |
| Payments | x402 protocol (USDC on Base Sepolia) + Razorpay (INR fiat onramp) |
| Database | Supabase + pgvector (384-dim embeddings) |
| LLM | Groq — `llama-3.3-70b-versatile` |
| Embeddings | HuggingFace Inference API `all-MiniLM-L6-v2` (graceful fallback if no token) |
| MCP Server | `@modelcontextprotocol/sdk` — stdio transport, 7 tools |
| WhatsApp | Twilio sandbox |
| Smart Contracts | Foundry — AgentRegistry.sol on Base Sepolia |
| Monorepo | Turborepo + pnpm |
| Deployment | Vercel (serverless, all functions under 250MB) |

---

## Quick Start

```bash
git clone https://github.com/vyqno/vyqno-agentic-marketplace.git
cd vyqno-agentic-marketplace

pnpm install

# Copy env and fill in your keys
cp .env.example apps/web/.env.local

# Start dev server
cd apps/web && pnpm dev
```

**Required env vars:**
```
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
HF_TOKEN                          # Optional — enables vector RAG (get free at huggingface.co)
```

---

## API Reference

### Agents
```
GET  /api/agents                      List agents (filter: tags, search, owner_wallet)
POST /api/agents                      Deploy a new agent
GET  /api/agents/:name                Get agent profile
POST /api/agents/:name/ask            Query agent — x402 gate (web) or API key gate (MCP)
POST /api/agents/:name/ask/stream     Streaming SSE query endpoint
POST /api/agents/:name/documents      Upload .md knowledge file to agent memory
POST /api/agents/:name/memory         Seed agent memory manually
```

### Users & Auth
```
GET  /api/user                        Get user profile by wallet
POST /api/user                        Create / upsert user profile
GET  /api/user/me                     Get current user via X-AgentNet-Key header
```

### API Keys
```
GET    /api/keys?wallet=0x...         List API keys for wallet
POST   /api/keys                      Create new key (returns sk-agentnet-...)
DELETE /api/keys?id=...&wallet=0x...  Revoke a key
```

### Payments
```
POST /api/topup/create-order          Create Razorpay INR → USDC order
POST /api/topup/verify                Verify payment + credit USDC to user
```

### Integrations
```
GET  /api/openapi                     OpenAPI 3.0 spec (ChatGPT Actions compatible)
POST /api/whatsapp                    Twilio webhook — WhatsApp bot handler
GET  /api/x402/session-token          x402 payment session config
```

---

## MCP Tools

The `agentnet-mcp` package ([npmjs.com/package/agentnet-mcp](https://www.npmjs.com/package/agentnet-mcp)) exposes 7 tools to any MCP-compatible AI client:

| Tool | Description |
|:-----|:-----------|
| `list_agents` | Browse all agents (filter by tag or search) |
| `get_agent` | Full profile of a specific agent |
| `ask_agent` | Query an agent (auto-deducts USDC credits) |
| `find_best_agent` | Describe a task, get top 3 agent recommendations |
| `multi_agent_query` | Ask 2–5 agents the same question in parallel |
| `compare_agents` | Side-by-side comparison of two agents |
| `check_balance` | Your current USDC credit balance |

---

## Supabase Schema

Run `supabase-migrations.sql` in your Supabase SQL Editor before starting.

**Tables:**
- `agents` — agent profiles, wallet, price, skill tags, status
- `agent_memories` — pgvector 384-dim embeddings of agent knowledge
- `users` — wallet address, USDC credits balance
- `api_keys` — `sk-agentnet-...` keys linked to wallets, tracked usage
- `topup_transactions` — Razorpay order history (INR → USDC)
- `whatsapp_sessions` — per-number conversation state for the WhatsApp bot

**Custom RPC functions:**
- `match_agent_memories(query_embedding, filter_agent_id, match_count)` — cosine similarity search
- `increment_query_count(agent_name)` — atomic query counter
- `deduct_usdc_credits(p_wallet, p_amount)` — atomic credit deduction

---

## Demo Agents

| Agent | Price | Skills |
|:------|:------|:-------|
| `@hitesh` | FREE | Web3, Career, DeFi, Crypto ecosystems |
| `@solidity-auditor` | FREE | Smart contracts, Security, Solidity |
| `@defi-analyst` | $0.01/query | DeFi, Uniswap, Aave, Risk |
| `@base-builder` | FREE | Base chain, Deployment, Web3 dev |
| `@onchain-researcher` | $0.005/query | Blockchain data, Analytics |

---

## Verified Tests

All tested against `https://agentnet-three.vercel.app`:

```bash
# List agents
curl https://agentnet-three.vercel.app/api/agents

# Create API key
curl -X POST https://agentnet-three.vercel.app/api/keys \
  -H "Content-Type: application/json" \
  -d '{"wallet_address":"0x...","label":"Claude Desktop"}'

# Query agent via API key (no x402 wallet needed)
curl -X POST https://agentnet-three.vercel.app/api/agents/hitesh/ask \
  -H "Content-Type: application/json" \
  -H "X-AgentNet-Key: sk-agentnet-..." \
  -d '{"question":"how to survive in web3?"}'
# → returns full markdown answer in ~2s

# Top up USDC credits
curl -X POST https://agentnet-three.vercel.app/api/topup/create-order \
  -H "Content-Type: application/json" \
  -d '{"wallet_address":"0x...","amount_inr":85}'
# → {"order_id":"order_...","amount_usdc":0.9,"key_id":"rzp_test_..."}

# OpenAPI spec (ChatGPT Actions)
curl https://agentnet-three.vercel.app/api/openapi
```

---

## Pages

| Route | Description |
|:------|:------------|
| `/` | Marketplace homepage with hero + agent grid |
| `/browse` | Search + filter all agents |
| `/agent/[id]` | Agent profile + live chat interface |
| `/create` | Deploy a new agent (wizard) |
| `/profile` | User dashboard — earnings, agents, top-up |
| `/connect` | API key management + MCP setup instructions |

---

## Roadmap

- [x] Turborepo monorepo + Next.js 15 app
- [x] Supabase pgvector RAG engine
- [x] AgentRegistry.sol on Base Sepolia
- [x] x402 pay-per-query integration
- [x] Full marketplace UI (Hero, AgentGrid, agent profiles)
- [x] Google / email login via thirdweb smart accounts
- [x] User profiles + earnings dashboard
- [x] Document upload → agent knowledge seeding
- [x] Razorpay fiat onramp (INR → USDC credits)
- [x] WhatsApp bot via Twilio
- [x] Streaming SSE responses
- [x] MCP server (`agentnet-mcp`) published on npm
- [x] API key auth system (`sk-agentnet-...`)
- [x] OpenAPI 3.0 spec for ChatGPT Actions
- [x] USDC credit balance in nav
- [x] Agent search, filter, popularity sort
- [x] Multi-agent query + compare tools (via MCP)
- [x] Deployed on Vercel (agentnet-three.vercel.app)
- [ ] Chrome Extension — AgentNet sidebar on any webpage
- [ ] Agent-to-Agent (A2A) — agents paying each other
- [ ] Personal data sources — Obsidian, browser history, social graph
- [ ] Custom domain

---

<p align="center">
  <sub>Built on Base. Designed for everyone.</sub>
</p>

<p align="center">
  <a href="https://base.org"><img src="https://img.shields.io/badge/Built_on-Base-0052FF?style=for-the-badge&logo=coinbase&logoColor=white" /></a>
  <a href="https://agentnet-three.vercel.app"><img src="https://img.shields.io/badge/Live_Demo-Visit-00F0FF?style=for-the-badge&logo=vercel&logoColor=white" /></a>
  <a href="https://www.npmjs.com/package/agentnet-mcp"><img src="https://img.shields.io/badge/MCP_Package-npm-CB3837?style=for-the-badge&logo=npm&logoColor=white" /></a>
</p>
