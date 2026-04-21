import { useQuery } from "@tanstack/react-query";
import type { FeedEntry } from "@/types";

type SortOrder = "score" | "recent";

async function fetchFeed(sort: SortOrder): Promise<FeedEntry[]> {
  const url = sort === "score" ? "/api/feed?sort=score" : "/api/feed";
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch feed");
  return res.json() as Promise<FeedEntry[]>;
}

export function useFeed(sort: SortOrder = "recent") {
  return useQuery<FeedEntry[]>({
    queryKey: ["feed", sort],
    queryFn: () => fetchFeed(sort),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}
