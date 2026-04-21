import { NextResponse } from "next/server";
import { getFeedEntries, getLeaderboard } from "@/lib/feed-store";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sort = searchParams.get("sort");
  const entries = await (sort === "score" ? getLeaderboard() : getFeedEntries());
  return NextResponse.json(entries);
}
