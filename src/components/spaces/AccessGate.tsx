import { getTier } from "@/lib/utils";
import type { AccessStatus } from "@/types";

interface AccessGateProps {
  status: AccessStatus;
  spaceName: string;
  score: number;
  required: number;
  onEnter?: () => void;
  walletAddress?: string;
  gatedUrl?: string;
}

export function AccessGate({
  status,
  spaceName,
  score,
  required,
  onEnter,
  walletAddress,
  gatedUrl,
}: AccessGateProps) {
  if (status === "checking")
    return (
      <div className="flex flex-col items-center space-y-4 py-20">
        <h2 className="font-serif-display text-2xl font-light text-[hsl(var(--foreground))]">
          {spaceName}
        </h2>
        <p className="animate-pulse text-sm text-[hsl(var(--muted-foreground))]">
          Verifying your reputation…
        </p>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          This space requires Rep Score {required}+
        </p>
      </div>
    );

  if (status === "granted")
    return (
      <div className="flex flex-col items-center space-y-5 py-20">
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
          className="text-[hsl(var(--foreground))]"
          aria-hidden="true"
        >
          <circle cx="20" cy="20" r="19" stroke="currentColor" strokeWidth="1" />
          <path
            d="M12 20l6 6 10-12"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <h2 className="font-serif-display text-3xl font-light text-[hsl(var(--foreground))]">
          Access granted.
        </h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Your Rep Score: {score} · Required: {required}+
        </p>
        <div className="space-y-3 text-center">
          <p className="text-sm font-medium text-[hsl(var(--foreground))]">{spaceName}</p>
          {gatedUrl ? (
            <a
              href={gatedUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onEnter}
              className="inline-flex items-center gap-1.5 rounded-sm bg-[hsl(var(--primary))] px-5 py-2.5 text-sm font-medium text-[hsl(var(--primary-foreground))] transition-opacity hover:opacity-90"
            >
              Enter Space
            </a>
          ) : (
            <button
              onClick={onEnter}
              className="text-sm text-[hsl(var(--foreground))] underline underline-offset-2 transition-opacity hover:opacity-70"
            >
              Enter Space
            </button>
          )}
        </div>
        {walletAddress && (
          <a
            href={`/wallet/${walletAddress}`}
            className="text-xs text-[hsl(var(--muted-foreground))] underline underline-offset-2 transition-colors hover:text-[hsl(var(--foreground))]"
          >
            Share your Rep Card →
          </a>
        )}
      </div>
    );

  return (
    <div className="flex flex-col items-center space-y-5 py-20">
      <h2 className="font-serif-display text-center text-3xl font-light text-balance text-[hsl(var(--foreground))]">
        Your wallet is still building its history.
      </h2>
      <div className="flex items-center gap-6 text-sm text-[hsl(var(--muted-foreground))]">
        <span>
          Your score: <strong className="text-[hsl(var(--foreground))]">{score}</strong> (
          {getTier(score)})
        </span>
        <span>|</span>
        <span>
          Required: <strong className="text-[hsl(var(--foreground))]">{required}+</strong>
        </span>
      </div>
      {walletAddress && (
        <a
          href={`/wallet/${walletAddress}`}
          className="text-xs text-[hsl(var(--accent))] underline underline-offset-2 transition-opacity hover:opacity-80"
        >
          See your full Rep Card →
        </a>
      )}
    </div>
  );
}
