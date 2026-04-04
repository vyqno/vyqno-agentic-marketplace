import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase";
import { generateKey } from "@/lib/api-keys";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const wallet = request.nextUrl.searchParams.get("wallet");
  if (!wallet) return NextResponse.json({ error: "wallet required" }, { status: 400 });

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("api_keys")
    .select("id, key, label, created_at, last_used_at")
    .eq("wallet_address", wallet)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ keys: data ?? [] });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.wallet_address) {
    return NextResponse.json({ error: "wallet_address required" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();
  const key = generateKey();

  const { data, error } = await supabase
    .from("api_keys")
    .insert({
      key,
      wallet_address: body.wallet_address,
      label: body.label ?? "Default",
    })
    .select("id, key, label, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ apiKey: data });
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  const wallet = request.nextUrl.searchParams.get("wallet");
  if (!id || !wallet) return NextResponse.json({ error: "id and wallet required" }, { status: 400 });

  const supabase = createServiceRoleClient();
  await supabase
    .from("api_keys")
    .delete()
    .eq("id", id)
    .eq("wallet_address", wallet);

  return NextResponse.json({ deleted: true });
}
