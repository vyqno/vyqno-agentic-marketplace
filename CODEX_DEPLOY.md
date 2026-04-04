# Phase 2 — Codex Handoff: Deploy AgentRegistry to Base Sepolia

## What's Done
- `AgentRegistry.sol` — production-grade contract with OpenZeppelin Ownable + Pausable + ReentrancyGuard
- `AgentRegistry.t.sol` — 65 tests, 100% coverage on the contract
- `Deploy.s.sol` — deploy script reads `DEPLOYER_PRIVATE_KEY` from env

## What Codex Needs To Do

### 1. Deploy to Base Sepolia
```bash
# From packages/contracts directory
# Foundry is at: ~/.foundry/bin/forge

forge script script/Deploy.s.sol \
  --rpc-url https://sepolia.base.org \
  --broadcast \
  --verify \
  --etherscan-api-key $BASESCAN_API_KEY \
  -vvvv
```

### 2. Required Environment Variables
- `DEPLOYER_PRIVATE_KEY` — wallet private key with Base Sepolia ETH (get from https://www.alchemy.com/faucets/base-sepolia)
- `BASESCAN_API_KEY` — from https://basescan.org/myapikey

### 3. After Deployment
1. Copy the deployed contract address from the console output
2. Export the ABI:
   ```bash
   # Extract ABI from forge output
   cat out/AgentRegistry.sol/AgentRegistry.json | jq '.abi' > ../../apps/web/lib/contracts/AgentRegistry.abi.json
   ```
3. Save the contract address to `apps/web/lib/contracts/addresses.ts`:
   ```ts
   export const AGENT_REGISTRY_ADDRESS = "0x<DEPLOYED_ADDRESS>" as const;
   export const BASE_SEPOLIA_CHAIN_ID = 84532;
   ```
4. Verify the contract on BaseScan (should auto-verify with --verify flag)

### 4. Important Notes
- Foundry path: `~/.foundry/bin/forge` (NOT in system PATH on this machine)
- Use PowerShell semicolons (`;`) not bash `&&`
- The constructor takes `initialOwner` (deployer address) — the deploy script handles this
- Contract uses Solidity 0.8.20 with OpenZeppelin v5
