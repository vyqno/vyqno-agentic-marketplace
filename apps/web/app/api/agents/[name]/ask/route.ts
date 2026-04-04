import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase";
import { runAgentQuery } from "@/lib/rag";

export const dynamic = "force-dynamic";

function parseJsonBody(request: NextRequest): Promise<Record<string, unknown> | null> {
  return request.json().catch(() => null) as Promise<Record<string, unknown> | null>;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const body = await parseJsonBody(request);

    if (!body) {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const { question } = body;

    if (typeof question !== "string" || question.trim().length === 0) {
      return NextResponse.json(
        { error: "Question is required" },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();
    const { data: agent, error } = await supabase
      .from("agents")
      .select("*")
      .ilike("name", name)
      .maybeSingle();

    if (error) {
      console.error("[POST /api/agents/[name]/ask] Agent lookup failed:", error);
      return NextResponse.json(
        { error: "Failed to load agent" },
        { status: 500 }
      );
    }

    if (!agent) {
      return NextResponse.json(
        { error: `Agent "${name}" not found` },
        { status: 404 }
      );
    }

    if (agent.status !== "active") {
      return NextResponse.json(
        { error: `Agent "${name}" is not active` },
        { status: 403 }
      );
    }

    const trimmedQuestion = question.trim();
    const answer = await runAgentQuery(
      agent.id,
      agent.name,
      agent.description,
      trimmedQuestion
    );

    const { error: incrementError } = await supabase.rpc("increment_query_count", {
      agent_name: name,
    });

    if (incrementError) {
      console.error(
        "[POST /api/agents/[name]/ask] Failed to increment query count:",
        incrementError
      );
    }

    const { data: updated, error: updatedError } = await supabase
      .from("agents")
      .select("query_count")
      .eq("name", name)
      .maybeSingle();

    if (updatedError) {
      console.error(
        "[POST /api/agents/[name]/ask] Failed to read updated count:",
        updatedError
      );
    }

    return NextResponse.json({
      answer,
      agentName: agent.name,
      queryCount: updated?.query_count ?? agent.query_count + 1,
    });
  } catch (err) {
    console.error("[POST /api/agents/[name]/ask] Error:", err);
    return NextResponse.json(
      { error: "Failed to process query" },
      { status: 500 }
    );
  }
}
