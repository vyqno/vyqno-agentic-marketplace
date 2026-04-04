import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase";
import { seedAgentMemory } from "@/lib/rag";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const body = await request.json().catch(() => null);

    if (!body || typeof body.content !== "string") {
      return NextResponse.json(
        { error: "Content is required as a string" },
        { status: 400 }
      );
    }

    const { content, source } = body;

    const supabase = createServiceRoleClient();
    const { data: agent, error } = await supabase
      .from("agents")
      .select("id")
      .ilike("name", name)
      .maybeSingle();

    if (error || !agent) {
      return NextResponse.json(
        { error: `Agent "${name}" not found` },
        { status: 404 }
      );
    }

    const chunksCreated = await seedAgentMemory(
      agent.id,
      content,
      source || "manual-upload"
    );

    return NextResponse.json({
      success: true,
      chunksCreated,
      message: `Added ${chunksCreated} memory chunks to ${name}`,
    });
  } catch (err) {
    console.error("[POST /api/agents/[name]/memory] Error:", err);
    return NextResponse.json(
      { error: "Failed to add memory" },
      { status: 500 }
    );
  }
}
