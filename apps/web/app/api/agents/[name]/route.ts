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
      return NextResponse.json(
        { error: "Failed to fetch agent" },
        { status: 500 }
      );
    }

    if (!agent) {
      return NextResponse.json(
        { error: `Agent "${decodedName}" not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({ agent });
  } catch (err) {
    console.error("[GET /api/agents/[name]] Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
