import { RepCard } from "@/components/rep-card/RepCard";
import { LevelUpPanel } from "@/components/rep-card/LevelUpPanel";
import { shortenAddress, getTier, formatMemberSince, formatMemberDuration } from "@/lib/utils";
import type { Metadata } from "next";
import type { ScoreResponse, WalletProfile } from "@/types";

interface Props {
  params: Promise<{ address: string }>;
}

async function getProfile(address: string): Promise<WalletProfile> {
  try {
    const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const res = await fetch(`${base}/api/score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address }),
      next: { revalidate: 300 }, 
    });
    if (!res.ok) throw new Error("API error");
    const data = (await res.json()) as ScoreResponse;
    return {
      address: data.address,
      shortAddress: shortenAddress(data.address),
      score: data.score,
      tier: data.tier,
      memberSince: formatMemberSince(data.createdAt),
      memberDuration: formatMemberDuration(data.createdAt),
      isPublic: true,
      lastRefreshed: data.lastRefreshed,
      signals: data.signals,
      badges: data.badges,
      levelUpActions: data.levelUpActions,
    };
  } catch {
    return {
      address,
      shortAddress: shortenAddress(address),
      score: 0,
      tier: "Early Wallet",
      memberSince: "Unknown",
      memberDuration: "—",
      isPublic: true,
      lastRefreshed: new Date().toISOString(),
      signals: [],
      badges: [],
      levelUpActions: [
        {
          icon: "coins",
          action: "Start staking SOL",
          detail: "Biggest single boost",
          link: "https://marinade.finance",
          linkLabel: "Stake with Marinade →",
          pointsAvailable: 200,
        },
        {
          icon: "vote",
          action: "Cast your first governance vote",
          detail: "Adds up to 40 points",
          link: "https://app.realms.today",
          linkLabel: "Vote on Realms →",
          pointsAvailable: 40,
        },
        {
          icon: "layers",
          action: "Explore DeFi on Jupiter",
          detail: "Adds up to 50 points",
          link: "https://jup.ag",
          linkLabel: "Try Jupiter →",
          pointsAvailable: 50,
        },
      ],
    };
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { address } = await params;
  const profile = await getProfile(address);
  return {
    title: `${profile.shortAddress} — Visiowl`,
    description: `Rep Score: ${profile.score} · ${getTier(profile.score)}`,
    openGraph: {
      title: `${profile.shortAddress} on Visiowl`,
      description: `Rep Score: ${profile.score}`,
    },
  };
}

export default async function WalletPage({ params }: Props) {
  const { address } = await params;
  const profile = await getProfile(address);
  return (
    <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 py-16">
      <RepCard wallet={profile} animate={false} />
      <div className="w-full max-w-[560px]">
        <LevelUpPanel actions={profile.levelUpActions} />
      </div>
    </div>
  );
}
