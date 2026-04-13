"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { BadgeCard } from "./BadgeCard";
import type { Badge } from "@/types";

const TIER_LABEL: Record<string, string> = {
  Active: "text-[hsl(181,80%,50%)]",
  Strong: "text-[hsl(32,90%,55%)]",
  Elite: "text-white/70",
};

interface BadgeShowcaseProps {
  badges: Badge[];
  className?: string;
}

export function BadgeShowcase({ badges, className }: BadgeShowcaseProps) {
  const [active, setActive] = useState(0);
  const [dir, setDir] = useState(1);

  if (badges.length === 0) return null;

  const total = badges.length;
  const current = badges[active]!;

  const go = (idx: number) => {
    if (idx === active) return;
    setDir(idx > active ? 1 : -1);
    setActive(idx);
  };
  const prev = () => go(active - 1);
  const next = () => go(active + 1);

  const ghost1 = badges[(active + 1) % total];
  const ghost2 = badges[(active + 2) % total];

  return (
    <div className={cn("select-none", className)}>
      <div className="relative flex items-start justify-center pt-6 pb-4">
        {total > 2 && ghost2 && (
          <div
            className="pointer-events-none absolute"
            style={{
              transform: "translateY(-20px) translateX(14px) scale(0.88)",
              opacity: 0.2,
              zIndex: 1,
            }}
          >
            <BadgeCard badge={ghost2} active={false} size={280} />
          </div>
        )}

        {total > 1 && ghost1 && (
          <div
            className="pointer-events-none absolute"
            style={{
              transform: "translateY(-11px) translateX(8px) scale(0.94)",
              opacity: 0.4,
              zIndex: 2,
            }}
          >
            <BadgeCard badge={ghost1} active={false} size={280} />
          </div>
        )}

        <div className="relative z-10">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={current.label}
              custom={dir}
              variants={{
                enter: (d: number) => ({ opacity: 0, x: d * 36, scale: 0.96 }),
                center: { opacity: 1, x: 0, scale: 1 },
                exit: (d: number) => ({ opacity: 0, x: -d * 36, scale: 0.97 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <BadgeCard badge={current} active size={560} />
            </motion.div>
          </AnimatePresence>
        </div>

        {active > 0 && (
          <button
            onClick={prev}
            className="absolute top-1/2 left-4 z-20 -translate-y-1/2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-1.5 shadow-sm transition-all hover:shadow-md active:scale-95"
            aria-label="Previous badge"
          >
            <ChevronLeft className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
          </button>
        )}

        {active < total - 1 && (
          <button
            onClick={next}
            className="absolute top-1/2 right-4 z-20 -translate-y-1/2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-1.5 shadow-sm transition-all hover:shadow-md active:scale-95"
            aria-label="Next badge"
          >
            <ChevronRight className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
          </button>
        )}
      </div>

      {total > 1 && (
        <div className="mb-4 flex items-center justify-center gap-1.5">
          {badges.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              aria-label={`Badge ${i + 1}`}
              className={cn(
                "rounded-full transition-all duration-200",
                i === active
                  ? "h-1.5 w-5 bg-[hsl(var(--accent))]"
                  : "h-1.5 w-1.5 bg-[hsl(var(--border))] hover:bg-[hsl(var(--muted-foreground))]",
              )}
            />
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={current.label}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
          className="space-y-3 px-6 text-center"
        >
          <div className="flex items-baseline justify-center gap-2">
            <p className="font-serif-display text-base font-light text-[hsl(var(--foreground))]">
              {current.label}
            </p>
            {current.tier && (
              <span
                className={cn(
                  "label-caps text-[9px]",
                  TIER_LABEL[current.tier] ?? TIER_LABEL.Active,
                )}
              >
                {current.tier}
              </span>
            )}
          </div>

          {current.description && (
            <p className="mx-auto max-w-[260px] text-[11px] text-[hsl(var(--muted-foreground))] italic">
              &ldquo;{current.description}&rdquo;
            </p>
          )}

          {current.signal && (
            <p className="label-caps text-[9px] text-[hsl(var(--muted-foreground))]">
              {current.signal} &middot; {active + 1} of {total}
            </p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
