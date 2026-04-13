import { NextResponse } from "next/server";
import { ScoreRefreshSchema } from "@/lib/validators";
import { fetchWalletData } from "@/lib/scoring/helius";
import { computeRepScore } from "@/lib/scoring/compute";
import { pushFeedEntry } from "@/lib/feed-store";
import { shortenAddress } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as unknown;
    const parsed = ScoreRefreshSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const { address } = parsed.data;
    const raw = await fetchWalletData(address);
    const result = computeRepScore(raw);

    pushFeedEntry({
      id: address,
      address,
      shortAddress: shortenAddress(address),
      score: result.score,
      tier: result.tier,
      badges: result.badges,
      generatedAt: result.lastRefreshed,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("Score API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
