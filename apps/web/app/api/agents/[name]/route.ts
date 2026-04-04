import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  context: any
) {
  try {
    const { name } = await context.params;
    const decodedName = decodeURIComponent(name);

    const supabase = createServiceRoleClient();
    const { data: agent, error } = await supabase
      .from("agents")
      .select("*")
      .ilike("name", decodedName)
      .maybeSingle();

    if (error) {
      console.error(`[GET /api/agents/${name}] Lookup failed:`, error);
      return NextResponse.json({ error: "Failed to fetch agent" }, { status: 500 });
    }

    if (!agent) {
      return NextResponse.json({ error: `Agent "${decodedName}" not found` }, { status: 404 });
    }

    return NextResponse.json({ agent });
  } catch (err) {
    console.error("[GET /api/agents/[name]] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/agents/[id] — update skill_tags / description
// The profile page sends agent.id (UUID) as the path param, so we look up by id.
export async function PATCH(request: NextRequest, context: any) {
  try {
    const { name: id } = await context.params;
    const body = await request.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

    const supabase = createServiceRoleClient();

    const { data: agent } = await supabase
      .from("agents")
      .select("owner_wallet")
      .eq("id", id)
      .single();

    if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

    const requester = body.owner_wallet?.toLowerCase();
    if (agent.owner_wallet && agent.owner_wallet !== requester) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const updates: Record<string, unknown> = {};
    if (Array.isArray(body.skill_tags)) updates.skill_tags = body.skill_tags;
    if (typeof body.description === "string" && body.description.trim().length >= 10) {
      updates.description = body.description.trim();
    }

    const { data, error } = await supabase
      .from("agents")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ agent: data });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
