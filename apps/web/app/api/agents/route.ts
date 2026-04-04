import { NextRequest, NextResponse } from "next/server";
import { createAgentWallet } from "@/lib/agentkit";
import { seedAgentMemory } from "@/lib/rag";
import { createServiceRoleClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

const NAME_REGEX = /^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$/;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tags = searchParams.get("tags");
    const search = searchParams.get("search");
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");

    const page = pageParam === null ? 1 : Number(pageParam);
    if (!Number.isInteger(page) || page < 1) {
      return NextResponse.json(
        { error: "page must be a positive integer" },
        { status: 400 }
      );
    }

    const parsedLimit = limitParam === null ? 12 : Number(limitParam);
    if (!Number.isInteger(parsedLimit) || parsedLimit < 1) {
      return NextResponse.json(
        { error: "limit must be a positive integer" },
        { status: 400 }
      );
    }

    const limit = Math.min(parsedLimit, 50);
    const offset = (page - 1) * limit;

    const supabase = createServiceRoleClient();

    let query = supabase
      .from("agents")
      .select("*", { count: "exact" })
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (tags) {
      const tagArray = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      if (tagArray.length > 0) {
        query = query.contains("skill_tags", tagArray);
      }
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    query = query.range(offset, offset + limit - 1);

    const { data: agents, count, error } = await query;

    if (error) {
      console.error("[GET /api/agents] Error:", error);
      return NextResponse.json(
        { error: "Failed to fetch agents" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      agents: agents ?? [],
      total: count ?? 0,
      page,
      limit,
    });
  } catch (err) {
    console.error("[GET /api/agents] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as
      | Record<string, unknown>
      | null;

    if (!body) {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }
    const {
      name,
      description,
      skillTags,
      priceUsdc,
      isInitiallyFree,
      initialMemory,
      ensName,
    } = body;

    if (!isNonEmptyString(name)) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const normalizedName = name.trim();

    if (!NAME_REGEX.test(normalizedName)) {
      return NextResponse.json(
        {
          error:
            "Invalid name. Must be 3-64 chars, lowercase alphanumeric and hyphens only, cannot start/end with hyphen.",
        },
        { status: 400 }
      );
    }

    if (typeof description !== "string" || description.trim().length < 10) {
      return NextResponse.json(
        { error: "Description is required (min 10 chars)" },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    const { data: existing, error: existingError } = await supabase
      .from("agents")
      .select("id")
      .eq("name", normalizedName)
      .maybeSingle();

    if (existingError) {
      console.error("[POST /api/agents] Name lookup failed:", existingError);
      return NextResponse.json(
        { error: "Failed to validate agent name" },
        { status: 500 }
      );
    }

    if (existing) {
      return NextResponse.json(
        { error: `Agent name "${normalizedName}" is already taken` },
        { status: 409 }
      );
    }

    let walletAddress: string | null = null;
    try {
      walletAddress = await createAgentWallet(normalizedName);
    } catch (err) {
      console.error("[POST /api/agents] Wallet creation failed:", err);
    }

    const isFree = isInitiallyFree !== false;
    const rawPrice = priceUsdc ?? 0;
    const price = typeof rawPrice === "number" ? rawPrice : Number(rawPrice);

    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json(
        { error: "priceUsdc must be a non-negative number" },
        { status: 400 }
      );
    }

    const tags = Array.isArray(skillTags)
      ? skillTags.filter(
          (tag): tag is string => typeof tag === "string" && tag.trim().length > 0
        )
      : [];

    const { data: agent, error: insertError } = await supabase
      .from("agents")
      .insert({
        name: normalizedName,
        description: description.trim(),
        owner_address: "0x0000000000000000000000000000000000000000",
        wallet_address: walletAddress,
        skill_tags: tags,
        price_usdc: price,
        is_free: isFree,
        ens_name: typeof ensName === "string" ? ensName.trim() : null,
        endpoint_url: `/api/agents/${normalizedName}/ask`,
        status: "active",
      })
      .select()
      .single();

    if (insertError) {
      console.error("[POST /api/agents] Insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to create agent" },
        { status: 500 }
      );
    }

    let chunksCreated = 0;
    if (
      typeof initialMemory === "string" &&
      initialMemory.trim().length > 0
    ) {
      try {
        chunksCreated = await seedAgentMemory(
          agent.id,
          initialMemory,
          "initial-seed"
        );
      } catch (err) {
        console.error("[POST /api/agents] Memory seeding failed:", err);
      }
    }

    return NextResponse.json(
      {
        agent,
        walletAddress,
        chunksCreated,
        message: `Agent "${normalizedName}" created successfully`,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/agents] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
