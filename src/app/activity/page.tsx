import { ActivityFeed } from "@/components/feed/ActivityFeed";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leaderboard — Visiowl",
  description: "Solana wallets ranked by Rep Score. Connect yours to claim your position.",
};

export default function ActivityPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="mb-8">
        <h1 className="font-serif-display text-3xl font-light text-[hsl(var(--foreground))]">
          Leaderboard
        </h1>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          Solana wallets ranked by Rep Score. All Rep Cards are public by default.
        </p>
      </div>
      <ActivityFeed />
    </div>
  );
}
