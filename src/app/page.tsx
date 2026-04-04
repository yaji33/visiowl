"use client";
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { RepCard } from "@/components/rep-card/RepCard";
import { LevelUpPanel } from "@/components/rep-card/LevelUpPanel";
import { useRepScore } from "@/lib/hooks/useRepScore";
import { MOCK_WALLETS } from "@/lib/mock-data";

export default function Home() {
  const { publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  // For demo: use og mock wallet if no real wallet connected
  const address = publicKey?.toBase58() ?? null;
  const demoWallet = MOCK_WALLETS["og"]!;
  const { data: profile, isLoading } = useRepScore(address);
  const displayed = profile ?? (address ? null : demoWallet);

  return (
    <div className="mx-auto flex max-w-4xl flex-col items-center gap-10 px-6 py-16">
      {/* Hero */}
      <div className="space-y-3 text-center">
        <h1 className="font-serif-display text-4xl font-light text-[hsl(var(--foreground))] md:text-5xl">
          Your wallet already has a story.
        </h1>
        <p className="text-[hsl(var(--muted-foreground))]">We just make it visible to everyone.</p>
      </div>

      {/* CTA */}
      {!publicKey && (
        <button onClick={() => setVisible(true)}
          className="h-10 px-6 text-sm font-medium bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 transition-opacity">
          Connect Wallet
        </button>
      )}

      {/* Card */}
      {isLoading && <RepCard wallet={demoWallet} variant="skeleton" />}
      {displayed && (
        <div className="flex w-full flex-col items-center gap-6">
          <RepCard wallet={displayed} animate={true} />
          <div className="w-full max-w-[560px]">
            <LevelUpPanel actions={displayed.levelUpActions} />
          </div>
        </div>
      )}
    </div>
  );
}
