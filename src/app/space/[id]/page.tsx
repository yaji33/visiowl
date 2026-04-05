"use client";
import { useState, use, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { AccessGate } from "@/components/spaces/AccessGate";
import { ThresholdPicker } from "@/components/spaces/ThresholdPicker";
import { MOCK_SPACES } from "@/lib/mock-data";
import { useRepScore } from "@/lib/hooks/useRepScore";
import type { AccessStatus } from "@/types";

interface Props {
  params: Promise<{ id: string }>;
}

export default function SpacePage({ params }: Props) {
  const { id } = use(params);
  const space = MOCK_SPACES[id];
  const { publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  const [status, setStatus] = useState<AccessStatus | null>(null);
  const [threshold, setThreshold] = useState(300);

  const address = publicKey?.toBase58() ?? null;
  const { data: scoreData, isLoading: isScoreLoading } = useRepScore(address);
  const walletScore = scoreData?.score ?? 0;

  // Resolve checking state once score is available
  useEffect(() => {
    if (status !== "checking" || isScoreLoading) return;
    const required = space?.minScore ?? threshold;
    const timer = setTimeout(() => {
      setStatus(walletScore >= required ? "granted" : "denied");
    }, 1000);
    return () => clearTimeout(timer);
  }, [status, isScoreLoading, walletScore, space?.minScore, threshold]);

  const checkAccess = () => {
    if (!publicKey) {
      setVisible(true);
      return;
    }
    setStatus("checking");
  };

  if (!space)
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <div className="card-surface p-8">
          <ThresholdPicker value={threshold} onChange={setThreshold} />
          <div className="mt-6 text-center">
            <h2 className="font-serif-display text-2xl font-light text-[hsl(var(--foreground))]">
              Create a Verified Space
            </h2>
            <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
              Set a minimum Rep Score to gate your community.
            </p>
            <button
              onClick={checkAccess}
              className="mt-6 h-10 bg-[hsl(var(--primary))] px-6 text-sm font-medium text-[hsl(var(--primary-foreground))] transition-opacity hover:opacity-90"
            >
              {publicKey ? "Demo Access Check" : "Connect Wallet"}
            </button>
          </div>
          {status && (
            <AccessGate
              status={status}
              spaceName="Demo Space"
              score={walletScore}
              required={threshold}
            />
          )}
        </div>
      </div>
    );

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="card-surface p-8">
        <div className="space-y-2 text-center">
          <span className="label-caps text-[hsl(var(--muted-foreground))]">
            {space.type === "verified" ? "Verified Space" : "Open Space"}
          </span>
          <h1 className="font-serif-display text-3xl font-light text-[hsl(var(--foreground))]">
            {space.name}
          </h1>
          {space.description && (
            <p className="text-sm text-[hsl(var(--muted-foreground))]">{space.description}</p>
          )}
          {space.type === "verified" && (
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Requires Rep Score {space.minScore}+
            </p>
          )}
        </div>
        {!status && (
          <div className="mt-8 text-center">
            <button
              onClick={checkAccess}
              className="h-10 bg-[hsl(var(--primary))] px-6 text-sm font-medium text-[hsl(var(--primary-foreground))] transition-opacity hover:opacity-90"
            >
              {publicKey ? "Verify & Enter" : "Connect Wallet"}
            </button>
          </div>
        )}
        {status && (
          <AccessGate
            status={status}
            spaceName={space.name}
            score={walletScore}
            required={space.minScore}
          />
        )}
      </div>
    </div>
  );
}
