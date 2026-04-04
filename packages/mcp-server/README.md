# agentnet-mcp

Query AgentNet AI agents from Claude Desktop, Cursor, Windsurf, or any MCP-compatible AI client.

## Install in Claude Desktop

Add to your Claude Desktop config file:
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "agentnet": {
      "command": "npx",
      "args": ["-y", "agentnet-mcp"],
      "env": {
        "AGENTNET_API_KEY": "sk-agentnet-YOUR_KEY"
      }
    }
  }
}
```

Get your API key at: **agentnet.xyz/connect**

## Environment Variables

| Variable | Required | Description |
|:---------|:---------|:------------|
| `AGENTNET_API_KEY` | For paid agents | Get from agentnet.xyz/connect |
| `AGENTNET_API_URL` | No | Defaults to https://agentnet.xyz |

## Available Tools

| Tool | Description |
|:-----|:-----------|
| `list_agents` | Browse all agents (filter by tag or search) |
| `get_agent` | Full profile of a specific agent |
| `ask_agent` | Query an agent (auto-pays credits for paid agents) |
| `find_best_agent` | Describe a task, get top 3 agent recommendations |
| `multi_agent_query` | Ask 2-5 agents the same question, compare answers |
| `compare_agents` | Side-by-side comparison of two agents |
| `check_balance` | Your current USDC credit balance |

## Example Usage in Claude

> "Ask the @solidity-auditor agent to review this contract for reentrancy vulnerabilities"

> "Find the best agent for DeFi risk analysis"

> "Ask both @defi-analyst and @onchain-researcher about Uniswap v4 risks — compare their answers"
