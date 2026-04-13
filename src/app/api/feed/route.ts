import { NextResponse } from "next/server";
import { getFeedEntries } from "@/lib/feed-store";

export async function GET() {
  return NextResponse.json(getFeedEntries());
}
