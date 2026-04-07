import { RepCard }      from "@/components/rep-card/RepCard";
import { LevelUpPanel }  from "@/components/rep-card/LevelUpPanel";
import { MOCK_WALLETS }  from "@/lib/mock-data";
import { shortenAddress, getTier } from "@/lib/utils";
import type { Metadata } from "next";
import type { WalletProfile } from "@/types";

interface Props { params: Promise<{ address: string }> }

async function getProfile(address: string): Promise<WalletProfile> {
  const mock = Object.values(MOCK_WALLETS).find(
    (w) => w.address === address || w.shortAddress === address,
  );
  if (mock) return mock;
  return {
    address, shortAddress: shortenAddress(address), score: 0,
    tier: "Early Wallet", memberSince: "Unknown", memberDuration: "—",
    isPublic: true, lastRefreshed: new Date().toISOString(),
    signals: [], badges: [],
    levelUpActions: [
      { icon: "coins",  action: "Start staking SOL",              detail: "Biggest single boost available",  link: "https://marinade.finance", linkLabel: "Stake with Marinade →", pointsAvailable: 200 },
      { icon: "vote",   action: "Cast your first governance vote", detail: "Adds up to 40 points instantly", link: "https://app.realms.today",  linkLabel: "Vote on Realms →",      pointsAvailable: 40 },
    ],
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { address } = await params;
  const profile = await getProfile(address);
  return {
    title: `${profile.shortAddress} — Visiowl`,
    description: `Rep Score: ${profile.score} · ${getTier(profile.score)}`,
    openGraph: { title: `${profile.shortAddress} on Visiowl`, description: `Rep Score: ${profile.score}` },
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
