"use client";
import Link from "next/link";
import { useFeed } from "@/lib/hooks/useFeed";
import { FeedRow } from "./FeedRow";

interface LeaderboardPreviewProps {
  limit?: number;
}

export function LeaderboardPreview({ limit = 5 }: LeaderboardPreviewProps) {
  const { data: entries, isPending, isError } = useFeed("score");

  if (isError) return null;

  const top = entries ? entries.slice(0, limit) : [];
  if (!isPending && top.length === 0) return null;

  return (
    <section className="w-full max-w-2xl border-t border-[hsl(var(--border-light))] pt-10">
      <div className="mb-4 flex items-center justify-between">
        <p className="label-caps text-[hsl(var(--muted-foreground))]">Leaderboard</p>
        <Link
          href="/activity"
          className="text-xs text-[hsl(var(--muted-foreground))] underline underline-offset-2 transition-colors hover:text-[hsl(var(--foreground))]"
        >
          View all →
        </Link>
      </div>

      {isPending ? (
        <div>
          {Array.from({ length: limit }).map((_, i) => (
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
      ) : (
        <div>
          {top.map((entry, i) => (
            <FeedRow key={entry.id} entry={entry} rank={i + 1} />
          ))}
        </div>
      )}
    </section>
  );
}
