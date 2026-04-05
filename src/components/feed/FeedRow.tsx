import Link from "next/link";
import { WalletStamp } from "@/components/rep-card/WalletStamp";
import { TierBadge }   from "@/components/rep-card/TierBadge";
import { formatRelativeTime } from "@/lib/utils";
import type { FeedEntry } from "@/types";

interface FeedRowProps { entry: FeedEntry }

export function FeedRow({ entry }: FeedRowProps) {
  return (
    <Link href={`/wallet/${entry.address}`} className="flex items-center gap-4 border-b border-[hsl(var(--border-light))] py-4 last:border-0 hover:bg-[hsl(var(--secondary))] transition-colors px-2 -mx-2 rounded-sm">
      <WalletStamp address={entry.address} size={36} />
      <span className="address-mono flex-1 text-sm text-[hsl(var(--foreground))]">{entry.shortAddress}</span>
      <span className="font-serif-display text-2xl font-light text-[hsl(var(--foreground))]">{entry.score}</span>
      <TierBadge tier={entry.tier} size="sm" />
      <span className="w-20 text-right text-xs text-[hsl(var(--muted-foreground))]">{formatRelativeTime(entry.generatedAt)}</span>
    </Link>
  );
}
