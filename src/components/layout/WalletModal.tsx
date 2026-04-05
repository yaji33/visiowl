"use client";
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletReadyState } from "@solana/wallet-adapter-base";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import type { WalletName } from "@solana/wallet-adapter-base";

export function WalletModal() {
  const { visible, setVisible } = useWalletModal();
  const { wallets, select } = useWallet();
  const [expanded, setExpanded] = useState(false);

  if (!visible) return null;

  const detected = wallets.filter((w) => w.readyState === WalletReadyState.Installed);
  const others = wallets.filter(
    (w) =>
      w.readyState === WalletReadyState.NotDetected ||
      w.readyState === WalletReadyState.Loadable,
  );

  function handleSelect(name: WalletName) {
    select(name);
    setVisible(false);
    setExpanded(false);
  }

  const shown = expanded ? [...detected, ...others] : detected;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={() => setVisible(false)}
    >
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" aria-hidden="true" />
      <div
        className="relative w-full max-w-sm border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-md"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Connect a wallet"
      >
        <div className="flex items-center justify-between border-b border-[hsl(var(--border-light))] px-6 py-4">
          <span className="font-serif-display text-base font-light text-[hsl(var(--foreground))]">
            Connect a wallet
          </span>
          <button
            onClick={() => setVisible(false)}
            aria-label="Close"
            className="flex h-7 w-7 items-center justify-center text-lg leading-none text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]"
          >
            ×
          </button>
        </div>

        <ul>
          {shown.map((wallet) => (
            <li key={wallet.adapter.name}>
              <button
                className="flex w-full items-center gap-3 px-6 py-3 transition-colors hover:bg-[hsl(var(--muted))]"
                onClick={() => handleSelect(wallet.adapter.name as WalletName)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={wallet.adapter.icon}
                  alt=""
                  aria-hidden="true"
                  className="h-6 w-6 rounded-sm object-contain"
                />
                <span className="flex-1 text-left text-sm text-[hsl(var(--foreground))]">
                  {wallet.adapter.name}
                </span>
                {wallet.readyState === WalletReadyState.Installed && (
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">Detected</span>
                )}
              </button>
            </li>
          ))}
        </ul>

        {others.length > 0 && (
          <div className="border-t border-[hsl(var(--border-light))] px-6 py-3">
            <button
              onClick={() => setExpanded((p) => !p)}
              className="text-xs text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]"
            >
              {expanded
                ? "Show fewer wallets"
                : `${others.length} more wallet${others.length !== 1 ? "s" : ""}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
