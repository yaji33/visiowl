"use client";
import { useState, use } from "react";
import Link from "next/link";
import { useWallet, useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { PublicKey } from "@solana/web3.js";
import { AnchorError } from "@coral-xyz/anchor";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AccessGate } from "@/components/spaces/AccessGate";
import { WalletStamp } from "@/components/rep-card/WalletStamp";
import { TierBadge } from "@/components/rep-card/TierBadge";
import { useSpace } from "@/lib/hooks/useSpace";
import { useRepScore } from "@/lib/hooks/useRepScore";
import { useSpaceMembers } from "@/lib/hooks/useSpaceMembers";
import { useSpaceEvents, useCreateSpaceEvent } from "@/lib/hooks/useSpaceEvents";
import { SpaceEventCard } from "@/components/spaces/SpaceEventCard";
import { getProgram } from "@/lib/solana/program";
import type { AccessStatus } from "@/types";

interface Props {
  params: Promise<{ id: string }>;
}

export default function SpacePage({ params }: Props) {
  const { id } = use(params);
  const { data: space, isPending, isError } = useSpace(id);
  const { publicKey } = useWallet();
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();
  const { setVisible } = useWalletModal();
  const queryClient = useQueryClient();
  const SESSION_KEY = publicKey ? `space-access-${id}-${publicKey.toBase58()}` : null;
  const [prevKey, setPrevKey] = useState<string | null>(null);
  const [status, setStatus] = useState<AccessStatus | null>(null);

  if (SESSION_KEY !== prevKey) {
    setPrevKey(SESSION_KEY);
    setStatus(SESSION_KEY ? ((sessionStorage.getItem(SESSION_KEY) as AccessStatus) ?? null) : null);
  }

  const { data: scoreData } = useRepScore(publicKey?.toBase58() ?? null);
  const walletScore = scoreData?.score ?? 0;
  const walletTier = scoreData?.tier;
  const { data: members, refetch: refetchMembers } = useSpaceMembers(id);
  const { data: events } = useSpaceEvents(id);
  const { mutate: createEvent, isPending: creatingEvent } = useCreateSpaceEvent(id);

  const [showEventForm, setShowEventForm] = useState(false);
  const [evtTitle, setEvtTitle] = useState("");
  const [evtType, setEvtType] = useState<"ama" | "mint" | "vote" | "airdrop" | "other">("other");
  const [evtDate, setEvtDate] = useState("");
  const [evtLink, setEvtLink] = useState("");
  const [evtDesc, setEvtDesc] = useState("");

  const isOperator = !!publicKey && space?.operatorAddress === publicKey.toBase58();

  const persist = (s: AccessStatus) => {
    setStatus(s);
    if (s === "granted" && SESSION_KEY) sessionStorage.setItem(SESSION_KEY, s);
  };

  const copyInviteLink = () => {
    const url = `${window.location.origin}/space/${id}`;
    void navigator.clipboard
      .writeText(url)
      .then(() => toast.success("Invite link copied!", { description: url }));
  };

  const incrementMemberCount = async () => {
    const body =
      publicKey && walletTier
        ? JSON.stringify({
            address: publicKey.toBase58(),
            shortAddress: publicKey.toBase58().slice(0, 4) + "…" + publicKey.toBase58().slice(-4),
            score: walletScore,
            tier: walletTier,
          })
        : undefined;

    await fetch(`/api/space/${id}`, {
      method: "PATCH",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body,
    });
    await queryClient.invalidateQueries({ queryKey: ["space", id] });
    await queryClient.invalidateQueries({ queryKey: ["spaces"] });
    await refetchMembers();
  };

  const checkAccess = async () => {
    if (!publicKey) {
      setVisible(true);
      return;
    }
    if (!space) return;
    persist("checking");

    if (space.spacePda && anchorWallet) {
      try {
        const prog = getProgram(anchorWallet, connection);
        await prog.methods
          .verifyAccess()
          .accounts({ space: new PublicKey(space.spacePda) })
          .rpc();
        await incrementMemberCount();
        persist("granted");
      } catch (err) {
        const code = (err as AnchorError)?.error?.errorCode?.code;
        if (code === "AlreadyMember") {
          persist("granted");
        } else if (code === "InsufficientScore" || code === "SpaceFull") {
          persist("denied");
        } else {
          persist(walletScore >= space.minScore ? "granted" : "denied");
        }
      }
    } else {
      await new Promise((r) => setTimeout(r, 1500));
      const result = walletScore >= space.minScore ? "granted" : "denied";
      if (result === "granted") await incrementMemberCount();
      persist(result);
    }
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
    <div className="mx-auto max-w-2xl space-y-8 px-6 py-16">
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
            {space.gatedUrl && (
              <div className="rounded-sm border border-[hsl(var(--border))] px-4 py-3 text-center">
                <p className="label-caps mb-1 text-[10px] text-[hsl(var(--muted-foreground))]">
                  Gated Link
                </p>
                <a
                  href={space.gatedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs break-all text-[hsl(var(--accent))] underline underline-offset-2 transition-opacity hover:opacity-80"
                >
                  {space.gatedUrl}
                </a>
                <p className="mt-1 text-[10px] text-[hsl(var(--muted-foreground))]">
                  Only shown to verified members.
                </p>
              </div>
            )}
            <p className="text-center text-[10px] text-[hsl(var(--muted-foreground))]">
              {space.spacePda
                ? `On-chain · ${space.memberCount} verified ${space.memberCount === 1 ? "member" : "members"}`
                : "Off-chain access check · deploy program to enable on-chain verification"}
            </p>
          </div>
        ) : (
          <>
            {!status && (
              <div className="mt-8 text-center">
                <button
                  onClick={() => void checkAccess()}
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
                gatedUrl={space.gatedUrl}
              />
            )}
          </>
        )}
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <p className="label-caps text-[hsl(var(--muted-foreground))]">Events</p>
          {isOperator && (
            <button
              onClick={() => setShowEventForm((v) => !v)}
              className="text-xs text-[hsl(var(--muted-foreground))] underline underline-offset-2 transition-colors hover:text-[hsl(var(--foreground))]"
            >
              {showEventForm ? "Cancel" : "+ Add event"}
            </button>
          )}
        </div>

        {isOperator && showEventForm && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!evtTitle.trim() || !evtDate) return;
              createEvent(
                {
                  title: evtTitle.trim(),
                  description: evtDesc.trim() || undefined,
                  type: evtType,
                  link: evtLink.trim() || undefined,
                  scheduledAt: new Date(evtDate).toISOString(),
                },
                {
                  onSuccess: () => {
                    setEvtTitle("");
                    setEvtType("other");
                    setEvtDate("");
                    setEvtLink("");
                    setEvtDesc("");
                    setShowEventForm(false);
                    toast.success("Event created!");
                  },
                  onError: (err) => toast.error(err.message),
                },
              );
            }}
            className="card-surface mb-4 space-y-3 p-4"
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1">
                <label className="label-caps text-[10px] text-[hsl(var(--muted-foreground))]">
                  Title
                </label>
                <input
                  type="text"
                  required
                  minLength={3}
                  maxLength={120}
                  value={evtTitle}
                  onChange={(e) => setEvtTitle(e.target.value)}
                  placeholder="e.g. Community AMA with the core team"
                  className="w-full rounded-sm border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:border-[hsl(var(--accent))] focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="label-caps text-[10px] text-[hsl(var(--muted-foreground))]">
                  Type
                </label>
                <select
                  value={evtType}
                  onChange={(e) => setEvtType(e.target.value as typeof evtType)}
                  className="w-full rounded-sm border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-sm text-[hsl(var(--foreground))] focus:border-[hsl(var(--accent))] focus:outline-none"
                >
                  {(["ama", "mint", "vote", "airdrop", "other"] as const).map((t) => (
                    <option key={t} value={t}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="label-caps text-[10px] text-[hsl(var(--muted-foreground))]">
                  Date &amp; time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={evtDate}
                  onChange={(e) => setEvtDate(e.target.value)}
                  className="w-full rounded-sm border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm text-[hsl(var(--foreground))] focus:border-[hsl(var(--accent))] focus:outline-none"
                />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="label-caps text-[10px] text-[hsl(var(--muted-foreground))]">
                  Link <span className="normal-case opacity-60">(optional)</span>
                </label>
                <input
                  type="url"
                  value={evtLink}
                  onChange={(e) => setEvtLink(e.target.value)}
                  placeholder="https://"
                  className="w-full rounded-sm border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:border-[hsl(var(--accent))] focus:outline-none"
                />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="label-caps text-[10px] text-[hsl(var(--muted-foreground))]">
                  Description <span className="normal-case opacity-60">(optional)</span>
                </label>
                <textarea
                  rows={2}
                  maxLength={400}
                  value={evtDesc}
                  onChange={(e) => setEvtDesc(e.target.value)}
                  placeholder="What should members know?"
                  className="w-full resize-none rounded-sm border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:border-[hsl(var(--accent))] focus:outline-none"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={creatingEvent || !evtTitle.trim() || !evtDate}
              className="w-full rounded-sm bg-[hsl(var(--primary))] py-2 text-sm font-medium text-[hsl(var(--primary-foreground))] transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {creatingEvent ? "Creating…" : "Create Event"}
            </button>
          </form>
        )}

        {events && events.length > 0 ? (
          <div className="space-y-3">
            {events.map((ev) => (
              <SpaceEventCard key={ev.id} event={ev} />
            ))}
          </div>
        ) : (
          !isOperator && (
            <p className="text-sm text-[hsl(var(--muted-foreground))]">No events scheduled yet.</p>
          )
        )}
      </div>

      {members && members.length > 0 && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="label-caps text-[hsl(var(--muted-foreground))]">
              Members · {members.length}
            </p>
            {isOperator && (
              <button
                onClick={() => {
                  const url = `${window.location.origin}/api/space/${id}/members`;
                  void navigator.clipboard
                    .writeText(url)
                    .then(() => toast.success("Allowlist API URL copied!", { description: url }));
                }}
                className="text-xs text-[hsl(var(--muted-foreground))] underline underline-offset-2 transition-colors hover:text-[hsl(var(--foreground))]"
              >
                Copy allowlist API →
              </button>
            )}
          </div>

          <div>
            {members.map((member, i) => {
              const isSelf = publicKey?.toBase58() === member.address;
              return (
                <Link
                  key={member.address}
                  href={`/wallet/${member.address}`}
                  className={`-mx-2 flex items-center gap-3 rounded-sm border-b border-[hsl(var(--border-light))] px-2 py-3.5 transition-colors last:border-0 hover:bg-[hsl(var(--secondary))] ${isSelf ? "bg-[hsl(var(--accent)/0.05)]" : ""}`}
                >
                  <span className="address-mono w-7 shrink-0 text-right text-xs text-[hsl(var(--muted-foreground))]">
                    #{i + 1}
                  </span>
                  <WalletStamp address={member.address} size={32} />
                  <span className="address-mono min-w-0 flex-1 truncate text-sm text-[hsl(var(--foreground))]">
                    {member.shortAddress}
                    {isSelf && <span className="ml-2 text-xs text-[hsl(var(--accent))]">you</span>}
                  </span>
                  <span className="font-serif-display text-xl font-light text-[hsl(var(--foreground))]">
                    {member.score}
                  </span>
                  <TierBadge tier={member.tier} size="sm" />
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {members && members.length === 0 && (
        <p className="text-center text-sm text-[hsl(var(--muted-foreground))]">
          No verified members yet — be the first to enter.
        </p>
      )}
    </div>
  );
}
