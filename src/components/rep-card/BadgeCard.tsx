import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Badge } from "@/types";

{/*const TIER_DOT: Record<string, string> = {
  Active: "bg-[hsl(181,80%,50%)]",
  Strong: "bg-[hsl(32,90%,55%)]",
  Elite: "bg-white/80",
};*/}

interface BadgeCardProps {
  badge: Badge;
  active?: boolean;
  size?: number;
  className?: string;
}

export function BadgeCard({ badge, active = false, size = 200, className }: BadgeCardProps) {
  const height = size;
  //const dot = badge.tier ? (TIER_DOT[badge.tier] ?? TIER_DOT.Active) : "";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[3px] transition-all duration-300",
        active ? "scale-100 opacity-100" : "scale-[0.93] opacity-50",
        className,
      )}
      style={{ width: size, height }}
    >
      {badge.imageSlug ? (
        <Image
          src={`/images/${badge.imageSlug}.png`}
          alt={badge.label}
          fill
          className="object-cover"
          priority={active}
          draggable={false}
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[hsl(0,0%,7%)] p-4">
          <div className="h-14 w-14 rounded-full border border-[hsl(0,0%,20%)] bg-[hsl(0,0%,12%)]" />
          <div className="space-y-1 text-center">
            <p className="label-caps text-[9px] text-[hsl(0,0%,35%)]">{badge.signal ?? "—"}</p>
            <p className="label-caps text-[10px] text-[hsl(0,0%,60%)]">{badge.label}</p>
          </div>
        </div>
      )}
    </div>
  );
}
