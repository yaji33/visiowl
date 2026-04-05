"use client";
import { getTier } from "@/lib/utils";

interface ThresholdPickerProps { value: number; onChange: (v: number) => void }

export function ThresholdPicker({ value, onChange }: ThresholdPickerProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-medium text-[hsl(var(--foreground))]">Minimum Rep Score</label>
        <span className="text-sm text-[hsl(var(--muted-foreground))]">{getTier(value)} ({value}+)</span>
      </div>
      <input type="range" min="0" max="1000" step="10" value={value} onChange={(e) => onChange(Number(e.target.value))}
        className="h-px w-full cursor-pointer appearance-none rounded-full bg-[hsl(var(--secondary))] accent-[hsl(var(--foreground))] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[hsl(var(--foreground))]" />
      <div className="flex justify-between"><span className="label-caps text-[hsl(var(--muted-foreground))]">Early Wallet</span><span className="label-caps text-[hsl(var(--muted-foreground))]">OG</span></div>
    </div>
  );
}
