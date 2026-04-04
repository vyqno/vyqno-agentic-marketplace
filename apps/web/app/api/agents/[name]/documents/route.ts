import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase";
import { seedAgentMemory } from "@/lib/rag";

export const dynamic = "force-dynamic";

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

// POST /api/agents/[id]/documents
// The profile page sends agent.id (UUID) as the path param.
export async function POST(request: NextRequest, context: any) {
  const { name: id } = await context.params;

  const formData = await request.formData().catch(() => null);
  if (!formData) return NextResponse.json({ error: "Invalid form data" }, { status: 400 });

  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  if (!file.name.endsWith(".md")) {
    return NextResponse.json({ error: "Only .md files are accepted" }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File exceeds 10 MB limit" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();
  const { data: agent } = await supabase
    .from("agents")
    .select("id, name")
    .eq("id", id)
    .single();

  if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

  const text = await file.text();
  if (text.trim().length === 0) {
    return NextResponse.json({ error: "File is empty" }, { status: 400 });
  }

  try {
    const chunks = await seedAgentMemory(id, text, file.name);
    return NextResponse.json({ chunks, message: `Indexed ${chunks} chunks from ${file.name}` });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Indexing failed" }, { status: 500 });
  }
}
