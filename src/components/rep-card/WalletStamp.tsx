"use client";
import { useMemo } from "react";
import { hashCode, seededRandom } from "@/lib/utils";

interface WalletStampProps { address: string; size?: number; className?: string }

export function WalletStamp({ address, size = 40, className }: WalletStampProps) {
  const grid = useMemo<boolean[]>(() => {
    const rng = seededRandom(hashCode(address));
    const cells: boolean[] = [];
    for (let row = 0; row < 6; row++) {
      const half = Array.from({ length: 3 }, () => rng() > 0.45);
      cells.push(...half, ...[...half].reverse());
    }
    return cells;
  }, [address]);

  const cell = size / 6;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={className} aria-label="Wallet avatar" role="img" style={{ flexShrink: 0 }}>
      <rect width={size} height={size} fill="hsl(40,20%,96%)" rx="2" />
      {grid.map((filled, i) => filled ? (
        <rect key={i} x={(i % 6) * cell} y={Math.floor(i / 6) * cell} width={cell} height={cell} fill="hsl(0,0%,10%)" opacity={0.8} />
      ) : null)}
    </svg>
  );
}
