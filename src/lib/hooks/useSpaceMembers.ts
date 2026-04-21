import { useQuery } from "@tanstack/react-query";
import type { SpaceMember } from "@/types";

async function fetchSpaceMembers(spaceId: string): Promise<SpaceMember[]> {
  const res = await fetch(`/api/space/${spaceId}/members`);
  if (!res.ok) throw new Error("Failed to fetch members");
  return res.json() as Promise<SpaceMember[]>;
}

export function useSpaceMembers(spaceId: string) {
  return useQuery<SpaceMember[]>({
    queryKey: ["space-members", spaceId],
    queryFn:  () => fetchSpaceMembers(spaceId),
    staleTime: 30 * 1000,
  });
}
