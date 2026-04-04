import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createServiceRoleClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, wallet_address } = body ?? {};

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !wallet_address) {
    return NextResponse.json({ error: "Missing payment fields" }, { status: 400 });
  }

  // Verify Razorpay signature
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  // Get the pending transaction
  const { data: txn, error: txnError } = await supabase
    .from("topup_transactions")
    .select("*")
    .eq("razorpay_order_id", razorpay_order_id)
    .eq("status", "pending")
    .single();

  if (txnError || !txn) {
    return NextResponse.json({ error: "Transaction not found or already processed" }, { status: 404 });
  }

  // Mark transaction as completed
  await supabase
    .from("topup_transactions")
    .update({ status: "completed", razorpay_payment_id })
    .eq("razorpay_order_id", razorpay_order_id);

  // Add USDC credits to user
  const { data: user } = await supabase
    .from("users")
    .select("usdc_credits")
    .eq("wallet_address", wallet_address.toLowerCase())
    .single();

  const newBalance = parseFloat(((user?.usdc_credits ?? 0) + txn.amount_usdc).toFixed(6));

  await supabase
    .from("users")
    .update({ usdc_credits: newBalance })
    .eq("wallet_address", wallet_address.toLowerCase());

  return NextResponse.json({
    success: true,
    credits_added: txn.amount_usdc,
    new_balance: newBalance,
    message: `₹${txn.amount_inr} → ${txn.amount_usdc} USDC added to your account`,
  });
}
