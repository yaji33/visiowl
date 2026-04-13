"use client";
import { useState } from "react";
import { cn, formatRelativeTime } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { WalletStamp } from "./WalletStamp";
import { RepScore } from "./RepScore";
import { SignalBar } from "./SignalBar";
import { TierBadge } from "./TierBadge";
import { BadgeShowcase } from "./BadgeShowcase";
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

type RepCardProps =
  | {
      variant: "skeleton";
      wallet?: WalletProfile;
      animate?: boolean;
      className?: string;
      onRefresh?: () => void;
    }
  | {
      variant?: "full";
      wallet: WalletProfile;
      animate?: boolean;
      className?: string;
      onRefresh?: () => void;
    };

function RepCardFull({
  wallet,
  animate,
  className,
  onRefresh,
}: {
  wallet: WalletProfile;
  animate: boolean;
  className?: string;
  onRefresh?: () => void;
}) {
  const shareUrl = `${process.env["NEXT_PUBLIC_APP_URL"] ?? ""}/wallet/${wallet.address}`;
  const hasBadges = wallet.badges.length > 0;
  const [view, setView] = useState<"badge" | "score">(hasBadges ? "badge" : "score");

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

      {hasBadges && (
        <div className="flex border-b border-[hsl(var(--border-light))]">
          {(["badge", "score"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setView(tab)}
              className={cn(
                "label-caps relative flex-1 py-3 text-[10px] transition-colors",
                view === tab
                  ? "text-[hsl(var(--foreground))]"
                  : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]",
              )}
            >
              {tab === "badge" ? `Badges · ${wallet.badges.length}` : "Score Details"}
              {view === tab && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute right-0 bottom-0 left-0 h-[2px] bg-[hsl(var(--accent))]"
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              )}
            </button>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {view === "badge" ? (
          <motion.div
            key="badge"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <BadgeShowcase badges={wallet.badges} />
          </motion.div>
        ) : (
          <motion.div
            key="score"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
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
          </motion.div>
        )}
      </AnimatePresence>

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

export function RepCard(props: RepCardProps) {
  if (props.variant === "skeleton") return <Skeleton />;
  const { wallet, animate = true, className, onRefresh } = props;
  return (
    <RepCardFull wallet={wallet} animate={animate} className={className} onRefresh={onRefresh} />
  );
}
