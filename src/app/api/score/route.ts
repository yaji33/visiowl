import { NextResponse } from "next/server";
import { ScoreRefreshSchema } from "@/lib/validators";
import { fetchWalletData } from "@/lib/scoring/helius";
import { computeRepScore } from "@/lib/scoring/compute";

export async function POST(req: Request) {
  try {
    const body   = await req.json() as unknown;
    const parsed = ScoreRefreshSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const { address } = parsed.data;
    const raw    = await fetchWalletData(address);
    const result = computeRepScore(raw);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Score API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}