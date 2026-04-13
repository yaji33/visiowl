"use client";
import { useState, use } from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { toast } from "sonner";
import { AccessGate } from "@/components/spaces/AccessGate";
import { useSpace } from "@/lib/hooks/useSpace";
import { useRepScore } from "@/lib/hooks/useRepScore";
import type { AccessStatus } from "@/types";

interface Props {
  params: Promise<{ id: string }>;
}

export default function SpacePage({ params }: Props) {
  const { id } = use(params);
  const { data: space, isPending, isError } = useSpace(id);
  const { publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  const SESSION_KEY = `space-access-${id}`;
  const [status, setStatus] = useState<AccessStatus | null>(() => {
    if (typeof window === "undefined") return null;
    return (sessionStorage.getItem(SESSION_KEY) as AccessStatus) ?? null;
  });

  const { data: scoreData } = useRepScore(publicKey?.toBase58() ?? null);
  const walletScore = scoreData?.score ?? 0;

  const isOperator = !!publicKey && space?.operatorAddress === publicKey.toBase58();

  const persist = (s: AccessStatus) => {
    setStatus(s);
    if (s === "granted") sessionStorage.setItem(SESSION_KEY, s);
  };

  const copyInviteLink = () => {
    const url = `${window.location.origin}/space/${id}`;
    void navigator.clipboard
      .writeText(url)
      .then(() => toast.success("Invite link copied!", { description: url }));
  };

  const checkAccess = () => {
    if (!publicKey) {
      setVisible(true);
      return;
    }
    if (!space) return;
    persist("checking");
    setTimeout(() => persist(walletScore >= space.minScore ? "granted" : "denied"), 2000);
  };

  const handleEnter = () => {
    toast.success(`Welcome to ${space?.name ?? "the space"}!`, {
      description: "Your access is verified.",
    });
  };

  if (isPending) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <div className="card-surface animate-pulse p-8">
          <div className="mx-auto h-4 w-24 rounded bg-[hsl(var(--secondary))]" />
          <div className="mx-auto mt-4 h-8 w-48 rounded bg-[hsl(var(--secondary))]" />
        </div>
      </div>
    );
  }

  if (isError || !space) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Space not found.</p>
        <Link
          href="/spaces"
          className="mt-4 inline-block text-xs underline underline-offset-2 transition-colors hover:text-[hsl(var(--foreground))]"
        >
          Browse Spaces
        </Link>
      </div>
    );
  }

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
        {isOperator ? (
          <div className="mt-8 space-y-3 border-t border-[hsl(var(--border-light))] pt-6">
            <p className="text-center text-xs text-[hsl(var(--muted-foreground))]">
              You created this space.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={copyInviteLink}
                className="h-9 rounded-sm border border-[hsl(var(--border))] px-4 text-xs text-[hsl(var(--foreground))] transition-colors hover:border-[hsl(var(--accent))]"
              >
                Copy Invite Link
              </button>
              <Link
                href="/spaces"
                className="flex h-9 items-center rounded-sm px-4 text-xs text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]"
              >
                Browse Spaces
              </Link>
            </div>
            <p className="text-center text-[10px] text-[hsl(var(--muted-foreground))]">
              On-chain member verification enforced once the Solana program is deployed.
            </p>
          </div>
        ) : (
          <>
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
                onEnter={handleEnter}
                walletAddress={publicKey?.toBase58()}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
