import type { SignalCategory } from "@/types";

export type BadgeTier = "Active" | "Strong" | "Elite";

export interface BadgeDefinition {
  id: string;
  label: string;
  signal: SignalCategory;
  tier: BadgeTier;
  description: string;
  imageSlug?: string;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: "early-wallet",
    label: "Early Wallet",
    signal: "Wallet Age",
    tier: "Active",
    description: "This wallet has been around long enough to know the game.",
    imageSlug: "wallet-1",
  },
  {
    id: "established-wallet",
    label: "Established Wallet",
    signal: "Wallet Age",
    tier: "Strong",
    description: "Consistency over time earns real trust.",
    imageSlug: "wallet-2",
  },
  {
    id: "early-adopter",
    label: "Early Adopter",
    signal: "Wallet Age",
    tier: "Elite",
    description: "Built on Solana before it was obvious.",
    imageSlug: "wallet-3",
  },

  {
    id: "staker",
    label: "Staker",
    signal: "Staking History",
    tier: "Active",
    description: "You put skin in the game.",
    imageSlug: "stake-1",
  },
  {
    id: "diamond-staker",
    label: "Diamond Staker",
    signal: "Staking History",
    tier: "Elite",
    description: "Long-term staking shows deep commitment.",
    imageSlug: "stake-2",
  },

  {
    id: "nft-collector",
    label: "NFT Collector",
    signal: "NFT Holding",
    tier: "Active",
    description: "You hold NFTs and participate in culture.",
    imageSlug: "nft-1",
  },
  {
    id: "nft-diplomat",
    label: "NFT Diplomat",
    signal: "NFT Holding",
    tier: "Strong",
    description: "Long-term holders signal conviction, not flipping.",
    imageSlug: "nft-2",
  },

  {
    id: "realms-veteran",
    label: "Realms Veteran",
    signal: "Governance Votes",
    tier: "Active",
    description: "Your vote shapes the protocol.",
  },
  {
    id: "dao-contributor",
    label: "DAO Contributor",
    signal: "Governance Votes",
    tier: "Strong",
    description: "Across multiple DAOs, your voice carries.",
  },
  {
    id: "power-voter",
    label: "Power Voter",
    signal: "Governance Votes",
    tier: "Elite",
    description: "25+ governance votes. You show up.",
  },

  {
    id: "defi-explorer",
    label: "DeFi Explorer",
    signal: "DeFi Activity",
    tier: "Active",
    description: "You've navigated five or more protocols.",
  },
  {
    id: "degen",
    label: "Degen",
    signal: "Transaction Volume",
    tier: "Active",
    description: "You've touched pump.fun. No judgment — it's part of the meta.",
  },
];

export function getBadgeDef(id: string): BadgeDefinition | undefined {
  return BADGE_DEFINITIONS.find((b) => b.id === id);
}
