import { cn } from "@/lib/utils";
import type { Tier } from "@/types";

interface TierBadgeProps { tier: Tier; size?: "sm" | "md"; className?: string }

export function TierBadge({ tier, size = "md", className }: TierBadgeProps) {
  return (
    <span className={cn("label-caps inline-block border border-[hsl(var(--border))]", size === "sm" ? "px-2 py-0.5" : "px-3 py-1", className)}>
      {tier}
    </span>
  );
}
