import { cn } from "@/lib/utils";

interface ActivityBadgeProps { label: string; className?: string }

export function ActivityBadge({ label, className }: ActivityBadgeProps) {
  return (
    <span className={cn("label-caps inline-block border border-[hsl(var(--border))] px-2.5 py-1", className)}>
      {label}
    </span>
  );
}
