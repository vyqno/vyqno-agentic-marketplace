import "server-only";

export const X402_DEFAULT_NETWORK = "base-sepolia" as const;
export const X402_DEFAULT_FACILITATOR_URL =
  "https://x402.org/facilitator" as const;

export type X402Config = {
  facilitatorUrl: string;
  network: typeof X402_DEFAULT_NETWORK;
  platformWalletAddress: string;
  cdpClientKey: string;
  hasPlatformWalletAddress: boolean;
  hasCdpClientKey: boolean;
};

export type X402AskRoutePriceConfig = {
  price: string;
  network: typeof X402_DEFAULT_NETWORK;
  payTo: string;
  config: {
    description: string;
    facilitatorUrl: string;
  };
};

function normalizeFacilitatorUrl(value: string | undefined): string {
  const trimmed = value?.trim();

  if (!trimmed) {
    return X402_DEFAULT_FACILITATOR_URL;
  }

  return trimmed.replace(/\/+$/, "");
}

export function getX402Config(): X402Config {
  const facilitatorUrl = normalizeFacilitatorUrl(
    process.env.NEXT_PUBLIC_X402_FACILITATOR_URL
  );
  const platformWalletAddress = process.env.PLATFORM_WALLET_ADDRESS?.trim() ?? "";
  const cdpClientKey = process.env.CDP_CLIENT_KEY?.trim() ?? "";

  return {
    facilitatorUrl,
    network: X402_DEFAULT_NETWORK,
    platformWalletAddress,
    cdpClientKey,
    hasPlatformWalletAddress: platformWalletAddress.length > 0,
    hasCdpClientKey: cdpClientKey.length > 0,
  };
}

export function getAskRoutePriceConfig(
  priceUsdc: number,
  payTo: string
): X402AskRoutePriceConfig {
  const { facilitatorUrl } = getX402Config();

  return {
    price: `$${Math.max(priceUsdc, 0).toFixed(2)}`,
    network: X402_DEFAULT_NETWORK,
    payTo,
    config: {
      description: "Paid AgentNet query",
      facilitatorUrl,
    },
  };
}
