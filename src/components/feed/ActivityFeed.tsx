"use client";
import { useFeed } from "@/lib/hooks/useFeed";
import { FeedRow } from "./FeedRow";

export function ActivityFeed() {
  const { data: entries, isPending, isError } = useFeed("score");

  if (isPending) {
    return (
      <div className="space-y-0">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex animate-pulse items-center gap-3 border-b border-[hsl(var(--border-light))] py-4 last:border-0"
          >
            <div className="h-3 w-7 rounded bg-[hsl(var(--secondary))]" />
            <div className="h-9 w-9 rounded-sm bg-[hsl(var(--secondary))]" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-32 rounded bg-[hsl(var(--secondary))]" />
              <div className="h-1 w-full rounded-full bg-[hsl(var(--secondary))]" />
            </div>
            <div className="h-6 w-10 rounded bg-[hsl(var(--secondary))]" />
            <div className="h-5 w-20 rounded bg-[hsl(var(--secondary))]" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="py-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
        Failed to load leaderboard. Please try again later.
      </p>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
        No wallets scored yet. Connect yours to claim the #1 spot.
      </p>
    );
  }

  return (
    <div>
      {entries.map((entry, i) => (
        <FeedRow key={entry.id} entry={entry} rank={i + 1} />
      ))}
    </div>
  );
}
