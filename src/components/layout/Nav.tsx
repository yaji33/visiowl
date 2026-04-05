"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { cn, shortenAddress } from "@/lib/utils";

export function Nav() {
  const path = usePathname();
  const { publicKey, disconnect, connecting } = useWallet();
  const { setVisible } = useWalletModal();

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      className={cn(
        "text-xs text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]",
        path === href && "text-[hsl(var(--foreground))]",
      )}
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-[hsl(var(--border-light))] bg-[hsl(var(--background)/0.95)] px-6 py-4 backdrop-blur-sm">
      <div className="mx-auto flex max-w-4xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/visiowl-logo.svg"
            alt="Visiowl"
            width={28}
            height={28}
            className="rounded-sm"
          />
          <span className="font-serif-display text-lg font-light text-[hsl(var(--foreground))]">
            Visiowl
          </span>
        </Link>
        <nav className="flex items-center gap-6">
          {navLink("/activity", "Activity")}
          {navLink("/space/superteam-core", "Create Space")}
          {publicKey ? (
            <div className="flex items-center gap-4">
              <span className="address-mono text-xs text-[hsl(var(--foreground))]">
                {shortenAddress(publicKey.toBase58())}
              </span>
              <button
                onClick={() => setVisible(true)}
                className="text-xs text-[hsl(var(--muted-foreground))] underline underline-offset-2 transition-colors hover:text-[hsl(var(--foreground))]"
              >
                Switch
              </button>
              <button
                onClick={() => void disconnect()}
                className="text-xs text-[hsl(var(--muted-foreground))] underline underline-offset-2 transition-colors hover:text-[hsl(var(--foreground))]"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={() => setVisible(true)}
              disabled={connecting}
              className="text-xs text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))] disabled:opacity-50"
            >
              {connecting ? "Connecting…" : "Connect Wallet"}
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
