import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const wallet = request.nextUrl.searchParams.get("wallet");
  if (!wallet) return NextResponse.json({ error: "wallet required" }, { status: 400 });

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("wallet_address", wallet.toLowerCase())
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ user: data });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.wallet_address) return NextResponse.json({ error: "wallet_address required" }, { status: 400 });

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("users")
    .upsert(
      {
        wallet_address: body.wallet_address.toLowerCase(),
        display_name: body.display_name ?? null,
        avatar_seed: body.avatar_seed ?? null,
        bio: body.bio ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "wallet_address" }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ user: data });
}
