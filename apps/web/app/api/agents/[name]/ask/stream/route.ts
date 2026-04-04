import { NextRequest } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase";
import { streamAgentQuery } from "@/lib/rag";
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
  const { name } = await params;
  const body = await request.json().catch(() => null);

  if (!body || typeof body.question !== "string" || !body.question.trim()) {
    return new Response("question is required", { status: 400 });
  }

  const supabase = createServiceRoleClient();
  const { data: agent, error } = await supabase
    .from("agents")
    .select("*")
    .ilike("name", name)
    .maybeSingle();

  if (error || !agent) {
    return new Response("Agent not found", { status: 404 });
  }
  if (agent.status !== "active") {
    return new Response("Agent is not active", { status: 403 });
  }

  // ── x402 Payment Gate ──────────────────────────────────────────────────────
  if (!agent.is_free) {
    const paymentData =
      request.headers.get("X-PAYMENT") ||
      request.headers.get("PAYMENT-SIGNATURE");

    const payTo = (agent.wallet_address || process.env.PLATFORM_WALLET_ADDRESS) as `0x${string}`;
    const price = `$${Number(agent.price_usdc).toFixed(4)}`;
    const resourceUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/agents/${name}/ask/stream`;

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
        mimeType: "text/event-stream",
      },
    });

    if (result.status !== 200) {
      return new Response(JSON.stringify(result.responseBody), {
        status: result.status,
        headers: result.responseHeaders as Record<string, string>,
      });
    }
  }
  // ── End Payment Gate ────────────────────────────────────────────────────────

  // RAG retrieval + Groq streaming
  const ragStream = await streamAgentQuery(
    agent.id,
    agent.name,
    agent.description,
    body.question.trim()
  );

  // Fire-and-forget query count increment
  supabase.rpc("increment_query_count", { agent_name: name }).then(({ error: e }) => {
    if (e) console.error("[stream] increment_query_count failed:", e);
  });

  // Wrap token chunks in SSE format
  const encoder = new TextEncoder();
  const sseStream = new ReadableStream({
    async start(controller) {
      const reader = ragStream.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
            break;
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(value)}\n\n`));
        }
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(sseStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
