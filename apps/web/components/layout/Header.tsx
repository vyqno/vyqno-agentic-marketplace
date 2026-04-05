"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { client } from "@/lib/thirdweb";
import { baseSepolia } from "thirdweb/chains";
import { inAppWallet, createWallet } from "thirdweb/wallets";

const BASE_NAV = [
  { href: "/", label: "Marketplace" },
  { href: "/browse", label: "Browse" },
  { href: "/create", label: "Deploy Agent" },
  { href: "/connect", label: "Connect" },
];

export default function Header() {
  const pathname = usePathname();
  const account = useActiveAccount();
  const NAV_LINKS = account
    ? [...BASE_NAV, { href: "/profile", label: "Profile" }]
    : BASE_NAV;

  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    if (!account?.address) {
      setCredits(null);
      return;
    }
    fetch(`/api/user?wallet=${account.address}`)
      .then((r) => r.json())
      .then((data) => {
        const val = data?.user?.usdc_credits;
        setCredits(val != null ? parseFloat(val) : null);
      })
      .catch(() => setCredits(null));
  }, [account?.address]);

  const wallets = [
    inAppWallet({
      auth: { options: ["google", "email", "apple"] },
      smartAccount: { chain: baseSepolia, sponsorGas: true },
    }),
    createWallet("io.metamask"),
    createWallet("com.coinbase.wallet"),
  ];

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-xl border-b border-black/5 px-6 py-4"
    >
      <div className="mx-auto max-w-7xl flex items-center justify-between">
        {/* Branding */}
        <Link href="/" className="flex flex-col group">
          <span className="font-logo text-xl tracking-tighter transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:text-accent">agentnet</span>
          <span className="font-mono text-[7px] opacity-20 uppercase tracking-[0.4em] -mt-1">Reality // Design</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-10">
          {NAV_LINKS.map(({ href, label }: { href: string; label: string }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className="relative text-[12px] font-mono font-bold uppercase tracking-widest"
              >
                <span className={`transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isActive ? "text-black" : "text-black/35 hover:text-black"}`}>
                  {label}
                </span>
                {isActive && (
                  <motion.span
                    layoutId="nav-underline"
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute -bottom-2 left-0 right-0 h-[1.5px] bg-black"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {account && credits != null && (
            <Link href="/profile">
              <span className="font-mono text-[10px] border border-black/10 px-3 py-1.5 hover:bg-black hover:text-white transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer">
                CRED_BAL: ${credits.toFixed(2)}
              </span>
            </Link>
          )}

          <ConnectButton
            client={client}
            chain={baseSepolia}
            wallets={wallets}
            theme="light"
            connectButton={{
              className: "!bg-transparent !text-black !rounded-none !px-4 !py-1.5 !h-auto !text-[9px] !font-mono !font-bold !uppercase !tracking-widest hover:!bg-black hover:!text-white !transition-all !border !border-black/10",
              label: "CONNECT_ID",
            }}
            connectModal={{
              title: "Connect to AgentNet",
              titleIcon: "",
              showThirdwebBranding: false,
              welcomeScreen: {
                title: "AgentNet",
                subtitle: "The global standard for autonomous intelligence.",
              },
            }}
            accountAbstraction={{
              chain: baseSepolia,
              sponsorGas: true,
            }}
          />
        </div>
      </div>
    </motion.header>
  );
}
