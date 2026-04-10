import type { WalletProfile, FeedEntry, Space } from "@/types";

export const MOCK_WALLETS: Record<string, WalletProfile> = {
  og: {
    address: "8mH3qX7vR2kL9ePdNtF4uWsYcB6jA1mZ5nV8pK9R",
    shortAddress: "8mH3...pK9R",
    score: 847, tier: "OG",
    memberSince: "Jan 2022", memberDuration: "3y",
    isPublic: true, lastRefreshed: new Date().toISOString(),
    signals: [
      { category: "Staking History",    label: "Staking History",    description: "Staked SOL for 14 months continuously",      value: 0.92, contribution: 184, maxContribution: 200, weight: 20 },
      { category: "Governance Votes",   label: "Governance Votes",   description: "33 governance votes across Realms",           value: 0.88, contribution: 176, maxContribution: 200, weight: 20 },
      { category: "DeFi Activity",      label: "DeFi Activity",      description: "Active across 8 DeFi protocols",              value: 0.78, contribution: 156, maxContribution: 200, weight: 20 },
      { category: "NFT Holding",        label: "NFT Holding",        description: "4 NFTs held for 12+ months",                  value: 0.96, contribution: 144, maxContribution: 150, weight: 15 },
      { category: "Transaction Volume", label: "Transaction Volume", description: "1,647 txns across 34 programs",               value: 0.87, contribution: 130, maxContribution: 150, weight: 15 },
      { category: "Wallet Age",         label: "Wallet Age",         description: "Active wallet since January 2022",            value: 0.57, contribution: 57,  maxContribution: 100, weight: 10 },
    ],
    badges: [{ label: "14-Month Staker" }, { label: "Realms Veteran" }, { label: "DeFi Explorer" }, { label: "NFT Diplomat" }],
    levelUpActions: [
      { icon: "vote",   action: "Vote in 2 more governance proposals", detail: "Adds up to 40 points to Governance score", link: "https://app.realms.today", linkLabel: "Vote on Realms →",  pointsAvailable: 40 },
      { icon: "layers", action: "Explore 1 new DeFi protocol",         detail: "Adds up to 20 points to DeFi Activity",    link: "https://jup.ag",           linkLabel: "Try Jupiter →",     pointsAvailable: 20 },
    ],
  },
  active: {
    address: "4xK2mNrP8sL1qW5tY9dF3uBcE7hA2oZ6jV0mR9P",
    shortAddress: "4xK2...mR9P",
    score: 312, tier: "Active Member",
    memberSince: "Mar 2023", memberDuration: "1y",
    isPublic: true, lastRefreshed: new Date(Date.now() - 720000).toISOString(),
    signals: [
      { category: "Staking History",    label: "Staking History",    description: "Staked SOL for 5 months",        value: 0.44, contribution: 88,  maxContribution: 200, weight: 20 },
      { category: "Governance Votes",   label: "Governance Votes",   description: "7 governance votes across Realms", value: 0.3, contribution: 60,  maxContribution: 200, weight: 20 },
      { category: "DeFi Activity",      label: "DeFi Activity",      description: "Active across 3 DeFi protocols", value: 0.35, contribution: 70,  maxContribution: 200, weight: 20 },
      { category: "NFT Holding",        label: "NFT Holding",        description: "1 NFT held for 6 months",        value: 0.40, contribution: 60,  maxContribution: 150, weight: 15 },
      { category: "Transaction Volume", label: "Transaction Volume", description: "234 txns across 12 programs",    value: 0.21, contribution: 31,  maxContribution: 150, weight: 15 },
      { category: "Wallet Age",         label: "Wallet Age",         description: "Active wallet since March 2023", value: 0.30, contribution: 30,  maxContribution: 100, weight: 10 },
    ],
    badges: [{ label: "DeFi Explorer" }],
    levelUpActions: [
      { icon: "coins",  action: "Stake SOL for 3 more months",  detail: "Adds up to 60 points to Staking score",    link: "https://marinade.finance",  linkLabel: "Stake with Marinade →", pointsAvailable: 60 },
      { icon: "vote",   action: "Vote in 5 governance proposals",detail: "Adds up to 100 points to Governance score",link: "https://app.realms.today",  linkLabel: "Vote on Realms →",      pointsAvailable: 100 },
      { icon: "image",  action: "Hold an NFT for 6+ months",    detail: "Adds up to 40 points to NFT Holding score", link: "https://magiceden.io",      linkLabel: "Browse Magic Eden →",   pointsAvailable: 40 },
    ],
  },
  early: {
    address: "2wL7kBdR4pN9sA1mQ6vT3cX8yF5eH0nJ2uE7nT4X",
    shortAddress: "2wL7...nT4X",
    score: 67, tier: "Early Wallet",
    memberSince: "Dec 2024", memberDuration: "3mo",
    isPublic: true, lastRefreshed: new Date(Date.now() - 1680000).toISOString(),
    signals: [
      { category: "Staking History",    label: "Staking History",    description: "No staking activity yet",            value: 0,    contribution: 0,  maxContribution: 200, weight: 20 },
      { category: "Governance Votes",   label: "Governance Votes",   description: "No governance participation yet",     value: 0,    contribution: 0,  maxContribution: 200, weight: 20 },
      { category: "DeFi Activity",      label: "DeFi Activity",      description: "Tried 1 DeFi protocol",              value: 0.12, contribution: 24, maxContribution: 200, weight: 20 },
      { category: "NFT Holding",        label: "NFT Holding",        description: "No NFTs held yet",                   value: 0,    contribution: 0,  maxContribution: 150, weight: 15 },
      { category: "Transaction Volume", label: "Transaction Volume", description: "43 txns across 3 programs",          value: 0.15, contribution: 23, maxContribution: 150, weight: 15 },
      { category: "Wallet Age",         label: "Wallet Age",         description: "New wallet — 3 months old",          value: 0.08, contribution: 20, maxContribution: 100, weight: 10 },
    ],
    badges: [],
    levelUpActions: [
      { icon: "coins",  action: "Start staking SOL",                  detail: "Adds up to 200 points — the biggest single boost", link: "https://marinade.finance", linkLabel: "Stake with Marinade →", pointsAvailable: 200 },
      { icon: "vote",   action: "Cast your first governance vote",    detail: "Adds up to 40 points instantly",                   link: "https://app.realms.today", linkLabel: "Vote on Realms →",      pointsAvailable: 40 },
      { icon: "layers", action: "Explore DeFi on Jupiter",            detail: "Adds up to 50 points to DeFi Activity",            link: "https://jup.ag",           linkLabel: "Try Jupiter →",         pointsAvailable: 50 },
    ],
  },
};

