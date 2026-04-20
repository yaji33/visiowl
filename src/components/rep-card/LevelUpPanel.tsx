import { Coins, Vote, Layers, ImageIcon, Users, ArrowUpRight } from "lucide-react";
import type { LevelUpAction } from "@/types";

const ICONS = { coins: Coins, vote: Vote, layers: Layers, image: ImageIcon, users: Users } as const;

interface LevelUpPanelProps {
  actions: LevelUpAction[];
}

export function LevelUpPanel({ actions }: LevelUpPanelProps) {
  if (!actions.length) return null;
  return (
    <div className="space-y-5">
      <h3 className="label-caps text-[hsl(var(--muted-foreground))]">Your next steps</h3>
      <div className="space-y-4">
        {actions.map((item, i) => {
          const Icon = ICONS[item.icon] ?? Coins;
          return (
            <div key={i} className="flex gap-3.5">
              <div className="mt-0.5 shrink-0">
                <Icon
                  className="h-4 w-4 text-[hsl(var(--muted-foreground))]"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              </div>
              <div className="min-w-0 space-y-0.5">
                <p className="text-sm font-medium text-[hsl(var(--foreground))]">{item.action}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">{item.detail}</p>
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-[hsl(var(--accent))] underline underline-offset-2 transition-opacity hover:opacity-80"
                >
                  {item.linkLabel}
                  <ArrowUpRight className="h-3 w-3" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
