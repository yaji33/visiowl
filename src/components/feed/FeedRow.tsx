import Link from "next/link";
import { WalletStamp } from "@/components/rep-card/WalletStamp";
import { TierBadge } from "@/components/rep-card/TierBadge";
import { formatRelativeTime } from "@/lib/utils";
import type { FeedEntry } from "@/types";

const MAX_SCORE = 1000;

interface FeedRowProps {
  entry: FeedEntry;
  rank: number;
}

export function FeedRow({ entry, rank }: FeedRowProps) {
  const scorePct = Math.min(100, Math.round((entry.score / MAX_SCORE) * 100));
  return (
    <Link
      href={`/wallet/${entry.address}`}
      className="-mx-2 flex items-center gap-3 rounded-sm border-b border-[hsl(var(--border-light))] px-2 py-4 transition-colors last:border-0 hover:bg-[hsl(var(--secondary))]"
    >
      <span className="address-mono w-7 shrink-0 text-right text-xs text-[hsl(var(--muted-foreground))]">
        #{rank}
      </span>
      <WalletStamp address={entry.address} size={36} />
      <div className="min-w-0 flex-1 space-y-1.5">
        <span className="address-mono block text-sm text-[hsl(var(--foreground))]">
          {entry.shortAddress}
        </span>
        <div className="h-1 w-full overflow-hidden rounded-full bg-[hsl(var(--secondary))]">
          <div
            className="h-full rounded-full bg-[hsl(var(--accent))] transition-all"
            style={{ width: `${scorePct}%` }}
          />
        </div>
      </div>
      <span className="font-serif-display text-2xl font-light text-[hsl(var(--foreground))]">
        {entry.score}
      </span>
      <TierBadge tier={entry.tier} size="sm" />
      <span className="hidden w-20 text-right text-xs text-[hsl(var(--muted-foreground))] sm:block">
        {formatRelativeTime(entry.generatedAt)}
      </span>
    </Link>
  );
}
