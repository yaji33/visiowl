import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { SpaceEvent, SpaceEventType } from "@/types";

async function fetchSpaceEvents(spaceId: string): Promise<SpaceEvent[]> {
  const res = await fetch(`/api/space/${spaceId}/events`);
  if (!res.ok) throw new Error("Failed to fetch events");
  return res.json() as Promise<SpaceEvent[]>;
}

async function createSpaceEvent(
  spaceId: string,
  payload: {
    title: string;
    description?: string;
    type: SpaceEventType;
    link?: string;
    scheduledAt: string;
  },
): Promise<SpaceEvent> {
  const res = await fetch(`/api/space/${spaceId}/events`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create event");
  return res.json() as Promise<SpaceEvent>;
}

export function useSpaceEvents(spaceId: string) {
  return useQuery<SpaceEvent[]>({
    queryKey: ["space-events", spaceId],
    queryFn:  () => fetchSpaceEvents(spaceId),
    staleTime: 30 * 1000,
  });
}

export function useCreateSpaceEvent(spaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof createSpaceEvent>[1]) =>
      createSpaceEvent(spaceId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["space-events", spaceId] });
    },
  });
}
