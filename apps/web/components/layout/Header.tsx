"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ConnectButton } from "thirdweb/react";
import { client } from "@/lib/thirdweb";
import { baseSepolia } from "thirdweb/chains";
import { inAppWallet, createWallet } from "thirdweb/wallets";

export default function Header() {
  const wallets = [
    inAppWallet({
      auth: {
        options: ["google", "email", "apple"],
      },
      smartAccount: {
        chain: baseSepolia,
        sponsorGas: true,
      },
    }),
    createWallet("io.metamask"),
    createWallet("com.coinbase.wallet"),
  ];

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
    >
      <div className="mx-auto max-w-7xl">
        <div className="glass px-6 py-3 rounded-full flex items-center justify-between shadow-premium border-black/5">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <span className="text-white font-bold text-lg leading-none">A</span>
            </div>
            <span className="font-outfit font-bold text-xl tracking-tight text-foreground">
              Agent<span className="text-primary">Net</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 ml-12">
            <Link href="/" className="text-sm font-medium text-foreground/60 hover:text-foreground transition-colors">
              Marketplace
            </Link>
            <Link href="/create" className="text-sm font-medium text-foreground/60 hover:text-foreground transition-colors">
              Create Agent
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <ConnectButton 
              client={client}
              chain={baseSepolia}
              wallets={wallets}
              theme={"dark"}
              connectButton={{
                className: "!bg-black !text-white !rounded-full !px-6 !py-2 !h-auto !text-sm !font-bold hover:!opacity-80 transition-all",
                label: "Connect"
              }}
              accountAbstraction={{
                chain: baseSepolia,
                sponsorGas: true,
              }}
            />
          </div>
        </div>
      </div>
    </motion.header>
  );
}
