import Link from "next/link";
import { Users } from "lucide-react";
import { RepCard } from "@/components/rep-card/RepCard";
import { PlatformGrid } from "@/components/rep-card/PlatformGrid";
import { getLeaderboard } from "@/lib/feed-store";
import { getSpacesByMember } from "@/lib/space-store";
import { shortenAddress, getTier, formatMemberSince, formatMemberDuration } from "@/lib/utils";
import type { Metadata } from "next";
import type { WalletProfile, ScoreResponse, Space } from "@/types";

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
          detail: "Biggest single boost available",
          link: "https://marinade.finance",
          linkLabel: "Stake with Marinade →",
          pointsAvailable: 200,
        },
        {
          icon: "vote",
          action: "Cast your first governance vote",
          detail: "Adds up to 40 points instantly",
          link: "https://app.realms.today",
          linkLabel: "Vote on Realms →",
          pointsAvailable: 40,
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
  const [profile, leaderboard, memberSpaces] = await Promise.all([
    getProfile(address),
    getLeaderboard(),
    getSpacesByMember(address),
  ]);

  const rank = leaderboard.findIndex((e) => e.address === address) + 1;

  return (
    <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 py-16">
      {rank > 0 && (
        <p className="label-caps text-[hsl(var(--muted-foreground))]">
          #{rank} on the{" "}
          <Link
            href="/activity"
            className="underline underline-offset-2 transition-colors hover:text-[hsl(var(--foreground))]"
          >
            leaderboard
          </Link>
        </p>
      )}

      <RepCard wallet={profile} animate={false} />

      <div className="w-full max-w-[560px]">
        <PlatformGrid actions={profile.levelUpActions} />
      </div>

      {memberSpaces.length > 0 && (
        <div className="w-full max-w-[560px] space-y-3">
          <p className="label-caps text-[hsl(var(--muted-foreground))]">Member of</p>
          <div className="space-y-2">
            {memberSpaces.map((space: Space) => (
              <Link
                key={space.id}
                href={`/space/${space.id}`}
                className="flex items-center justify-between gap-3 rounded-sm border border-[hsl(var(--border-light))] px-4 py-3 transition-colors hover:border-[hsl(var(--border))] hover:bg-[hsl(var(--secondary))]"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <Users
                    className="h-3.5 w-3.5 shrink-0 text-[hsl(var(--muted-foreground))]"
                    strokeWidth={1.5}
                  />
                  <span className="truncate text-sm text-[hsl(var(--foreground))]">
                    {space.name}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-3 text-xs text-[hsl(var(--muted-foreground))]">
                  {space.type === "verified" && <span>{space.minScore}+ rep</span>}
                  <span>
                    {space.memberCount} {space.memberCount === 1 ? "member" : "members"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
