"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { client } from "@/lib/thirdweb";
import { baseSepolia } from "thirdweb/chains";
import { inAppWallet, createWallet } from "thirdweb/wallets";

const BASE_NAV = [
  { href: "/", label: "Marketplace" },
  { href: "/browse", label: "Browse" },
  { href: "/create", label: "Deploy Agent" },
];

export default function Header() {
  const pathname = usePathname();
  const account = useActiveAccount();
  const NAV_LINKS = account
    ? [...BASE_NAV, { href: "/profile", label: "Profile" }]
    : BASE_NAV;

  const wallets = [
    inAppWallet({
      auth: { options: ["google", "email", "apple"] },
      smartAccount: { chain: baseSepolia, sponsorGas: true },
    }),
    createWallet("io.metamask"),
    createWallet("com.coinbase.wallet"),
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-5">
      <div className="mx-auto max-w-7xl flex items-center justify-between">
        <nav className="flex items-center gap-8">
          {NAV_LINKS.map(({ href, label }: { href: string; label: string }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className="relative text-sm font-medium transition-colors duration-200 group"
              >
                <span className={isActive ? "text-foreground" : "text-foreground/50 hover:text-foreground/80"}>
                  {label}
                </span>
                {isActive && (
                  <span className="absolute -bottom-1 left-0 right-0 h-px bg-foreground rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        <ConnectButton
          client={client}
          chain={baseSepolia}
          wallets={wallets}
          theme="dark"
          connectButton={{
            className: "!bg-white/10 !text-white !rounded-full !px-5 !py-2 !h-auto !text-sm !font-medium hover:!bg-white/20 !transition-all !border !border-white/10 !backdrop-blur-sm",
            label: "Connect",
          }}
          accountAbstraction={{
            chain: baseSepolia,
            sponsorGas: true,
          }}
        />
      </div>
    </header>
  );
}
