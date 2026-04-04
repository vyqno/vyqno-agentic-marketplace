import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase";
import { verifyApiKey } from "@/lib/api-keys";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const key = request.headers.get("X-AgentNet-Key");
  if (!key) return NextResponse.json({ error: "API key required" }, { status: 401 });

  const user = await verifyApiKey(key);
  if (!user) return NextResponse.json({ error: "Invalid API key" }, { status: 401 });

  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from("users")
    .select("wallet_address, display_name, usdc_credits")
    .eq("wallet_address", user.walletAddress)
    .maybeSingle();

  return NextResponse.json(data ?? { usdc_credits: 0 });
}
