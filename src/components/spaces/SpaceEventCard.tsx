import { MessageSquare, Sparkles, Vote, Gift, Calendar, ArrowUpRight } from "lucide-react";
import type { SpaceEvent, SpaceEventType } from "@/types";

const TYPE_META: Record<SpaceEventType, { label: string; Icon: React.ElementType }> = {
  ama:     { label: "AMA",     Icon: MessageSquare },
  mint:    { label: "Mint",    Icon: Sparkles },
  vote:    { label: "Vote",    Icon: Vote },
  airdrop: { label: "Airdrop", Icon: Gift },
  other:   { label: "Event",   Icon: Calendar },
};

function formatEventDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month:   "short",
    day:     "numeric",
    hour:    "2-digit",
    minute:  "2-digit",
    timeZoneName: "short",
  });
}

function isPast(iso: string): boolean {
  return new Date(iso).getTime() < Date.now();
}

interface SpaceEventCardProps {
  event: SpaceEvent;
}

export function SpaceEventCard({ event }: SpaceEventCardProps) {
  const { label, Icon } = TYPE_META[event.type] ?? TYPE_META.other;
  const past = isPast(event.scheduledAt);

  return (
    <div className={`card-surface flex gap-4 rounded-sm p-4 ${past ? "opacity-50" : ""}`}>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-[hsl(var(--secondary))]">
        <Icon className="h-4 w-4 text-[hsl(var(--muted-foreground))]" strokeWidth={1.5} />
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="label-caps text-[hsl(var(--accent))]">{label}</span>
          {past && (
            <span className="label-caps text-[hsl(var(--muted-foreground))]">ended</span>
          )}
        </div>
        <p className="text-sm font-medium text-[hsl(var(--foreground))]">{event.title}</p>
        {event.description && (
          <p className="text-xs leading-relaxed text-[hsl(var(--muted-foreground))]">
            {event.description}
          </p>
        )}
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          {formatEventDate(event.scheduledAt)}
        </p>
      </div>

      {event.link && !past && (
        <a
          href={event.link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex shrink-0 items-center gap-1 self-start text-xs text-[hsl(var(--accent))] underline underline-offset-2 transition-opacity hover:opacity-80"
        >
          Join <ArrowUpRight className="h-3 w-3" />
        </a>
      )}
    </div>
  );
}
