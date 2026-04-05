"use client";
import { useEffect } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";

interface RepScoreProps {
  score: number;
  animate?: boolean;
  size?: number;
}

export function RepScore({ score, animate: shouldAnimate = true, size = 180 }: RepScoreProps) {
  const count = useMotionValue(shouldAnimate ? 0 : score);
  const display = useTransform(count, (v) => Math.round(v));

  useEffect(() => {
    if (!shouldAnimate) {
      count.set(score); // update the MotionValue directly — no React re-render
      return;
    }
    const controls = animate(count, score, {
      duration: 1.8,
      ease: [0.33, 1, 0.68, 1],
    });
    return controls.stop;
  }, [score, shouldAnimate, count]);

  const r = (size - 16) / 2;
  const c = 2 * Math.PI * r;
  const progress = score / 1000;

  const dashOffset = c * (1 - progress);

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
      role="meter"
      aria-valuenow={score}
      aria-valuemin={0}
      aria-valuemax={1000}
      aria-label={`Rep Score ${score}`}
    >
      <svg width={size} height={size} className="absolute inset-0 -rotate-90" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="hsl(35,12%,90%)"
          strokeWidth="2.5"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="hsl(181,80%,25%)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={shouldAnimate ? { strokeDashoffset: c } : { strokeDashoffset: dashOffset }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 1.8, ease: [0.33, 1, 0.68, 1] }}
        />
      </svg>
      <motion.span className="font-serif-display text-6xl leading-none font-normal tracking-tight text-[hsl(var(--foreground))] tabular-nums antialiased">
        {display}
      </motion.span>
    </div>
  );
}
