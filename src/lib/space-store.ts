import { redis } from "@/lib/redis";
import type { Space } from "@/types";

const HASH_KEY = "visiowl:spaces";

export async function pushSpace(space: Space): Promise<void> {
  await redis.hset(HASH_KEY, { [space.id]: JSON.stringify(space) });
}

export async function getSpace(id: string): Promise<Space | undefined> {
  const raw = await redis.hget<string>(HASH_KEY, id);
  if (!raw) return undefined;
  return (typeof raw === "string" ? JSON.parse(raw) : raw) as Space;
}

export async function getSpaces(): Promise<Space[]> {
  const all = await redis.hgetall<Record<string, string>>(HASH_KEY);
  if (!all) return [];
  return Object.values(all)
    .map((v) => (typeof v === "string" ? JSON.parse(v) : v) as Space)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function patchSpace(id: string, updates: Partial<Space>): Promise<Space | undefined> {
  const existing = await getSpace(id);
  if (!existing) return undefined;
  const updated = { ...existing, ...updates };
  await redis.hset(HASH_KEY, { [id]: JSON.stringify(updated) });
  return updated;
}
