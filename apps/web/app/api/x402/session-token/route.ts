import { NextResponse } from "next/server";
import { getX402Config } from "@/lib/x402";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const x402Config = getX402Config();

  return NextResponse.json(
    {
      clientKeyPresent: x402Config.hasCdpClientKey,
      facilitatorUrl: x402Config.facilitatorUrl,
      network: x402Config.network,
      platformWalletConfigured: x402Config.hasPlatformWalletAddress,
      sessionTokenReady:
        x402Config.hasCdpClientKey && x402Config.hasPlatformWalletAddress,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
