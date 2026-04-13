import type { FeedEntry } from "@/types";

const MAX_ENTRIES = 50;

const store: FeedEntry[] = [];

export function pushFeedEntry(entry: FeedEntry): void {
  const idx = store.findIndex((e) => e.address === entry.address);
  if (idx !== -1) {
    store[idx] = entry;
  } else {
    store.unshift(entry);
    if (store.length > MAX_ENTRIES) store.pop();
  }
}

export function getFeedEntries(): FeedEntry[] {
  return [...store].sort(
    (a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime(),
  );
}
