import { FeedRow }    from "@/components/feed/FeedRow";
import { MOCK_FEED }  from "@/lib/mock-data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recent Rep Cards — Visiowl",
  description: "See the latest Rep Cards generated on Visiowl.",
};

export default function ActivityPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="mb-8">
        <h1 className="font-serif-display text-3xl font-light text-[hsl(var(--foreground))]">Recent Rep Cards</h1>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">Only wallets who opted in to appear here are shown.</p>
      </div>
      <div>
        {MOCK_FEED.map((entry) => <FeedRow key={entry.id} entry={entry} />)}
      </div>
    </div>
  );
}
