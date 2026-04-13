import { useQuery } from "@tanstack/react-query";
import type { Space } from "@/types";

async function fetchSpaces(): Promise<Space[]> {
  const res = await fetch("/api/space");
  if (!res.ok) throw new Error("Failed to fetch spaces");
  return res.json() as Promise<Space[]>;
}

export function useSpaces() {
  return useQuery<Space[]>({
    queryKey:  ["spaces"],
    queryFn:   fetchSpaces,
    staleTime: 30 * 1000,
  });
}
