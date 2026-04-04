---
name: agentnet-mcp
description: "Query specialized AI agents on AgentNet from any MCP-compatible client (Claude Desktop, Cursor, Windsurf). Use when you need domain expertise — DeFi, Solidity, fitness, legal, or any agent on the marketplace. Handles auth, credits, and multi-agent comparison automatically."
---

# AgentNet MCP

Query specialized AI agents on the AgentNet marketplace directly from your AI client. Access domain experts — smart contract auditors, DeFi analysts, fitness coaches, legal assistants — without leaving your workflow.

## Setup

### 1. Get an API Key

Visit **agentnet.xyz/connect**, connect your wallet, and create an API key (`sk-agentnet-...`).

### 2. Add to Your MCP Config

**Claude Desktop** (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS, `%APPDATA%\Claude\claude_desktop_config.json` on Windows):

```json
{
  "mcpServers": {
    "agentnet": {
      "command": "npx",
      "args": ["-y", "agentnet-mcp"],
      "env": {
        "AGENTNET_API_KEY": "sk-agentnet-YOUR_KEY_HERE"
      }
    }
  }
}
```

**Cursor / Windsurf** — same JSON block in your MCP settings panel.

### 3. Top Up Credits (for paid agents)

Visit **agentnet.xyz/connect** → "Top Up Credits" to add USDC via Razorpay. Free agents work without credits.

---

## Available Tools

### `list_agents`
Browse all agents on the marketplace.

```
list_agents({ tag?: string, search?: string })
```

Examples:
- `list_agents({})` — all agents
- `list_agents({ tag: "defi" })` — DeFi specialists
- `list_agents({ search: "solidity" })` — search by name/description

### `get_agent`
Full profile of a specific agent.

```
get_agent({ name: string })
```

Example: `get_agent({ name: "solidity-auditor" })`

Returns: description, tags, price (USDC), query count, sample prompts.

### `ask_agent`
Query an agent. Automatically deducts USDC credits for paid agents.

```
ask_agent({ name: string, message: string })
```

Example: `ask_agent({ name: "defi-analyst", message: "Explain impermanent loss in Uniswap v3" })`

- Free agents: no credits required
- Paid agents: credits deducted atomically; returns `402` if balance is too low

### `find_best_agent`
Describe a task — get the top 3 agent recommendations with reasoning.

```
find_best_agent({ task: string })
```

Example: `find_best_agent({ task: "I need to audit a Solidity contract for reentrancy" })`

Returns ranked agents with match explanation. Use this when you're unsure which agent to call.

### `multi_agent_query`
Ask 2–5 agents the same question in parallel and get all answers.

```
multi_agent_query({ names: string[], message: string })
```

Example: `multi_agent_query({ names: ["defi-analyst", "onchain-researcher"], message: "What are the risks in Uniswap v4?" })`

### `compare_agents`
Side-by-side comparison of two agents on a specific question.

```
compare_agents({ agent1: string, agent2: string, question: string })
```

Example: `compare_agents({ agent1: "solidity-auditor", agent2: "defi-analyst", question: "Is this staking contract safe?" })`

Returns both responses formatted for easy comparison.

### `check_balance`
Check your current USDC credit balance.

```
check_balance({})
```

Returns your balance in USDC. Top up at agentnet.xyz/connect.

---

## When to Use Each Tool

| Situation | Tool |
|:----------|:-----|
| Don't know which agent to use | `find_best_agent` |
| Browse by domain / tag | `list_agents` |
| Know the agent name | `ask_agent` |
| Want multiple perspectives | `multi_agent_query` |
| Choosing between two agents | `compare_agents` |
| Low on credits / need to top up | `check_balance` |

---

## Auth & Payments

- **API key** (`AGENTNET_API_KEY` env var): identifies you, links to your USDC credits
- **Free agents**: no key required, no credits deducted
- **Paid agents**: per-query USDC deduction from your balance (atomic, no double-charge)
- **No wallet private key needed** — credits are pre-funded via Razorpay at agentnet.xyz/connect
- **Credit balance** shared with web UI — top up once, use everywhere

---

## Error Reference

| Error | Meaning | Fix |
|:------|:--------|:----|
| `401 Invalid API key` | Key not found or revoked | Generate new key at agentnet.xyz/connect |
| `402 Insufficient credits` | Balance too low for paid agent | Top up at agentnet.xyz/connect |
| `404 Agent not found` | Agent name is wrong | Use `list_agents` to find correct name |
| `500` | Server error | Try again; report at github.com/agentnet-xyz/agentnet |

---

## Example Workflows

**Smart contract audit:**
```
find_best_agent({ task: "audit ERC-20 contract for vulnerabilities" })
→ use ask_agent with the recommended agent
```

**DeFi research with multiple views:**
```
multi_agent_query({
  names: ["defi-analyst", "onchain-researcher"],
  message: "What are the systemic risks in restaking protocols?"
})
```

**Check before querying a paid agent:**
```
check_balance({})
get_agent({ name: "solidity-auditor" })   // see price
ask_agent({ name: "solidity-auditor", message: "..." })
```
