import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createServiceRoleClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const USDC_PER_INR = 1 / 85; // 1 USDC = ₹85
const PLATFORM_FEE = 0.10; // 10%

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.wallet_address || !body?.amount_inr) {
    return NextResponse.json({ error: "wallet_address and amount_inr required" }, { status: 400 });
  }

  const amountInr = Number(body.amount_inr);
  if (!Number.isFinite(amountInr) || amountInr < 85) {
    return NextResponse.json({ error: "Minimum top-up is ₹85" }, { status: 400 });
  }

  const amountUsdc = parseFloat((amountInr * USDC_PER_INR * (1 - PLATFORM_FEE)).toFixed(6));

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });

  const order = await razorpay.orders.create({
    amount: Math.round(amountInr * 100), // paise
    currency: "INR",
    notes: {
      wallet_address: body.wallet_address,
      amount_usdc: String(amountUsdc),
    },
  });

  // Store pending transaction
  const supabase = createServiceRoleClient();
  await supabase.from("topup_transactions").insert({
    wallet_address: body.wallet_address.toLowerCase(),
    amount_inr: amountInr,
    amount_usdc: amountUsdc,
    razorpay_order_id: order.id,
    status: "pending",
  });

  return NextResponse.json({
    order_id: order.id,
    amount_inr: amountInr,
    amount_usdc: amountUsdc,
    key_id: process.env.RAZORPAY_KEY_ID,
  });
}
