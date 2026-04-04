import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase";
import { seedAgentMemory } from "@/lib/rag";

export const dynamic = "force-dynamic";

function parseJsonBody(request: NextRequest): Promise<Record<string, unknown> | null> {
  return request.json().catch(() => null) as Promise<Record<string, unknown> | null>;
}

export async function POST(request: NextRequest) {
  try {
    const secret = request.headers.get("x-seed-secret");
    if (!secret || secret !== process.env.MEMORY_SEED_SECRET) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await parseJsonBody(request);
    if (!body) {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const { agentName, content, source } = body;

    if (typeof agentName !== "string" || agentName.trim().length === 0) {
      return NextResponse.json(
        { error: "agentName is required" },
        { status: 400 }
      );
    }

    if (typeof content !== "string" || content.trim().length < 10) {
      return NextResponse.json(
        { error: "content is required (min 10 chars)" },
        { status: 400 }
      );
    }

    if (source !== undefined && typeof source !== "string") {
      return NextResponse.json(
        { error: "source must be a string when provided" },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();
    const { data: agent, error } = await supabase
      .from("agents")
      .select("id")
      .eq("name", agentName.trim())
      .maybeSingle();

    if (error) {
      console.error("[POST /api/memory] Agent lookup failed:", error);
      return NextResponse.json(
        { error: "Failed to validate agent" },
        { status: 500 }
      );
    }

    if (!agent) {
      return NextResponse.json(
        { error: `Agent "${agentName}" not found` },
        { status: 404 }
      );
    }

    const chunksCreated = await seedAgentMemory(
      agent.id,
      content,
      source
    );

    return NextResponse.json({
      agentName: agentName.trim(),
      chunksCreated,
      message: `Successfully seeded ${chunksCreated} memory chunks for "${agentName.trim()}"`,
    });
  } catch (err) {
    console.error("[POST /api/memory] Error:", err);
    return NextResponse.json(
      { error: "Failed to seed memory" },
      { status: 500 }
    );
  }
}
