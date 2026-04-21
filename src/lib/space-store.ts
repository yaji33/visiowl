import { redis } from "@/lib/redis";
import type { Space, SpaceMember, SpaceEvent } from "@/types";

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

function membersKey(spaceId: string) {
  return `visiowl:space-members:${spaceId}`;
}

export async function addSpaceMember(spaceId: string, member: SpaceMember): Promise<void> {
  await redis.hset(membersKey(spaceId), { [member.address]: JSON.stringify(member) });
}

export async function getSpaceMembers(spaceId: string): Promise<SpaceMember[]> {
  const raw = await redis.hgetall<Record<string, string>>(membersKey(spaceId));
  if (!raw) return [];
  return Object.values(raw)
    .map((v) => (typeof v === "string" ? JSON.parse(v) : v) as SpaceMember)
    .sort((a, b) => b.score - a.score);
}

function eventsKey(spaceId: string) {
  return `visiowl:space-events:${spaceId}`;
}

export async function addSpaceEvent(event: SpaceEvent): Promise<void> {
  await redis.hset(eventsKey(event.spaceId), { [event.id]: JSON.stringify(event) });
}

export async function getSpaceEvents(spaceId: string): Promise<SpaceEvent[]> {
  const raw = await redis.hgetall<Record<string, string>>(eventsKey(spaceId));
  if (!raw) return [];
  return Object.values(raw)
    .map((v) => (typeof v === "string" ? JSON.parse(v) : v) as SpaceEvent)
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
}

export async function getSpacesByMember(address: string): Promise<Space[]> {
  const spaces = await getSpaces();
  const results: Space[] = [];
  for (const space of spaces) {
    const entry = await redis.hget<string>(membersKey(space.id), address);
    if (entry) results.push(space);
  }
  return results;
}
