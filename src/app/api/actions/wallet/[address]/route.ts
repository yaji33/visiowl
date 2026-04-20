import { NextResponse } from "next/server";
import { fetchWalletData } from "@/lib/scoring/helius";
import { computeRepScore } from "@/lib/scoring/compute";
import { shortenAddress } from "@/lib/utils";

type RouteContext = { params: Promise<{ address: string }> };

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://visiowl.app";
const ICON_URL = `${APP_URL}/images/favicon.png`;

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}

export async function GET(_req: Request, { params }: RouteContext) {
  const { address } = await params;
  const short = shortenAddress(address);
  const profileUrl = `${APP_URL}/wallet/${address}`;

  try {
    const raw = await fetchWalletData(address);
    const result = computeRepScore(raw);

    const topSignals = result.signals
      .filter((s) => s.contribution > 0)
      .sort((a, b) => b.contribution - a.contribution)
      .slice(0, 3)
      .map((s) => `${s.label} +${s.contribution}`)
      .join("  ·  ");

    const badgeLine =
      result.badges.length > 0
        ? result.badges.map((b) => b.label).join("  ·  ")
        : null;

    const descriptionParts = [
      `${result.tier}  ·  ${result.score} Rep Points`,
      topSignals || null,
      badgeLine ? `Badges: ${badgeLine}` : null,
    ].filter(Boolean);

    return NextResponse.json({
      icon: ICON_URL,
      label: "View Rep Card",
      title: `${short} — Visiowl`,
      description: descriptionParts.join("\n"),
      links: {
        actions: [
          {
            label: "View Full Rep Card",
            href: profileUrl,
          },
        ],
      },
    });
  } catch {
    return NextResponse.json({
      icon: ICON_URL,
      label: "View Rep Card",
      title: `${short} — Visiowl`,
      description: "Every Solana wallet has a story. See yours on Visiowl.",
      links: {
        actions: [
          {
            label: "View Rep Card",
            href: profileUrl,
          },
        ],
      },
    });
  }
}

export async function POST(_req: Request, { params }: RouteContext) {
  const { address } = await params;
  return NextResponse.json({
    type: "external-link",
    externalLink: `${APP_URL}/wallet/${address}`,
  });
}
