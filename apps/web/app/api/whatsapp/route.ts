import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase";
import { runAgentQuery } from "@/lib/rag";

export const dynamic = "force-dynamic";

// XML-escape to prevent malformed TwiML from special chars in agent descriptions
function xmlEscape(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Return TwiML XML response
function twiml(message: string): NextResponse {
  const xml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${xmlEscape(message)}</Message></Response>`;
  return new NextResponse(xml, {
    headers: { "Content-Type": "text/xml" },
  });
}

function formatAgentList(agents: any[]): string {
  if (agents.length === 0) return "No agents available right now.";
  return agents
    .map((a, i) => `${i + 1}. *${a.name}* — ${a.is_free ? "FREE" : `$${Number(a.price_usdc).toFixed(4)}/query`}\n   ${a.description?.slice(0, 60)}...`)
    .join("\n\n");
}

const MENU_MSG = (agents: any[]) =>
  `🤖 *Welcome to AgentNet*\n\nHire AI experts, pay per answer.\n\n*Available Agents:*\n${formatAgentList(agents)}\n\nReply with agent name or number to start chatting.\nType *menu* anytime to go back.`;

export async function POST(request: NextRequest) {
  // Twilio sends form-encoded body
  const text = await request.text();
  const params = new URLSearchParams(text);
  const from = params.get("From") ?? "";
  const body = (params.get("Body") ?? "").trim();
  const lowerBody = body.toLowerCase();

  if (!from || !body) return twiml("Could not process your message.");

  const supabase = createServiceRoleClient();

  // Fetch agents list (reused in multiple places)
  const { data: agents } = await supabase
    .from("agents")
    .select("id, name, description, is_free, price_usdc, skill_tags")
    .eq("status", "active")
    .order("created_at", { ascending: true });

  const agentList = agents ?? [];

  // Get or create session
  const { data: session } = await supabase
    .from("whatsapp_sessions")
    .select("*")
    .eq("phone_number", from)
    .maybeSingle();

  // --- MENU COMMANDS ---
  if (!session || lowerBody === "menu" || lowerBody === "back" || lowerBody === "hi" || lowerBody === "hello" || lowerBody === "start") {
    // Reset to menu
    await supabase.from("whatsapp_sessions").upsert({
      phone_number: from,
      current_agent_id: null,
      current_agent_name: null,
      current_agent_description: null,
      state: "menu",
      updated_at: new Date().toISOString(),
    }, { onConflict: "phone_number" });

    return twiml(MENU_MSG(agentList));
  }

  // --- HELP ---
  if (lowerBody === "help") {
    return twiml(
      `📖 *AgentNet Commands*\n\n*menu* — Show available agents\n*back* — Return to menu\n*help* — Show this message\n\nOr just type the agent name/number to chat with it.`
    );
  }

  // --- AGENT SELECTION (from menu state) ---
  if (session.state === "menu") {
    let selectedAgent: any = null;

    // Try by number
    const num = parseInt(body);
    if (!isNaN(num) && num >= 1 && num <= agentList.length) {
      selectedAgent = agentList[num - 1];
    }

    // Try by name (partial match)
    if (!selectedAgent) {
      selectedAgent = agentList.find(
        (a) => a.name.toLowerCase().includes(lowerBody) || lowerBody.includes(a.name.toLowerCase())
      );
    }

    if (!selectedAgent) {
      return twiml(
        `❓ Couldn't find that agent. Reply with a number or name:\n\n${formatAgentList(agentList)}\n\nOr type *help* for commands.`
      );
    }

    // Connect to agent
    await supabase.from("whatsapp_sessions").upsert({
      phone_number: from,
      current_agent_id: selectedAgent.id,
      current_agent_name: selectedAgent.name,
      current_agent_description: selectedAgent.description,
      state: "chatting",
      updated_at: new Date().toISOString(),
    }, { onConflict: "phone_number" });

    return twiml(
      `✅ Connected to *@${selectedAgent.name}*\n${selectedAgent.is_free ? "🆓 Free" : `💰 $${Number(selectedAgent.price_usdc).toFixed(4)}/query`}\n\n_${selectedAgent.description}_\n\nAsk your question now. Type *menu* to disconnect.`
    );
  }

  // --- CHATTING WITH AGENT ---
  if (session.state === "chatting" && session.current_agent_id) {
    try {
      const answer = await runAgentQuery(
        session.current_agent_id,
        session.current_agent_name,
        session.current_agent_description ?? "",
        body
      );

      // Update session timestamp
      await supabase
        .from("whatsapp_sessions")
        .update({ updated_at: new Date().toISOString() })
        .eq("phone_number", from);

      // Increment query count on agent
      try { await supabase.rpc("increment_query_count", { agent_id: session.current_agent_id }); } catch (_) {}

      // Truncate long responses for WhatsApp (1600 char limit)
      const truncated = answer.length > 1400 ? answer.slice(0, 1397) + "..." : answer;
      return twiml(`@${session.current_agent_name}:\n\n${truncated}\n\n_Type *menu* to switch agents._`);
    } catch (err: any) {
      console.error("[WhatsApp] runAgentQuery failed:", err?.message ?? err);
      return twiml(`⚠️ Agent error: ${err?.message ?? "unknown"}. Type *menu* to go back.`);
    }
  }

  return twiml(MENU_MSG(agentList));
}
