import type { Signal, Badge, LevelUpAction, ScoreResponse } from "@/types";
import { getTier } from "@/lib/utils";
import { getBadgeDef } from "@/lib/badges";

function award(id: string): Badge {
  const def = getBadgeDef(id);
  return {
    label: def?.label ?? id,
    imageSlug: def?.imageSlug,
    signal: def?.signal,
    tier: def?.tier,
    description: def?.description,
  };
}

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
  pumpfunTxCount: number;
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
    ...(ageMonths >= 24
      ? [award("early-adopter")]
      : ageMonths >= 12
        ? [award("established-wallet")]
        : ageMonths >= 6
          ? [award("early-wallet")]
          : []),
    ...(data.stakingMonths >= 12
      ? [award("diamond-staker")]
      : data.stakingMonths >= 3
        ? [award("staker")]
        : []),
    ...(data.nftHeldCount >= 3 && data.maxNftHoldMonths >= 6
      ? [award("nft-diplomat")]
      : data.nftHeldCount >= 1
        ? [award("nft-collector")]
        : []),
    ...(data.governanceVoteCount >= 25
      ? [award("power-voter")]
      : data.governanceVoteCount >= 10
        ? [award("realms-veteran")]
        : []),
    ...(data.distinctDaos >= 3 ? [award("dao-contributor")] : []),
    ...(data.defiProtocolCount >= 5 ? [award("defi-explorer")] : []),
    ...(data.pumpfunTxCount > 0 ? [award("degen")] : []),
  ];

  const scoreActions: LevelUpAction[] = [
    ...(raw.staking < 0.5
      ? [
          {
            icon: "coins" as const,
            action: data.stakingMonths === 0 ? "Start staking SOL" : "Stake SOL for longer",
            detail:
              data.stakingMonths === 0
                ? `Unlock up to ${200 - Math.round(raw.staking * 200)} points — try Marinade (mSOL), Jito (MEV rewards), BlazeStake (BLZE), or Sanctum`
                : `Up to ${200 - Math.round(raw.staking * 200)} more points — Jito offers MEV-boosted liquid staking; BlazeStake rewards stakers with BLZE`,
            link: data.stakingMonths === 0 ? "https://marinade.finance" : "https://jito.network",
            linkLabel: data.stakingMonths === 0 ? "Stake with Marinade →" : "Boost with Jito →",
            pointsAvailable: 200 - Math.round(raw.staking * 200),
          },
        ]
      : []),
    ...(raw.governance < 0.6
      ? [
          {
            icon: "vote" as const,
            action: "Vote in Solana governance proposals",
            detail: `Up to ${Math.round((0.6 - raw.governance) * 200)} points — Realms hosts Mango, Drift, Orca, and dozens of active DAOs`,
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
            action:
              data.defiProtocolCount === 0
                ? "Try your first DeFi protocol"
                : "Explore a new DeFi protocol",
            detail:
              data.defiProtocolCount === 0
                ? "Adds up to 50 points — start with Jupiter for swaps, then explore Kamino (lending), Drift (perps), or Meteora (dynamic pools)"
                : `Adds up to 50 points — try Kamino Finance (yield/lending), Drift Protocol (perps & vaults), or Meteora (DLMM pools)`,
            link: data.defiProtocolCount === 0 ? "https://jup.ag" : "https://kamino.finance",
            linkLabel: data.defiProtocolCount === 0 ? "Start with Jupiter →" : "Try Kamino →",
            pointsAvailable: 50,
          },
        ]
      : []),
    ...(raw.nft < 0.4
      ? [
          {
            icon: "image" as const,
            action: "Collect and hold an NFT for 6+ months",
            detail:
              data.nftHeldCount === 0
                ? "Start free on DRiP Haus, or browse collections on Tensor for analytics-driven buying"
                : "Long-held NFTs score highest — use Tensor's portfolio tools to track conviction holds",
            link: data.nftHeldCount === 0 ? "https://drip.haus" : "https://tensor.trade",
            linkLabel: data.nftHeldCount === 0 ? "Get free drops on DRiP →" : "Browse Tensor →",
            pointsAvailable: 60,
          },
        ]
      : []),
  ]
    .sort((a, b) => b.pointsAvailable - a.pointsAvailable)
    .slice(0, 3);

  const communityActions: LevelUpAction[] = [
    {
      icon: "users" as const,
      action: "Join the Superteam builder network",
      detail:
        "Bounties, grants, and ecosystem connections across Solana — open to any verified contributor",
      link: "https://superteam.fun",
      linkLabel: "Explore Superteam →",
      pointsAvailable: 0,
    },
  ];

  const levelUpActions: LevelUpAction[] = [...scoreActions, ...communityActions];

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
