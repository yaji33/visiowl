import type { Space } from "@/types";

const store = new Map<string, Space>();

export function pushSpace(space: Space): void {
  store.set(space.id, space);
}

export function getSpace(id: string): Space | undefined {
  return store.get(id);
}

export function getSpaces(): Space[] {
  return [...store.values()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}
