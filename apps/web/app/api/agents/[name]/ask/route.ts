import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase";
import { runAgentQuery } from "@/lib/rag";
import { settlePayment, facilitator } from "thirdweb/x402";
import { getThirdwebServerClient } from "@/lib/thirdwebServerClient";
import { baseSepolia } from "thirdweb/chains";

export const dynamic = "force-dynamic";

function getThirdwebFacilitator() {
  return facilitator({
    client: getThirdwebServerClient(),
    serverWalletAddress: process.env.PLATFORM_WALLET_ADDRESS as `0x${string}`,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const body = await request.json().catch(() => null);

    if (!body || typeof body.question !== "string" || !body.question.trim()) {
      return NextResponse.json({ error: "question is required" }, { status: 400 });
    }

    const supabase = createServiceRoleClient();
    const { data: agent, error } = await supabase
      .from("agents")
      .select("*")
      .ilike("name", name)
      .maybeSingle();

    if (error) {
      console.error("[ask] Agent lookup error:", error);
      return NextResponse.json({ error: "Failed to load agent" }, { status: 500 });
    }
    if (!agent) {
      return NextResponse.json({ error: `Agent "${name}" not found` }, { status: 404 });
    }
    if (agent.status !== "active") {
      return NextResponse.json({ error: "Agent is not active" }, { status: 403 });
    }

    // ── x402 Payment Gate ────────────────────────────────────────────────────
    if (!agent.is_free) {
      const paymentData =
        request.headers.get("X-PAYMENT") ||
        request.headers.get("PAYMENT-SIGNATURE");

      const payTo = (agent.wallet_address || process.env.PLATFORM_WALLET_ADDRESS) as `0x${string}`;
      const price = `$${Number(agent.price_usdc).toFixed(4)}`;
      const resourceUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/agents/${name}/ask`;

      const result = await settlePayment({
        resourceUrl,
        method: "POST",
        paymentData,
        payTo,
        network: baseSepolia,
        price,
        facilitator: getThirdwebFacilitator(),
        routeConfig: {
          description: `Query agent: ${agent.name}`,
          mimeType: "application/json",
        },
      });

      if (result.status !== 200) {
        // 402 Payment Required — client's useFetchWithPayment handles this automatically
        return NextResponse.json(result.responseBody, {
          status: result.status,
          headers: result.responseHeaders as Record<string, string>,
        });
      }
    }
    // ── End Payment Gate ─────────────────────────────────────────────────────

    const answer = await runAgentQuery(
      agent.id,
      agent.name,
      agent.description,
      body.question.trim()
    );

    // Fire-and-forget — don't block the response on this
    supabase.rpc("increment_query_count", { agent_name: name }).then(({ error: e }) => {
      if (e) console.error("[ask] increment_query_count failed:", e);
    });

    return NextResponse.json({
      answer,
      agentName: agent.name,
      queryCount: (agent.query_count ?? 0) + 1,
    });
  } catch (err) {
    console.error("[ask] Unexpected error:", err);
    return NextResponse.json({ error: "Failed to process query" }, { status: 500 });
  }
}
