"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { PublicKey } from "@solana/web3.js";
import { RepCard } from "@/components/rep-card/RepCard";
import { PlatformGrid } from "@/components/rep-card/PlatformGrid";
import { useRepScore } from "@/lib/hooks/useRepScore";
import { LeaderboardPreview } from "@/components/feed/LeaderboardPreview";
import { FeaturedSpaces } from "@/components/spaces/FeaturedSpaces";
import { cn, shortenAddress, formatMemberSince, formatMemberDuration } from "@/lib/utils";
import type { WalletProfile } from "@/types";

const WHY_PILLARS = [
  {
    label: "The problem",
    text: "Solana protocols lose millions per launch to sybil wallets and bots. Every project rolls its own heuristics — poorly, expensively, and differently.",
  },
  {
    label: "The signal",
    text: "Visiowl scores every wallet across six on-chain behaviours — staking, governance, DeFi, NFT holding, tx volume, and age — weighted to resist gaming.",
  },
  {
    label: "The API",
    text: "GET /api/score?address=<pubkey> — one call returns a Rep Score and tier. The score lives in a Solana PDA, queryable on-chain via CPI.",
  },
] as const;

export default function Home() {
  const router = useRouter();
  const { publicKey } = useWallet();
  const { setVisible } = useWalletModal();

  const [lookup, setLookup] = useState("");
  const [lookupError, setLookupError] = useState(false);

  const address = publicKey?.toBase58() ?? null;
  const { data: profile, isLoading } = useRepScore(address);
  const displayed: WalletProfile | null = profile
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

  function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = lookup.trim();
    try {
      new PublicKey(trimmed);
      router.push(`/wallet/${trimmed}`);
    } catch {
      setLookupError(true);
    }
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col items-center gap-10 px-6 py-16">
      <div className="space-y-3 text-center">
        <h1 className="font-serif-display text-4xl font-light text-[hsl(var(--foreground))] md:text-5xl">
          Your wallet already has a story.
        </h1>
        <p className="text-[hsl(var(--muted-foreground))]">
          The sybil-resistant identity layer for Solana.
        </p>
      </div>

      {!publicKey && (
        <form onSubmit={handleLookup} className="flex w-full max-w-[560px] flex-col gap-1.5">
          <div className="flex gap-2">
            <input
              type="text"
              value={lookup}
              onChange={(e) => {
                setLookup(e.target.value);
                setLookupError(false);
              }}
              placeholder="Paste any Solana address…"
              spellCheck={false}
              className={cn(
                "font-mono-address h-10 flex-1 border bg-[hsl(var(--card))] px-3 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:ring-1 focus:ring-[hsl(var(--ring))] focus:outline-none",
                lookupError ? "border-[hsl(var(--destructive))]" : "border-[hsl(var(--border))]",
              )}
            />
            <button
              type="submit"
              className="h-10 shrink-0 bg-[hsl(var(--secondary))] px-5 text-sm font-medium text-[hsl(var(--foreground))] transition-opacity hover:opacity-80"
            >
              Look up
            </button>
          </div>
          {lookupError && (
            <p className="text-xs text-[hsl(var(--destructive))]">
              Enter a valid Solana public key (base58, 32–44 characters).
            </p>
          )}
        </form>
      )}

      {isLoading && <RepCard variant="skeleton" />}

      {!isLoading && !publicKey && (
        <div className="relative w-full max-w-[560px]">
          <div className="pointer-events-none blur-md brightness-90 select-none">
            <RepCard variant="skeleton" />
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

      {!isLoading && displayed && (
        <div className="flex w-full flex-col items-center gap-6">
          <RepCard wallet={displayed} animate={true} />
          <div className="w-full max-w-[560px]">
            <PlatformGrid actions={displayed.levelUpActions} />
          </div>
        </div>
      )}

      <LeaderboardPreview limit={5} />

      <FeaturedSpaces />

      <section className="w-full max-w-2xl border-t border-[hsl(var(--border-light))] pt-10">
        <p className="label-caps mb-6 text-[hsl(var(--muted-foreground))]">Why Visiowl</p>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {WHY_PILLARS.map(({ label, text }) => (
            <div key={label} className="space-y-2">
              <p className="label-caps text-[hsl(var(--accent))]">{label}</p>
              <p className="text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
