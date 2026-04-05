import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Tier } from "@/types";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function shortenAddress(address: string, chars = 4): string {
  if (address.length < chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function isValidSolanaAddress(address: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
}

const TIER_THRESHOLDS: Array<{ min: number; tier: Tier }> = [
  { min: 750, tier: "OG" },
  { min: 500, tier: "Power User" },
  { min: 300, tier: "Established" },
  { min: 100, tier: "Active Member" },
  { min: 0, tier: "Early Wallet" },
];

export function getTier(score: number): Tier {
  for (const { min, tier } of TIER_THRESHOLDS) {
    if (score >= min) return tier;
  }
  return "Early Wallet";
}

export function getNextTier(score: number): { tier: Tier; threshold: number } | null {
  const idx = TIER_THRESHOLDS.findIndex(({ min }) => score >= min);
  if (idx === 0) return null;
  const next = TIER_THRESHOLDS[idx - 1];
  if (!next) return null;
  return { tier: next.tier, threshold: next.min };
}

export function formatRelativeTime(isoDate: string): string {
  const diff = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// Deterministic pixel avatar — seeded by wallet address
export function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2_147_483_647;
    return s / 2_147_483_647;
  };
}

export function clamp(v: number, min: number, max: number): number {
  return Math.min(Math.max(v, min), max);
}

export function formatMemberSince(createdAt: number): string {
  if (!createdAt) return "On-chain";
  return new Date(createdAt * 1000).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export function formatMemberDuration(createdAt: number): string {
  if (!createdAt) return "—";
  const ageMonths = Math.floor((Date.now() / 1000 - createdAt) / (30 * 24 * 3600));
  if (ageMonths <= 0) return "new";
  const years = Math.floor(ageMonths / 12);
  const months = ageMonths % 12;
  if (years === 0) return `${months}mo`;
  if (months === 0) return `${years}y`;
  return `${years}y ${months}mo`;
}
