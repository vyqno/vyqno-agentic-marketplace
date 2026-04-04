/**
 * AgentNet Demo Seed Script
 * Seeds 4 agents with wallets (already created via thirdweb MCP) and rich RAG memories.
 * Runs directly against Supabase — no dev server needed.
 *
 * Run: cd agentnet && npx tsx scripts/seed-agents.ts
 */

import { createClient } from "@supabase/supabase-js";
import { pipeline, type FeatureExtractionPipeline } from "@huggingface/transformers";

// ── Config ──────────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://elpulehthjvzyqwgqezv.supabase.co";
const SUPABASE_SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVscHVsZWh0aGp2enlxd2dxZXp2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTI5ODM1MiwiZXhwIjoyMDkwODc0MzUyfQ.LrBEpULepqhu1EaQCVsPirmR-nT3zDupvvcbpZt_YO0";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── Embedding Pipeline ───────────────────────────────────────────────────────
let extractor: FeatureExtractionPipeline | null = null;

async function getEmbedding(text: string): Promise<number[]> {
  if (!extractor) {
    console.log("  📦 Loading embedding model (first run downloads ~90MB)...");
    extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    console.log("  ✅ Model ready");
  }
  const output = await extractor(text, { pooling: "mean", normalize: true });
  return Array.from(output.data as Float32Array);
}

function chunkText(text: string, chunkSize = 500, overlap = 50): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += chunkSize - overlap) {
    chunks.push(text.slice(i, i + chunkSize).trim());
  }
  return chunks.filter((c) => c.length > 30);
}

async function seedMemory(agentId: string, content: string, source: string) {
  const chunks = chunkText(content);
  let seeded = 0;
  for (const chunk of chunks) {
    const embedding = await getEmbedding(chunk);
    const { error } = await supabase.from("agent_memories").insert({
      agent_id: agentId,
      content: chunk,
      embedding: embedding as any,
      source,
      access: "public",
    });
    if (error) console.error(`    ⚠️  Memory insert error: ${error.message}`);
    else seeded++;
  }
  return seeded;
}

