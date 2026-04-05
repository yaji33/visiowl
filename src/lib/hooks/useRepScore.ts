import { useQuery } from "@tanstack/react-query";
import type { ScoreResponse } from "@/types";

async function fetchRepScore(address: string): Promise<ScoreResponse> {
  const res = await fetch("/api/score", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address }),
  });
  if (!res.ok) throw new Error("Failed to fetch score");
  return res.json() as Promise<ScoreResponse>;
}

export function useRepScore(address: string | null) {
  return useQuery({
    queryKey:  ["repScore", address],
    queryFn:   () => fetchRepScore(address!),
    enabled:   !!address,
    staleTime: 5 * 60 * 1000,
    retry:     1,
  });
}