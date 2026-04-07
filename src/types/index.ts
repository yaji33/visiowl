export type Tier = "Early Wallet" | "Active Member" | "Established" | "Power User" | "OG";

export type SignalCategory =
  | "Staking History"
  | "Governance Votes"
  | "DeFi Activity"
  | "NFT Holding"
  | "Transaction Volume"
  | "Wallet Age";

export interface Signal {
  category: SignalCategory;
  label: string;
  description: string;
  value: number;        
  contribution: number; 
  maxContribution: number;
  weight: number;     
}

export interface Badge {
  label: string;
  earnedAt?: string;
}

export interface LevelUpAction {
  icon: "coins" | "vote" | "layers" | "image";
  action: string;
  detail: string;
  link: string;
  linkLabel: string;
  pointsAvailable: number;
}

export interface WalletProfile {
  address: string;
  shortAddress: string;
  score: number;
  tier: Tier;
  memberSince: string;
  memberDuration: string;
  signals: Signal[];
  badges: Badge[];
  levelUpActions: LevelUpAction[];
  isPublic: boolean;
  lastRefreshed: string;
}

export interface ScoreResponse {
  address: string;
  score: number;
  tier: Tier;
  signals: Signal[];
  badges: Badge[];
  levelUpActions: LevelUpAction[];
  lastRefreshed: string;
  cached: boolean;
}

export type SpaceType = "open" | "verified";
export type AccessStatus = "checking" | "granted" | "denied";

export interface Space {
  id: string;
  name: string;
  description?: string;
  type: SpaceType;
  minScore: number;
  operatorAddress: string;
  operatorShortAddress: string;
  createdAt: string;
  memberCount: number;
  inviteUrl: string;
}

export interface FeedEntry {
  id: string;
  address: string;
  shortAddress: string;
  score: number;
  tier: Tier;
  badges: Badge[];
  generatedAt: string;
}
