import { Coins, Vote, Layers, ImageIcon, Users, Activity, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LevelUpAction } from "@/types";

const ICONS = {
  coins: Coins,
  vote: Vote,
  layers: Layers,
  image: ImageIcon,
  users: Users,
  activity: Activity,
} as const;

const CATEGORY_LABELS: Record<LevelUpAction["icon"], string> = {
  coins: "Staking",
  vote: "Governance",
  layers: "DeFi",
  image: "NFT",
  users: "Community",
  activity: "On-chain Activity",
};

interface PlatformGridProps {
  actions: LevelUpAction[];
}

function PlatformCard({
  item,
  variant,
}: {
  item: LevelUpAction;
  variant: "opportunity" | "community";
}) {
  const Icon = ICONS[item.icon] ?? Coins;
  const category = CATEGORY_LABELS[item.icon];

  return (
    <div
      className={cn(
        "card-surface flex flex-col gap-3 rounded-sm p-4 transition-shadow hover:shadow-md",
        variant === "opportunity",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon
            className="h-4 w-4 shrink-0 text-[hsl(var(--muted-foreground))]"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <span className="label-caps text-[hsl(var(--muted-foreground))]">{category}</span>
        </div>
        {item.pointsAvailable > 0 && (
          <span className="label-caps shrink-0 rounded-sm bg-[hsl(var(--accent)/0.12)] px-1.5 py-0.5 text-[hsl(var(--accent))]">
            +{item.pointsAvailable} pts
          </span>
        )}
      </div>

      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium text-[hsl(var(--foreground))]">{item.action}</p>
        <p className="text-xs leading-relaxed text-[hsl(var(--muted-foreground))]">{item.detail}</p>
      </div>

      <a
        href={item.link}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-xs text-[hsl(var(--accent))] underline underline-offset-2 transition-opacity hover:opacity-80"
      >
        {item.linkLabel}
        <ArrowUpRight className="h-3 w-3 shrink-0" />
      </a>
    </div>
  );
}

export function PlatformGrid({ actions }: PlatformGridProps) {
  if (!actions.length) return null;

  const opportunities = actions.filter((a) => a.pointsAvailable > 0);
  const community = actions.filter((a) => a.pointsAvailable === 0);

  return (
    <div className="space-y-6">
      {opportunities.length > 0 && (
        <div className="space-y-3">
          <h3 className="label-caps text-[hsl(var(--muted-foreground))]">Score opportunities</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {opportunities.map((item, i) => (
              <PlatformCard key={i} item={item} variant="opportunity" />
            ))}
          </div>
        </div>
      )}

      {community.length > 0 && (
        <div className="space-y-3">
          <h3 className="label-caps text-[hsl(var(--muted-foreground))]">Ecosystem</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {community.map((item, i) => (
              <PlatformCard key={i} item={item} variant="community" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
