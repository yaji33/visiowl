import { ActivityFeed } from "@/components/feed/ActivityFeed";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recent Rep Cards — Visiowl",
  description: "See the latest Rep Cards generated on Visiowl.",
};

export default function ActivityPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="mb-8">
        <h1 className="font-serif-display text-3xl font-light text-[hsl(var(--foreground))]">
          Recent Rep Cards
        </h1>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          All Rep Cards are public by default. Wallets can opt out from their profile.
        </p>
      </div>
      <ActivityFeed />
    </div>
  );
}