export const MOCK_FEED: FeedEntry[] = [
  { id: "f1", address: MOCK_WALLETS["og"]!.address,     shortAddress: "8mH3...pK9R", score: 847, tier: "OG",            badges: MOCK_WALLETS["og"]!.badges,     generatedAt: new Date(Date.now() -   180000).toISOString() },
  { id: "f2", address: MOCK_WALLETS["active"]!.address, shortAddress: "4xK2...mR9P", score: 312, tier: "Active Member", badges: MOCK_WALLETS["active"]!.badges, generatedAt: new Date(Date.now() -   720000).toISOString() },
  { id: "f3", address: MOCK_WALLETS["early"]!.address,  shortAddress: "2wL7...nT4X", score: 67,  tier: "Early Wallet",  badges: [],                             generatedAt: new Date(Date.now() -  1680000).toISOString() },
  { id: "f4", address: "9kN4pW3sR7vL2mB5tA8xF1eY6hK0jQ3uZ", shortAddress: "9kN4...xQ2L", score: 723, tier: "Power User",   badges: [{ label: "Realms Veteran" }, { label: "14-Month Staker" }], generatedAt: new Date(Date.now() -  3600000).toISOString() },
  { id: "f5", address: "3mP8nK2sW6vA4rB9tC7xF1eY5hJ0qQ2u", shortAddress: "3mP8...dW5Y", score: 489, tier: "Established",  badges: [{ label: "DeFi Explorer" }],  generatedAt: new Date(Date.now() -  3900000).toISOString() },
  { id: "f6", address: "7vR1kL4sP9mN3wB2tD8xF5eY6hJ2qQ1u", shortAddress: "7vR1...hK6T", score: 134, tier: "Early Wallet",  badges: [],                             generatedAt: new Date(Date.now() -  7200000).toISOString() },
];

export const MOCK_SPACES: Record<string, Space> = {
  "superteam-core": {
    id: "superteam-core", name: "Superteam Core Contributors",
    description: "Private channel for verified Superteam contributors",
    type: "verified", minScore: 400,
    operatorAddress: MOCK_WALLETS["og"]!.address,
    operatorShortAddress: "8mH3...pK9R",
    createdAt: new Date(Date.now() - 604800000).toISOString(),
    memberCount: 34, inviteUrl: "https://visiowl.xyz/space/superteam-core",
  },
  "open-dao": {
    id: "open-dao", name: "Open DAO Forum",
    description: "Open to all Solana wallet holders",
    type: "open", minScore: 0,
    operatorAddress: MOCK_WALLETS["active"]!.address,
    operatorShortAddress: "4xK2...mR9P",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    memberCount: 201, inviteUrl: "https://visiowl.xyz/space/open-dao",
  },
};
