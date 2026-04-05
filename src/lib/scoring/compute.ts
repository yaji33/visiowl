import type { Signal, Badge, LevelUpAction, ScoreResponse } from "@/types";
import { getTier } from "@/lib/utils";

export interface RawWalletData {
  address: string;
  createdAt: number; 
  stakingMonths: number;
  totalSolStaked: number;
  governanceVoteCount: number;
  distinctDaos: number;
  defiProtocolCount: number;
  defiTxCount: number;
  nftHeldCount: number;
  maxNftHoldMonths: number;
  totalTxCount: number;
  distinctProgramCount: number;
}

function norm(v: number, max: number): number {
  return Math.min(v / max, 1);
}

export function computeRepScore(data: RawWalletData): ScoreResponse {
  const ageMonths = Math.floor((Date.now() / 1000 - data.createdAt) / (30 * 24 * 3600));

  const raw = {
    staking: norm(data.stakingMonths, 24) * 0.7 + norm(data.totalSolStaked, 500) * 0.3,
    governance: norm(data.governanceVoteCount, 50) * 0.75 + norm(data.distinctDaos, 5) * 0.25,
    defi: norm(data.defiProtocolCount, 10) * 0.6 + norm(data.defiTxCount, 200) * 0.4,
    nft: norm(data.nftHeldCount, 10) * 0.5 + norm(data.maxNftHoldMonths, 24) * 0.5,
    tx: norm(data.distinctProgramCount, 50) * 0.65 + norm(data.totalTxCount, 2000) * 0.35,
    age: norm(ageMonths, 36),
  };

  const createdDate = new Date(data.createdAt * 1000).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const signals: Signal[] = [
    {
      category: "Staking History",
      label: "Staking History",
      weight: 20,
      maxContribution: 200,
      value: raw.staking,
      contribution: Math.round(raw.staking * 200),
      description:
        data.stakingMonths > 0
          ? `Staked SOL for ${data.stakingMonths} months continuously`
          : "No staking activity yet",
    },
    {
      category: "Governance Votes",
      label: "Governance Votes",
      weight: 20,
      maxContribution: 200,
      value: raw.governance,
      contribution: Math.round(raw.governance * 200),
      description:
        data.governanceVoteCount > 0
          ? `${data.governanceVoteCount} governance votes across Realms`
          : "No governance participation yet",
    },
    {
      category: "DeFi Activity",
      label: "DeFi Activity",
      weight: 20,
      maxContribution: 200,
      value: raw.defi,
      contribution: Math.round(raw.defi * 200),
      description:
        data.defiProtocolCount > 0
          ? `Active across ${data.defiProtocolCount} DeFi protocols`
          : "No DeFi activity yet",
    },
    {
      category: "NFT Holding",
      label: "NFT Holding",
      weight: 15,
      maxContribution: 150,
      value: raw.nft,
      contribution: Math.round(raw.nft * 150),
      description:
        data.nftHeldCount > 0
          ? `${data.nftHeldCount} NFTs held for ${data.maxNftHoldMonths}+ months`
          : "No NFTs held yet",
    },
    {
      category: "Transaction Volume",
      label: "Transaction Volume",
      weight: 15,
      maxContribution: 150,
      value: raw.tx,
      contribution: Math.round(raw.tx * 150),
      description:
        data.totalTxCount > 0
          ? `${data.totalTxCount.toLocaleString()} txns across ${data.distinctProgramCount} programs`
          : "No transactions yet",
    },
    {
      category: "Wallet Age",
      label: "Wallet Age",
      weight: 10,
      maxContribution: 100,
      value: raw.age,
      contribution: Math.round(raw.age * 100),
      description:
        ageMonths > 0 ? `Active wallet since ${createdDate}` : "New wallet — just getting started",
    },
  ];

  const score = signals.reduce((sum, s) => sum + s.contribution, 0);
  const tier = getTier(score);

  const badges: Badge[] = [
    ...(data.stakingMonths >= 12 ? [{ label: "14-Month Staker" }] : []),
    ...(data.governanceVoteCount >= 10 ? [{ label: "Realms Veteran" }] : []),
    ...(data.defiProtocolCount >= 5 ? [{ label: "DeFi Explorer" }] : []),
    ...(data.nftHeldCount >= 3 && data.maxNftHoldMonths >= 6 ? [{ label: "NFT Diplomat" }] : []),
    ...(data.distinctDaos >= 3 ? [{ label: "DAO Contributor" }] : []),
    ...(data.governanceVoteCount >= 25 ? [{ label: "Power Voter" }] : []),
    ...(ageMonths >= 24 ? [{ label: "Early Adopter" }] : []),
  ];

  const levelUpActions: LevelUpAction[] = [
    ...(raw.staking < 0.5
      ? [
          {
            icon: "coins" as const,
            action: data.stakingMonths === 0 ? "Start staking SOL" : "Stake SOL for longer",
            detail: `Adds up to ${200 - Math.round(raw.staking * 200)} more points`,
            link: "https://marinade.finance",
            linkLabel: "Stake with Marinade →",
            pointsAvailable: 200 - Math.round(raw.staking * 200),
          },
        ]
      : []),
    ...(raw.governance < 0.6
      ? [
          {
            icon: "vote" as const,
            action: "Vote in governance proposals",
            detail: `Adds up to ${Math.round((0.6 - raw.governance) * 200)} points`,
            link: "https://app.realms.today",
            linkLabel: "Vote on Realms →",
            pointsAvailable: Math.round((0.6 - raw.governance) * 200),
          },
        ]
      : []),
    ...(raw.defi < 0.5
      ? [
          {
            icon: "layers" as const,
            action: "Explore a new DeFi protocol",
            detail: "Adds up to 50 points to DeFi Activity",
            link: "https://jup.ag",
            linkLabel: "Try Jupiter →",
            pointsAvailable: 50,
          },
        ]
      : []),
    ...(raw.nft < 0.4
      ? [
          {
            icon: "image" as const,
            action: "Purchase and hold an NFT for 6+ months",
            detail: "Long-held NFTs score well — even 1 NFT helps",
            link: "https://magiceden.io",
            linkLabel: "Browse Magic Eden →",
            pointsAvailable: 60,
          },
        ]
      : []),
  ]
    .sort((a, b) => b.pointsAvailable - a.pointsAvailable)
    .slice(0, 3);

  return {
    address: data.address,
    score,
    tier,
    signals,
    badges,
    levelUpActions,
    lastRefreshed: new Date().toISOString(),
    cached: false,
    createdAt: data.createdAt,
  };
}
