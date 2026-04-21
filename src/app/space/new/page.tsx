"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useWallet, useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Keypair } from "@solana/web3.js";
import { cn } from "@/lib/utils";
import { useCreateSpace } from "@/lib/hooks/useCreateSpace";
import { ThresholdPicker } from "@/components/spaces/ThresholdPicker";
import { getProgram, getSpacePda } from "@/lib/solana/program";

export default function CreateSpacePage() {
  const router = useRouter();
  const { publicKey } = useWallet();
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();
  const { setVisible } = useWalletModal();
  const { mutate: createSpace, isPending, error } = useCreateSpace();

  const [name, setName] = useState("");
  const [description, setDesc] = useState("");
  const [type, setType] = useState<"open" | "verified">("verified");
  const [minScore, setMinScore] = useState(300);
  const [gatedUrl, setGatedUrl] = useState("");

  const canSubmit = name.trim().length >= 3 && !!publicKey && !isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey) {
      setVisible(true);
      return;
    }

    let spacePda: string | undefined;
    if (anchorWallet) {
      try {
        const nameSeed = Keypair.generate();
        const prog = getProgram(anchorWallet, connection);
        await prog.methods
          .createSpace(name.trim(), description.trim(), type === "open" ? 0 : minScore)
          .accounts({ nameSeed: nameSeed.publicKey, operator: publicKey })
          .signers([nameSeed])
          .rpc();
        const [pdaKey] = getSpacePda(publicKey, nameSeed.publicKey);
        spacePda = pdaKey.toBase58();
      } catch (err) {
        console.warn("[create_space] on-chain TX failed — falling back to Redis-only space:", err);
      }
    }

    createSpace(
      {
        name: name.trim(),
        description: description.trim() || undefined,
        type,
        minScore: type === "open" ? 0 : minScore,
        operatorAddress: publicKey.toBase58(),
        gatedUrl: gatedUrl.trim() || undefined,
        spacePda,
      },
      {
        onSuccess: (space) => {
          toast.success(`"${space.name}" created!`, {
            description: space.spacePda
              ? "Space anchored on-chain. Share the link to invite members."
              : "Your space is live. Share the link to invite members.",
          });
          router.push(`/space/${space.id}`);
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <div className="mb-8">
        <h1 className="font-serif-display text-3xl font-light text-[hsl(var(--foreground))]">
          Create a Verified Space
        </h1>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          Gate your community by Rep Score. Only wallets that meet the threshold can enter.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card-surface space-y-6 p-8">
        <div className="space-y-1.5">
          <label className="label-caps text-[10px] text-[hsl(var(--muted-foreground))]">
            Space Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Superteam Core"
            minLength={3}
            maxLength={60}
            required
            className={cn(
              "w-full rounded-sm border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm text-[hsl(var(--foreground))] transition-colors placeholder:text-[hsl(var(--muted-foreground))] focus:border-[hsl(var(--accent))] focus:outline-none",
            )}
          />
        </div>

        <div className="space-y-1.5">
          <label className="label-caps text-[10px] text-[hsl(var(--muted-foreground))]">
            Description <span className="normal-case opacity-60">(optional)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="What is this space for?"
            maxLength={200}
            rows={3}
            className="w-full resize-none rounded-sm border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm text-[hsl(var(--foreground))] transition-colors placeholder:text-[hsl(var(--muted-foreground))] focus:border-[hsl(var(--accent))] focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="label-caps text-[10px] text-[hsl(var(--muted-foreground))]">
            Access Type
          </label>
          <div className="flex gap-3">
            {(["verified", "open"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={cn(
                  "flex-1 rounded-sm border py-2 text-xs transition-colors",
                  type === t
                    ? "border-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.08)] text-[hsl(var(--foreground))]"
                    : "border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--border-light))]",
                )}
              >
                {t === "verified" ? "Verified (score-gated)" : "Open (anyone)"}
              </button>
            ))}
          </div>
        </div>

        {type === "verified" && (
          <div className="space-y-1.5">
            <label className="label-caps text-[10px] text-[hsl(var(--muted-foreground))]">
              Minimum Rep Score
            </label>
            <ThresholdPicker value={minScore} onChange={setMinScore} />
          </div>
        )}

        <div className="space-y-1.5">
          <label className="label-caps text-[10px] text-[hsl(var(--muted-foreground))]">
            Gated Link <span className="normal-case opacity-60">(optional)</span>
          </label>
          <input
            type="url"
            value={gatedUrl}
            onChange={(e) => setGatedUrl(e.target.value)}
            placeholder="https://discord.gg/your-private-invite"
            className={cn(
              "w-full rounded-sm border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm text-[hsl(var(--foreground))] transition-colors placeholder:text-[hsl(var(--muted-foreground))] focus:border-[hsl(var(--accent))] focus:outline-none",
            )}
          />
          <p className="text-[10px] text-[hsl(var(--muted-foreground))]">
            Only revealed to wallets that meet the Rep Score threshold.
          </p>
        </div>

        {error && <p className="text-xs text-red-500">{error.message}</p>}

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full rounded-sm bg-[hsl(var(--primary))] py-2.5 text-sm font-medium text-[hsl(var(--primary-foreground))] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {!publicKey ? "Connect Wallet to Continue" : isPending ? "Creating…" : "Create Space"}
        </button>

        {!publicKey && (
          <p className="text-center text-xs text-[hsl(var(--muted-foreground))]">
            <button
              type="button"
              onClick={() => setVisible(true)}
              className="underline underline-offset-2 transition-colors hover:text-[hsl(var(--foreground))]"
            >
              Connect your wallet
            </button>{" "}
            to create a space.
          </p>
        )}
      </form>
    </div>
  );
}
