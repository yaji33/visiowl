import { useQuery } from "@tanstack/react-query";
import type { FeedEntry } from "@/types";

async function fetchFeed(): Promise<FeedEntry[]> {
  const res = await fetch("/api/feed");
  if (!res.ok) throw new Error("Failed to fetch feed");
  return res.json() as Promise<FeedEntry[]>;
}

export function useFeed() {
  return useQuery<FeedEntry[]>({
    queryKey:     ["feed"],
    queryFn:      fetchFeed,
    staleTime:    30 * 1000,
    refetchInterval: 60 * 1000,
  });
}
