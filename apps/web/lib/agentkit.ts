import { CdpEvmWalletProvider } from "@coinbase/agentkit";

export async function createAgentWallet(agentName: string): Promise<string> {
  const apiKeyId = process.env.CDP_API_KEY_ID;
  const apiKeySecret = process.env.CDP_API_KEY_SECRET;
  const walletSecret = process.env.CDP_WALLET_SECRET;

  if (!apiKeyId || !apiKeySecret || !walletSecret) {
    throw new Error("Missing CDP environment variables");
  }

  // Idempotency: the agent name as seed ensures same wallet for same agent name
  const walletProvider = await CdpEvmWalletProvider.configureWithWallet({
    apiKeyId: apiKeyId,
    apiKeySecret: apiKeySecret,
    networkId: "base-sepolia",
    idempotencyKey: agentName,
  });

  return walletProvider.getAddress();
}
