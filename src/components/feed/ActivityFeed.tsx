"use client";
import { useFeed } from "@/lib/hooks/useFeed";
import { FeedRow } from "./FeedRow";

export function ActivityFeed() {
  const { data: entries, isPending, isError } = useFeed();

  if (isPending) {
    return (
      <div className="space-y-0">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex animate-pulse items-center gap-4 border-b border-[hsl(var(--border-light))] py-4 last:border-0"
          >
            <div className="h-9 w-9 rounded-sm bg-[hsl(var(--secondary))]" />
            <div className="h-3 flex-1 rounded bg-[hsl(var(--secondary))]" />
            <div className="h-6 w-10 rounded bg-[hsl(var(--secondary))]" />
            <div className="h-5 w-20 rounded bg-[hsl(var(--secondary))]" />
            <div className="h-3 w-14 rounded bg-[hsl(var(--secondary))]" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="py-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
        Failed to load activity. Please try again later.
      </p>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
        No Rep Cards generated yet. Be the first — connect your wallet.
      </p>
    );
  }

  return (
    <div>
      {entries.map((entry) => (
        <FeedRow key={entry.id} entry={entry} />
      ))}
    </div>
  );
}
