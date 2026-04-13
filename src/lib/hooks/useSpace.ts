import { useQuery } from "@tanstack/react-query";
import type { Space } from "@/types";

async function fetchSpace(id: string): Promise<Space> {
  const res = await fetch(`/api/space/${id}`);
  if (!res.ok) throw new Error("Space not found");
  return res.json() as Promise<Space>;
}

export function useSpace(id: string) {
  return useQuery<Space>({
    queryKey:  ["space", id],
    queryFn:   () => fetchSpace(id),
    staleTime: 30 * 1000,
    retry:     false,
  });
}
