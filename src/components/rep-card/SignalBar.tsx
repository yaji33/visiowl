"use client";
import { motion } from "motion/react";

interface SignalBarProps { label: string; description: string; value: number; contribution: number; index?: number }

export function SignalBar({ label, description, value, contribution, index = 0 }: SignalBarProps) {
  return (
    <motion.div className="space-y-1.5" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2 + index * 0.1, duration: 0.3 }}>
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-[hsl(var(--foreground))]">{label}</span>
        <span className="font-mono-address text-xs text-[hsl(var(--muted-foreground))]">{contribution}</span>
      </div>
      <div className="h-px w-full rounded-full bg-[hsl(var(--secondary))]">
        <motion.div className="h-full rounded-full bg-[hsl(var(--foreground))]"
          initial={{ width: 0 }} animate={{ width: `${value * 100}%` }}
          transition={{ delay: 2 + index * 0.1, duration: 0.6, ease: [0.33, 1, 0.68, 1] }} />
      </div>
      <p className="text-xs text-[hsl(var(--muted-foreground))]">{description}</p>
    </motion.div>
  );
}
