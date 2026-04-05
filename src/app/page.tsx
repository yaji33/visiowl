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
  const displayed = profileAsWallet ?? (address ? null : demoWallet);

  return (
    <div className="mx-auto flex max-w-4xl flex-col items-center gap-10 px-6 py-16">
      <div className="space-y-3 text-center">
        <h1 className="font-serif-display text-4xl font-light text-[hsl(var(--foreground))] md:text-5xl">
          Your wallet already has a story.
        </h1>
        <p className="text-[hsl(var(--muted-foreground))]">We just make it visible to everyone.</p>
      </div>

      {!publicKey && (
        <button
          onClick={() => setVisible(true)}
          className="h-10 bg-[hsl(var(--primary))] px-6 text-sm font-medium text-[hsl(var(--primary-foreground))] transition-opacity hover:opacity-90"
        >
          Connect Wallet
        </button>
      )}

      {isLoading && <RepCard wallet={demoWallet} variant="skeleton" />}
      {displayed && (
        <div className="flex w-full flex-col items-center gap-6">
          <RepCard
            wallet={displayed}
            animate={true}
            onRefresh={profileAsWallet ? () => void refetch() : undefined}
          />
          <div className="w-full max-w-[560px]">
            <LevelUpPanel actions={displayed.levelUpActions} />
          </div>
        </div>
      )}
    </div>
  );
}
