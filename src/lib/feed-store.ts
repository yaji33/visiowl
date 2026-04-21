import { redis } from "@/lib/redis";
import type { FeedEntry } from "@/types";

const HASH_KEY = "visiowl:feed";
const MAX_ENTRIES = 50;

export async function pushFeedEntry(entry: FeedEntry): Promise<void> {
  await redis.hset(HASH_KEY, { [entry.address]: JSON.stringify(entry) });

  const all = await _getAll();
  if (all.length > MAX_ENTRIES) {
    const oldest = all
      .sort((a, b) => new Date(a.generatedAt).getTime() - new Date(b.generatedAt).getTime())
      .slice(0, all.length - MAX_ENTRIES);
    await Promise.all(oldest.map((e) => redis.hdel(HASH_KEY, e.address)));
  }
}

async function _getAll(): Promise<FeedEntry[]> {
  const raw = await redis.hgetall<Record<string, string>>(HASH_KEY);
  if (!raw) return [];
  return Object.values(raw).map((v) => (typeof v === "string" ? JSON.parse(v) : v) as FeedEntry);
}

export async function getFeedEntries(): Promise<FeedEntry[]> {
  const all = await _getAll();
  return all.sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());
}

export async function getLeaderboard(): Promise<FeedEntry[]> {
  const all = await _getAll();
  return all.sort((a, b) => b.score - a.score);
}
