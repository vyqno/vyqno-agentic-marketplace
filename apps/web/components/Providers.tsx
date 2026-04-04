"use client";

import { ThirdwebProvider, useActiveAccount } from "thirdweb/react";
import { useEffect, useRef } from "react";

// Silently upserts the user row in Supabase on first connect.
// Runs globally — covers Google/email/MetaMask/Coinbase sign-ins from any page.
function AuthSync() {
  const account = useActiveAccount();
  const syncedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!account?.address) return;
    // Only call once per address (avoids re-running on every render)
    if (syncedRef.current === account.address) return;
    syncedRef.current = account.address;

    fetch("/api/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wallet_address: account.address }),
    }).catch(() => {/* silent — non-critical */});
  }, [account?.address]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThirdwebProvider>
      <AuthSync />
      {children}
    </ThirdwebProvider>
  );
}
