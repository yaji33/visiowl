"use client";
import { cn, formatRelativeTime } from "@/lib/utils";
import { WalletStamp } from "./WalletStamp";
import { RepScore } from "./RepScore";
import { SignalBar } from "./SignalBar";
import { TierBadge } from "./TierBadge";
import { ActivityBadge } from "./ActivityBadge";
import { ShareBar } from "./ShareBar";
import type { WalletProfile } from "@/types";

function Skeleton() {
  return (
    <div className="card-surface w-full max-w-[560px] animate-pulse">
      <div className="flex items-center justify-between p-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-sm bg-[hsl(var(--secondary))]" />
          <div className="space-y-1.5">
            <div className="h-3 w-24 rounded bg-[hsl(var(--secondary))]" />
            <div className="h-2 w-16 rounded bg-[hsl(var(--secondary))]" />
          </div>
        </div>
        <div className="h-3 w-20 rounded bg-[hsl(var(--secondary))]" />
      </div>
      <div className="card-divider" />
      <div className="flex flex-col items-center py-10">
        <div className="h-[180px] w-[180px] rounded-full bg-[hsl(var(--secondary))]" />
        <div className="mt-3 h-5 w-20 rounded bg-[hsl(var(--secondary))]" />
      </div>
      <div className="card-divider" />
      <div className="space-y-5 p-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="flex justify-between">
              <div className="h-3 w-24 rounded bg-[hsl(var(--secondary))]" />
              <div className="h-3 w-6 rounded bg-[hsl(var(--secondary))]" />
            </div>
            <div className="h-px w-full rounded-full bg-[hsl(var(--secondary))]" />
            <div className="h-2 w-40 rounded bg-[hsl(var(--secondary))]" />
          </div>
        ))}
      </div>
      <div className="px-6 pb-4">
        <p className="text-center text-xs text-[hsl(var(--muted-foreground))]">
          Indexing your wallet history…
        </p>
      </div>
    </div>
  );
}

interface RepCardProps {
  wallet: WalletProfile;
  variant?: "full" | "skeleton";
  animate?: boolean;
  className?: string;
  onRefresh?: () => void;
}

export function RepCard({
  wallet,
  variant = "full",
  animate = true,
  className,
  onRefresh,
}: RepCardProps) {
  if (variant === "skeleton") return <Skeleton />;
  const shareUrl = `${process.env["NEXT_PUBLIC_APP_URL"] ?? ""}/wallet/${wallet.address}`;
  return (
    <div className={cn("card-surface w-full max-w-[560px]", className)}>
      <div className="flex items-center justify-between p-6 pb-4">
        <div className="flex items-center gap-3">
          <WalletStamp address={wallet.address} size={40} />
          <div>
            <p className="address-mono text-sm text-[hsl(var(--foreground))]">
              {wallet.shortAddress}
            </p>
            <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
              Member since {wallet.memberSince} · {wallet.memberDuration}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <svg
            width="14"
            height="14"
            viewBox="0 0 128 128"
            className="opacity-40"
            aria-hidden="true"
          >
            <circle cx="64" cy="64" r="64" fill="currentColor" />
          </svg>
          <span className="label-caps text-[10px] text-[hsl(var(--muted-foreground))]">
            Verified on Solana
          </span>
        </div>
      </div>
      <div className="card-divider" />
      <div className="flex flex-col items-center py-8">
        <RepScore score={wallet.score} animate={animate} />
        <div className="mt-2">
          <TierBadge tier={wallet.tier} />
        </div>
      </div>
      <div className="card-divider" />
      <div className="space-y-5 p-6">
        {wallet.signals.map((s, i) => (
          <SignalBar
            key={s.category}
            label={s.label}
            description={s.description}
            value={s.value}
            contribution={s.contribution}
            index={i}
          />
        ))}
      </div>
      {wallet.badges.length > 0 && (
        <>
          <div className="card-divider" />
          <div className="flex flex-wrap gap-2 p-6">
            {wallet.badges.map((b) => (
              <ActivityBadge key={b.label} label={b.label} />
            ))}
          </div>
        </>
      )}
      <div className="card-divider" />
      <div className="flex items-center justify-between p-6 pt-4">
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-[hsl(var(--muted-foreground))]">
            Last updated: {formatRelativeTime(wallet.lastRefreshed)}
          </span>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="text-[11px] text-[hsl(var(--muted-foreground))] underline underline-offset-2 transition-colors hover:text-[hsl(var(--foreground))]"
            >
              Refresh Score
            </button>
          )}
        </div>
        <ShareBar url={shareUrl} />
      </div>
    </div>
  );
}
