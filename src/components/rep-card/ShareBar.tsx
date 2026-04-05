"use client";
import { useState } from "react";
import { Link, ExternalLink, Check } from "lucide-react";

interface ShareBarProps { url: string }

export function ShareBar({ url }: ShareBarProps) {
  const [copied, setCopied] = useState(false);
  const copy = async () => { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const tweet = () => window.open(`https://x.com/intent/tweet?text=${encodeURIComponent("Check out my Visiowl Rep Score on Solana ✦")}&url=${encodeURIComponent(url)}`, "_blank");
  return (
    <div className="flex items-center gap-4">
      <button onClick={copy} className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors" aria-label="Copy link">
        {copied ? <Check className="h-3.5 w-3.5" /> : <Link className="h-3.5 w-3.5" />}
        <span className="underline underline-offset-2">{copied ? "Copied!" : "Copy Link"}</span>
      </button>
      <button onClick={tweet} className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors" aria-label="Post to X">
        <ExternalLink className="h-3.5 w-3.5" />
        <span className="underline underline-offset-2">Post to X</span>
      </button>
    </div>
  );
}