// ── Agent Definitions ────────────────────────────────────────────────────────
const AGENTS = [
  {
    name: "solidity-auditor",
    description:
      "Expert smart contract security auditor specializing in Solidity vulnerabilities, reentrancy attacks, integer overflows, access control bugs, and gas optimization. Trained on thousands of real audit reports from OpenZeppelin, Trail of Bits, and Code4rena.",
    wallet_address: "0xC922f3D551EE8498Bc2edEeb23FB469C3DaA41dc",
    skill_tags: ["Solidity", "Security", "EVM", "Audit"],
    price_usdc: 0,
    is_free: true,
    memory: `Smart Contract Security Best Practices:

REENTRANCY: Always use the Checks-Effects-Interactions pattern. Update state BEFORE making external calls. Use ReentrancyGuard from OpenZeppelin on any function that makes external calls and modifies state. Example vulnerable pattern: calling transfer() before updating balance mapping.

ACCESS CONTROL: Use OpenZeppelin's Ownable or AccessControl. Never rely solely on msg.sender checks without role management. Use function modifiers consistently. Check all admin functions are protected.

INTEGER OVERFLOW: In Solidity 0.8+, overflow/underflow reverts by default. For older contracts, use SafeMath. Watch for unchecked blocks that bypass overflow protection.

FRONT-RUNNING: Commit-reveal schemes for sensitive operations. Use block timestamps cautiously — miners can manipulate by up to 15 seconds. Don't use block.timestamp for randomness.

COMMON VULNERABILITIES: tx.origin vs msg.sender confusion, uninitialized storage pointers, delegatecall to untrusted contracts, approve/transferFrom race condition (use increaseAllowance).

GAS OPTIMIZATION: Pack struct variables by size. Cache storage reads in memory variables inside loops. Use events for data that doesn't need to be read on-chain. Use custom errors instead of string revert messages (saves ~50 gas per revert).

BASE-SPECIFIC: Base uses Optimism's EVM. Same Solidity patterns apply. L2 gas costs are much lower (~100x cheaper than Ethereum mainnet). Native ETH is bridged ETH. USDC is native on Base.

AUDIT CHECKLIST: Check all external calls, verify state changes precede calls, validate all inputs, check for price oracle manipulation (use TWAP not spot price), verify access controls on all state-changing functions, check for self-destruct usage, verify proxy upgrade patterns.

PROXY PATTERNS: UUPS (EIP-1822) — upgrade logic in implementation, more gas efficient. Transparent — admin cannot call implementation functions. Beacon — multiple proxies share one implementation. Always check upgradeToAndCall is protected by onlyOwner or similar.

COMMON CODE4RENA FINDINGS: Missing zero address checks, unchecked return values from low-level calls, improper ERC20 allowance handling, incorrect event emission order, missing access control on initialize functions.`,
    memory_source: "Security knowledge base v1",
  },
  {
    name: "defi-analyst",
    description:
      "DeFi protocol analyst with deep knowledge of Uniswap v3/v4, Aave, Compound, Aerodrome, and Base ecosystem protocols. Provides liquidity analysis, yield strategy breakdowns, and risk assessments for on-chain positions.",
    wallet_address: "0x88606b2c6CF1F91cE5D7aB6DC0004424437dF266",
    skill_tags: ["DeFi", "Analytics", "Base", "Uniswap"],
    price_usdc: 0.01,
    is_free: false,
    memory: `DeFi Protocol Knowledge Base:

UNISWAP V3: Concentrated liquidity positions. LPs set price ranges — liquidity only earns fees when price is in range. Full-range positions behave like V2. Tick spacing varies by fee tier (0.01% = 1, 0.05% = 10, 0.3% = 60, 1% = 200). IL is worse with concentrated positions but fees are higher.

UNISWAP V4: Introduces hooks — smart contracts that run before/after swaps, adds/removes liquidity. Singleton pool contract (all pools in one). Flash accounting. Native ETH support. Hooks enable: dynamic fees, on-chain limit orders, TWAMM (time-weighted average market maker), custom oracles.

BASE ECOSYSTEM: Base is Coinbase's L2 on Optimism stack. Major protocols: Aerodrome (leading DEX, veAERO voting escrow model), BaseSwap, Seamless Protocol (lending), Extra Finance (leveraged farming), Moonwell (lending). USDC is native (issued by Circle directly on Base). TVL ~$3B+.

AAVE V3: Overcollateralized lending. Health Factor must stay above 1.0 or liquidation occurs. E-mode allows higher LTV for correlated assets (e.g., stablecoin E-mode: 97% LTV). Cross-chain via Aave Portal. Variable rate borrowing costs can spike during high utilization (80%+ utilization = exponential rate increase).

YIELD STRATEGIES: For stablecoin yield: lending on Aave/Moonwell (low risk, 3-8% APY), LP on USDC/USDT pairs (minimal IL). For ETH: liquid staking (cbETH, wstETH) then lend, or provide ETH/cbETH LP. Always account for gas costs on position size. Base gas is cheap (~$0.01-0.10/tx).

RISK FRAMEWORK: Smart contract risk (audit quality, time live, TVL), liquidity risk (slippage, concentration), counterparty risk (centralized bridges, admin keys), market risk (volatility, IL), oracle risk (price manipulation, stale prices), rate risk (variable APY can drop or borrow rate spike).

AERODROME: Vote-escrow model. veAERO holders vote to direct AERO emissions to pools. Bribe protocols pay veAERO holders to vote for their pool. Volatile pairs (0.3% fee) and stable pairs (0.05% fee). Gauge rewards paid in AERO. Lock AERO for up to 4 years for maximum veAERO.

LIQUIDITY MINING MATH: APR = (Daily Rewards × 365 × Token Price) / (Pool TVL). IL formula: 2*sqrt(p1/p0)/(1+p1/p0) - 1 where p0 = initial price ratio, p1 = current price ratio. For 2x price change: ~5.7% IL. For 5x: ~25.4% IL.`,
    memory_source: "DeFi protocol database v1",
  },
  {
    name: "base-builder",
    description:
      "Base chain developer expert. Helps with deploying contracts on Base, using Coinbase Developer Platform (CDP), account abstraction with Smart Wallets, and building consumer apps on Base with thirdweb and wagmi.",
    wallet_address: "0x75eD8d598D826b251E664a7E86802cF4b463bB1a",
    skill_tags: ["Base", "Developer", "Web3", "thirdweb"],
    price_usdc: 0,
    is_free: true,
    memory: `Base Chain Developer Guide:

WHAT IS BASE: Coinbase's L2 built on the OP Stack (Optimism). EVM-equivalent — any Ethereum contract deploys unchanged. Gas is ~100x cheaper than Ethereum mainnet. Finality in ~2 seconds. Native USDC (no bridging needed for USDC). Official bridge: bridge.base.org. Chain ID: 8453 (mainnet), 84532 (testnet/Sepolia).

THIRDWEB ON BASE: Best SDK for Base consumer apps.
- In-App Wallets: email/social login creates a non-custodial wallet (no seed phrase UX)
- Smart Wallets (ERC-4337): gasless transactions, batch transactions, session keys
- ConnectButton: drop-in wallet UI with 500+ wallets supported
- x402: pay-per-use API monetization with USDC micropayments
- Server Wallets: deterministic server-side wallets (same label = same address, idempotent)

SMART WALLETS / ERC-4337: UserOperations replace transactions. Bundlers batch UserOps. Paymasters sponsor gas. thirdweb ConnectButton + accountAbstraction config handles all of this automatically. Smart wallet address is a contract wallet controlled by the user's signer key.

DEPLOYING WITH FOUNDRY:
forge create --rpc-url https://sepolia.base.org --private-key $PRIVATE_KEY src/Contract.sol:ContractName --verify --etherscan-api-key $BASESCAN_API_KEY
forge verify-contract ADDRESS src/Contract.sol:ContractName --chain 84532 --etherscan-api-key $BASESCAN_KEY

COINBASE DEVELOPER PLATFORM (CDP):
- AgentKit: AI agent wallet management (now superseded by thirdweb Server Wallets for simplicity)
- Onramp: fiat-to-crypto widget (card/bank → USDC on Base)
- Smart Wallet SDK: ERC-4337 implementation optimized for Base

x402 PAYMENT PROTOCOL:
HTTP 402 Payment Required is a standard response. Server returns payment requirements (price, wallet, chain). Client signs a USDC transfer authorization (EIP-3009 or EIP-2612). Server verifies and settles via thirdweb facilitator. No mempool waiting — instant settlement on Base. Use useFetchWithPayment hook from thirdweb/react for automatic payment modal handling.

WAGMI + VIEM:
wagmi: React hooks for wallet state, contract reads/writes. useAccount, useBalance, useReadContract, useWriteContract are the core hooks. viem: TypeScript library for EVM interactions (replaces ethers.js). createPublicClient + createWalletClient pattern. Both work natively on Base.

NEXT.JS + BASE STACK: Use App Router. Server Components for blockchain reads (no client hydration). Client Components for wallet interactions. Route Handlers for server-side RPC calls. Add viem and @coinbase/agentkit to serverExternalPackages in next.config.ts.`,
    memory_source: "Base developer docs v1",
  },
  {
    name: "onchain-researcher",
    description:
      "Blockchain data researcher and onchain analyst. Specializes in reading smart contract state, decoding transactions, analyzing wallet behavior, tracing fund flows, and interpreting on-chain data from Base, Ethereum, and other EVM chains.",
    wallet_address: "0xFaF1F36eaD630E78845211DD8894781C063ef545",
    skill_tags: ["Research", "Onchain", "Data", "Analytics"],
    price_usdc: 0.005,
    is_free: false,
    memory: `Onchain Research Methodology:

READING CONTRACTS: Use cast call (Foundry) or viem to read public state. Basescan shows verified contract source, ABI, and read/write interface. Use "Read Contract" tab on Basescan to query public view functions. cast call ADDRESS "functionName()(returnType)" --rpc-url https://mainnet.base.org

TRANSACTION DECODING: Transaction = from + to + value + data + gas. "data" encodes the function call. First 4 bytes = function selector (keccak256 of signature). Remaining bytes = ABI-encoded parameters. Tools: openchain.xyz/signature (lookup selectors), abi.ninja (decode calldata), phalcon.xyz (execution trace).

TRACING FUND FLOWS: Follow the money via internal transactions. Use Phalcon Explorer or Tenderly for full execution trace showing all internal calls and value transfers. Watch for: flashloans (borrow + repay in same tx), arbitrage (profit from price differences between DEXes), MEV bots (sandwich attacks between user txs, backrunning profitable transactions).

WALLET ANALYSIS SIGNALS: Transaction count (activity level), token holdings (portfolio), NFT holdings, DeFi positions (Debank.com aggregates all), ENS/basename (identity), first transaction date (experience proxy), gas spent (commitment proxy), interaction with known protocols (sophistication signal).

BASE-SPECIFIC: Base uses Optimism's sequencer. All txs go through Coinbase's sequencer before L1 finality. L2 finality: ~2 seconds. L1 finality: ~7 days (fraud proof challenge period). Base transactions are batched as calldata to Ethereum mainnet. Blob transactions (EIP-4844) reduce L1 data costs ~10x.

SMART CONTRACT PATTERNS:
- Proxy patterns: check implementation slot (EIP-1967: 0x360894a13ba1a3210667c828492db98dca3e2076935efc253a0f14ba704b5ab2)
- Token standards: ERC-20 (fungible), ERC-721 (NFT), ERC-1155 (multi-token), ERC-4626 (vault)
- DEX interactions: recognize swap() calls, addLiquidity(), removeLiquidity(), mint(), burn()
- Lending: borrow(), repay(), liquidate(), supply() patterns on Aave/Compound/Moonwell

ANALYTICS TOOLS:
Dune Analytics (SQL queries on blockchain data — best for custom analysis), Nansen (wallet labels + smart money tracking), Debank (portfolio + DeFi position aggregator), Etherscan/Basescan (raw transaction data), Arkham Intelligence (entity identification), Bubblemaps (token holder visualization), Token Terminal (protocol revenue/fees), DeFiLlama (TVL tracking across protocols).

ONCHAIN METRICS TO WATCH:
- Active addresses (daily unique wallets transacting)
- Transaction count and gas used (network load)
- Protocol fees (revenue earned by protocols)
- TVL changes (capital flowing in/out of DeFi)
- Token holder distribution (concentration risk)
- Smart money wallet movements (leading indicator)`,
    memory_source: "Onchain research playbook v1",
  },
];

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🚀 AgentNet Demo Seeding — Direct Supabase Mode");
  console.log(`   Project: ${SUPABASE_URL}`);
  console.log(`   Agents:  ${AGENTS.length}\n`);

  for (const agent of AGENTS) {
    console.log(`\n🤖 Processing: ${agent.name}`);

    // Check if already exists
    const { data: existing } = await supabase
      .from("agents")
      .select("id, name")
      .eq("name", agent.name)
      .maybeSingle();

    let agentId: string;

    if (existing) {
      console.log(`  ⚠️  Already exists — updating wallet + re-seeding memories`);
      const { error: updateError } = await supabase
        .from("agents")
        .update({ wallet_address: agent.wallet_address, status: "active" })
        .eq("id", existing.id);
      if (updateError) console.error(`  ❌ Update error: ${updateError.message}`);
      agentId = existing.id;

      // Clear old memories
      await supabase.from("agent_memories").delete().eq("agent_id", agentId);
    } else {
      // Insert new agent
      const { data: inserted, error: insertError } = await supabase
        .from("agents")
        .insert({
          name: agent.name,
          description: agent.description,
          owner_address: "0x0000000000000000000000000000000000000000",
          wallet_address: agent.wallet_address,
          skill_tags: agent.skill_tags,
          price_usdc: agent.price_usdc,
          is_free: agent.is_free,
          endpoint_url: `/api/agents/${agent.name}/ask`,
          status: "active",
        })
        .select("id")
        .single();

      if (insertError || !inserted) {
        console.error(`  ❌ Insert failed: ${insertError?.message}`);
        continue;
      }

      agentId = inserted.id;
      console.log(`  ✅ Agent created: ${agent.name}`);
      console.log(`     ID:     ${agentId}`);
    }

    console.log(`     Wallet: ${agent.wallet_address}`);
    console.log(`     Price:  ${agent.is_free ? "FREE" : `$${agent.price_usdc} USDC`}`);

    // Seed memories with embeddings
    console.log(`  🧠 Embedding ${agent.memory.length} chars of knowledge...`);
    const chunksSeeded = await seedMemory(agentId, agent.memory, agent.memory_source);
    console.log(`  💾 ${chunksSeeded} memory chunks embedded and stored`);
  }

  console.log("\n🎉 Seeding complete!");
  console.log("   Visit http://localhost:3000 after starting: pnpm dev");
  console.log("   4 agents ready with RAG memories on Base Sepolia\n");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
