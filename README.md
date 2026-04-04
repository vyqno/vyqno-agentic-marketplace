<p align="center">
  <img src=".github/logo.png" width="180" alt="AgentNet Logo" />
</p>

<h1 align="center">AgentNet</h1>

<p align="center">
  <strong>Deploy your knowledge as an AI. Get paid when people ask it questions.</strong>
</p>

<p align="center">
  <a href="#how-it-works"><img src="https://img.shields.io/badge/Stack-Next.js_15_%7C_Base_Sepolia-00F0FF?style=flat-square&logo=next.js&logoColor=white" /></a>
  <a href="#how-it-works"><img src="https://img.shields.io/badge/Payments-USDC_Micropayments-00F0FF?style=flat-square&logo=ethereum&logoColor=white" /></a>
  <a href="#how-it-works"><img src="https://img.shields.io/badge/AI-RAG_+_Llama_3.3_70B-00F0FF?style=flat-square&logoColor=white" /></a>
  <a href="https://sepolia.basescan.org/address/0x67c1b682a117422676e3cc8581a508395c56423d"><img src="https://img.shields.io/badge/Chain-Base_Sepolia-0052FF?style=flat-square&logo=coinbase&logoColor=white" /></a>
</p>

---

## What is AgentNet?

Imagine you're a fitness coach, a lawyer, a chef, or a developer. You have years of expertise. People constantly ask you questions — but you can only be in one place at a time.

**AgentNet lets you clone your knowledge into an AI agent.**

You upload your notes, documents, and expertise. We create an AI version of you. Anyone in the world can ask it a question for as little as $0.01. You earn money while you sleep.

> **One line:** AgentNet is Fiverr for AI. Experts deploy their knowledge, anyone pays per question, creators earn passively.

---

## For Users — No Crypto Knowledge Needed

- Sign in with **Google** — no wallet setup required
- Browse AI experts by skill (DeFi, Security, Research, etc.)
- Ask any agent a question — free agents answer instantly, paid agents charge fractions of a cent
- **Pay with UPI / card** via Razorpay — we handle the crypto behind the scenes
- Or chat with any agent directly from **WhatsApp** — no app needed

---

## For Creators — Deploy Your Digital Twin

1. **Connect** with Google or your wallet
2. **Upload** your knowledge — paste text or upload a `.md` file (up to 10MB)
3. **Set a price** — free, or charge per query in USDC
4. **Go live** — your agent is on the marketplace instantly
5. **Earn** — every query pays directly to your wallet

Your agent remembers everything you taught it. It answers in your style, using your knowledge — not generic internet information.

---

## How It Works (Technical)

```
User asks a question
        │
        ▼
  [x402 Paywall]          Free? Skip. Paid? Deduct USDC credits.
        │
        ▼
  [Embed Question]        384-dim vector via all-MiniLM-L6-v2
        │
        ▼
  [pgvector Search]       Cosine similarity over agent's knowledge base
        │
        ▼
  [Groq LLM]              llama-3.3-70b-versatile + retrieved context
        │
        ▼
     Answer               Streamed back to user (web or WhatsApp)
```

---

## Features

| Feature | Description |
|:--------|:------------|
| 🤖 **AI Agents** | Each agent has its own RAG knowledge base, wallet, and price |
| 💬 **WhatsApp Bot** | Chat with any agent via WhatsApp — type `hi` to start |
| 💳 **Fiat Onramp** | Pay in INR via UPI/card — Razorpay converts to USDC automatically |
| 🔐 **Google Login** | No wallet setup needed — thirdweb creates a smart account silently |
| 📄 **Document Upload** | Upload `.md` files to give your agent private knowledge |
| 👤 **User Profile** | Manage your agents, edit skill tags, track queries |
| ⛓ **Onchain Identity** | Every agent has a Base Sepolia wallet and is registered on AgentRegistry.sol |
| 🏷 **Skill Tags** | Filter and discover agents by expertise |

---

## Tech Stack

| Layer | Technology |
|:------|:-----------|
| Frontend | Next.js 15, Tailwind v4, Framer Motion |
| Auth | thirdweb (Google, email, MetaMask, Coinbase Wallet) |
| Payments | x402 protocol (USDC on Base Sepolia) + Razorpay (INR fiat) |
| Database | Supabase + pgvector (384-dim embeddings) |
| LLM | Groq — `llama-3.3-70b-versatile` |
| Embeddings | HuggingFace `all-MiniLM-L6-v2` (runs server-side) |
| WhatsApp | Twilio sandbox |
| Smart Contracts | Foundry — AgentRegistry.sol on Base Sepolia |
| Monorepo | Turborepo + pnpm |

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
NEXT_PUBLIC_THIRWEB_SECERT_KEY     # thirdweb project secret (growth plan)
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
```

---

## API

```
GET  /api/agents                    List agents (filter: tags, search, owner_wallet)
POST /api/agents                    Deploy a new agent
GET  /api/agents/:name              Get agent profile
PATCH /api/agents/:name             Update skill tags / description
POST /api/agents/:name/ask          Query an agent (x402-gated for paid agents)
POST /api/agents/:name/documents    Upload .md knowledge file to agent memory
GET  /api/user                      Get user profile by wallet address
POST /api/user                      Create / update user profile
POST /api/topup/create-order        Create Razorpay INR → USDC order
POST /api/topup/verify              Verify payment + credit USDC to user
POST /api/whatsapp                  Twilio webhook — WhatsApp bot handler
```

---

## Supabase Schema

Run `supabase-migrations.sql` in your Supabase SQL Editor before starting.

Tables: `agents`, `agent_memories` (pgvector), `users`, `topup_transactions`, `whatsapp_sessions`

---

## Demo Agents

| Agent | Price | Skills |
|:------|:------|:-------|
| `@solidity-auditor` | FREE | Smart contracts, Security, Solidity |
| `@defi-analyst` | $0.01/query | DeFi, Uniswap, Aave, Risk |
| `@base-builder` | FREE | Base chain, Deployment, Web3 dev |
| `@onchain-researcher` | $0.005/query | Blockchain data, Analytics |

---

## Roadmap

- [x] Turborepo monorepo + Next.js 15 app
- [x] Supabase pgvector RAG engine
- [x] AgentRegistry.sol on Base Sepolia
- [x] x402 pay-per-query integration
- [x] Full marketplace UI (Hero, AgentGrid, profiles)
- [x] Google / email login via thirdweb smart accounts
- [x] User profiles + agent management dashboard
- [x] Document upload → agent knowledge seeding
- [x] Razorpay fiat onramp (INR → USDC)
- [x] WhatsApp bot via Twilio
- [ ] Chrome Extension — AgentNet sidebar on any webpage
- [ ] Agent-to-Agent (A2A) — agents paying each other
- [ ] Personal data sources — Obsidian, browser history, social graph
- [ ] Public API + SDK for developers

---

<p align="center">
  <sub>Built on Base. Designed for everyone.</sub>
</p>

<p align="center">
  <a href="https://base.org"><img src="https://img.shields.io/badge/Built_on-Base-0052FF?style=for-the-badge&logo=coinbase&logoColor=white" /></a>
</p>
