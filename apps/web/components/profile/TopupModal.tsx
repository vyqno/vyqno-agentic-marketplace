"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, IndianRupee, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

const USDC_PER_INR = 1 / 85;
const FEE = 0.10;
const MIN_INR = 85;

declare global {
  interface Window { Razorpay: any; }
}

interface TopupModalProps {
  walletAddress: string;
  onClose: () => void;
  onSuccess: (newBalance: number) => void;
}

export default function TopupModal({ walletAddress, onClose, onSuccess }: TopupModalProps) {
  const [amountInr, setAmountInr] = useState(85);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const amountUsdc = parseFloat((amountInr * USDC_PER_INR * (1 - FEE)).toFixed(4));

  // Load Razorpay checkout script
  useEffect(() => {
    if (window.Razorpay) { setScriptLoaded(true); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);
  }, []);

  const handlePay = async () => {
    if (!scriptLoaded) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Create order
      const orderRes = await fetch("/api/topup/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet_address: walletAddress, amount_inr: amountInr }),
      });
      const order = await orderRes.json();
      if (!orderRes.ok) throw new Error(order.error);

      // 2. Open Razorpay checkout
      await new Promise<void>((resolve, reject) => {
        const rzp = new window.Razorpay({
          key: order.key_id,
          amount: amountInr * 100,
          currency: "INR",
          name: "AgentNet",
          description: `Add ${amountUsdc} USDC credits`,
          order_id: order.order_id,
          theme: { color: "#000000" },
          handler: async (response: any) => {
            // 3. Verify payment
            const verifyRes = await fetch("/api/topup/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                wallet_address: walletAddress,
              }),
            });
            const result = await verifyRes.json();
            if (!verifyRes.ok) { reject(new Error(result.error)); return; }
            setSuccess(result.message);
            onSuccess(result.new_balance);
            resolve();
          },
          modal: { ondismiss: () => reject(new Error("Payment cancelled")) },
        });
        rzp.open();
      });
    } catch (err: any) {
      if (err.message !== "Payment cancelled") setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const presets = [85, 170, 425, 850];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 z-10"
        >
          <button onClick={onClose} className="absolute top-5 right-5 text-foreground/30 hover:text-foreground/60 transition-colors">
            <X className="w-5 h-5" />
          </button>

          {success ? (
            <div className="flex flex-col items-center gap-4 text-center py-4">
              <CheckCircle className="w-12 h-12 text-green-500" />
              <h3 className="font-bold text-xl">Credits Added!</h3>
              <p className="text-foreground/60 text-sm">{success}</p>
              <Button onClick={onClose} className="mt-2 w-full">Done</Button>
            </div>
          ) : (
            <>
              <h3 className="font-outfit font-black text-2xl mb-1">Add Credits</h3>
              <p className="text-foreground/50 text-sm mb-6">Pay with UPI, card, or netbanking</p>

              {/* Preset amounts */}
              <div className="grid grid-cols-4 gap-2 mb-6">
                {presets.map((p) => (
                  <button
                    key={p}
                    onClick={() => setAmountInr(p)}
                    className={`py-2 rounded-xl text-sm font-bold border transition-all ${
                      amountInr === p
                        ? "bg-black text-white border-black"
                        : "border-black/10 text-foreground/60 hover:border-black/30"
                    }`}
                  >
                    ₹{p}
                  </button>
                ))}
              </div>

              {/* Custom amount */}
              <div className="relative mb-6">
                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                <input
                  type="number"
                  min={MIN_INR}
                  step={1}
                  value={amountInr}
                  onChange={(e) => setAmountInr(Math.max(MIN_INR, parseInt(e.target.value) || MIN_INR))}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-black/10 text-sm font-medium focus:outline-none focus:border-black/30 transition-all"
                />
              </div>

              {/* Breakdown */}
              <div className="bg-black/[0.02] rounded-2xl p-4 mb-6 flex flex-col gap-2 text-xs">
                <div className="flex justify-between text-foreground/50">
                  <span>Amount</span>
                  <span>₹{amountInr}</span>
                </div>
                <div className="flex justify-between text-foreground/50">
                  <span>Platform fee (10%)</span>
                  <span>₹{(amountInr * FEE).toFixed(0)}</span>
                </div>
                <div className="flex justify-between font-black text-base text-foreground pt-1 border-t border-black/5 mt-1">
                  <span>You get</span>
                  <span>{amountUsdc} USDC</span>
                </div>
              </div>

              {error && <p className="text-red-500 text-xs font-medium mb-4">{error}</p>}

              <Button
                onClick={handlePay}
                disabled={loading || !scriptLoaded || amountInr < MIN_INR}
                className="w-full gap-2 rounded-xl"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Pay ₹{amountInr} via Razorpay
              </Button>
              <p className="text-center text-[10px] text-foreground/30 mt-3">
                Powered by Razorpay · Test mode
              </p>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
