"use client";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { RepCard } from "@/components/rep-card/RepCard";
import { LevelUpPanel } from "@/components/rep-card/LevelUpPanel";
import { useRepScore } from "@/lib/hooks/useRepScore";
import { MOCK_WALLETS } from "@/lib/mock-data";
import { shortenAddress, formatMemberSince, formatMemberDuration } from "@/lib/utils";
import type { WalletProfile } from "@/types";

export default function Home() {
  const { publicKey } = useWallet();
  const { setVisible } = useWalletModal();

  const address = publicKey?.toBase58() ?? null;
  const demoWallet = MOCK_WALLETS["og"]!;
  const { data: profile, isLoading, refetch } = useRepScore(address);
  const profileAsWallet: WalletProfile | null = profile
    ? {
        address: profile.address,
        shortAddress: shortenAddress(profile.address),
        score: profile.score,
        tier: profile.tier,
        memberSince: formatMemberSince(profile.createdAt),
        memberDuration: formatMemberDuration(profile.createdAt),
        isPublic: true,
        lastRefreshed: profile.lastRefreshed,
        signals: profile.signals,
        badges: profile.badges,
        levelUpActions: profile.levelUpActions,
      }
    : null;
  return (
    <div className="mx-auto flex max-w-4xl flex-col items-center gap-10 px-6 py-16">
      <div className="space-y-3 text-center">
        <h1 className="font-serif-display text-4xl font-light text-[hsl(var(--foreground))] md:text-5xl">
          Your wallet already has a story.
        </h1>
        <p className="text-[hsl(var(--muted-foreground))]">We just make it visible to everyone.</p>
      </div>

      {isLoading && <RepCard wallet={demoWallet} variant="skeleton" />}

      {!isLoading && !publicKey && (
        <div className="relative w-full max-w-[560px]">
          <div className="pointer-events-none blur-md brightness-90 select-none">
            <RepCard wallet={demoWallet} animate={false} />
          </div>
          <div
            className="absolute inset-0 flex flex-col items-center justify-end pb-14"
            style={{
              background:
                "linear-gradient(to bottom, transparent 18%, hsl(var(--background) / 0.72) 48%, hsl(var(--background)) 66%)",
            }}
          >
            <div className="flex flex-col items-center gap-4">
              <p className="font-serif-display text-xl font-light text-[hsl(var(--foreground))]">
                Connect to reveal your score
              </p>
              <button
                onClick={() => setVisible(true)}
                className="h-10 bg-[hsl(var(--primary))] px-6 text-sm font-medium text-[hsl(var(--primary-foreground))] transition-opacity hover:opacity-90"
              >
                Connect Wallet
              </button>
            </div>
          </div>
        </div>
      )}

      {!isLoading && profileAsWallet && (
        <div className="flex w-full flex-col items-center gap-6">
          <RepCard wallet={profileAsWallet} animate={true} onRefresh={() => void refetch()} />
          <div className="w-full max-w-[560px]">
            <LevelUpPanel actions={profileAsWallet.levelUpActions} />
          </div>
        </div>
      )}
    </div>
  );
}
