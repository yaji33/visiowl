"use client";
import { useState, use } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { AccessGate }    from "@/components/spaces/AccessGate";
import { ThresholdPicker } from "@/components/spaces/ThresholdPicker";
import { MOCK_SPACES, MOCK_WALLETS } from "@/lib/mock-data";
import type { AccessStatus } from "@/types";

interface Props { params: Promise<{ id: string }> }

export default function SpacePage({ params }: Props) {
  const { id }          = use(params);
  const space           = MOCK_SPACES[id];
  const { publicKey }   = useWallet();
  const { setVisible }  = useWalletModal();
  const [status, setStatus] = useState<AccessStatus | null>(null);
  const [threshold, setThreshold] = useState(300);

  // Demo score from og wallet
  const demoScore = MOCK_WALLETS["og"]!.score;

  const checkAccess = () => {
    if (!publicKey) { setVisible(true); return; }
    setStatus("checking");
    setTimeout(() => setStatus(demoScore >= (space?.minScore ?? threshold) ? "granted" : "denied"), 2000);
  };

  if (!space) return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="card-surface p-8">
        <ThresholdPicker value={threshold} onChange={setThreshold} />
        <div className="mt-6 text-center">
          <h2 className="font-serif-display text-2xl font-light text-[hsl(var(--foreground))]">Create a Verified Space</h2>
          <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">Set a minimum Rep Score to gate your community.</p>
          <button onClick={checkAccess} className="mt-6 h-10 px-6 text-sm font-medium bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 transition-opacity">
            {publicKey ? "Demo Access Check" : "Connect Wallet"}
          </button>
        </div>
        {status && <AccessGate status={status} spaceName="Demo Space" score={demoScore} required={threshold} />}
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="card-surface p-8">
        <div className="text-center space-y-2">
          <span className="label-caps text-[hsl(var(--muted-foreground))]">{space.type === "verified" ? "Verified Space" : "Open Space"}</span>
          <h1 className="font-serif-display text-3xl font-light text-[hsl(var(--foreground))]">{space.name}</h1>
          {space.description && <p className="text-sm text-[hsl(var(--muted-foreground))]">{space.description}</p>}
          {space.type === "verified" && <p className="text-xs text-[hsl(var(--muted-foreground))]">Requires Rep Score {space.minScore}+</p>}
        </div>
        {!status && (
          <div className="mt-8 text-center">
            <button onClick={checkAccess} className="h-10 px-6 text-sm font-medium bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 transition-opacity">
              {publicKey ? "Verify & Enter" : "Connect Wallet"}
            </button>
          </div>
        )}
        {status && <AccessGate status={status} spaceName={space.name} score={demoScore} required={space.minScore} />}
      </div>
    </div>
  );
}
