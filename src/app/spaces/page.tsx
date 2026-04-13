"use client";
import Link from "next/link";
import { useSpaces } from "@/lib/hooks/useSpaces";
import { cn } from "@/lib/utils";

function SpaceTypePip({ type }: { type: "open" | "verified" }) {
  return (
    <span
      className={cn(
        "label-caps rounded-sm px-1.5 py-0.5 text-[9px]",
        type === "verified"
          ? "bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))]"
          : "bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))]",
      )}
    >
      {type === "verified" ? "Verified" : "Open"}
    </span>
  );
}

export default function SpacesPage() {
  const { data: spaces, isPending, isError } = useSpaces();

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-serif-display text-3xl font-light text-[hsl(var(--foreground))]">
            Verified Spaces
          </h1>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            Score-gated communities on Solana.
          </p>
        </div>
        <Link
          href="/space/new"
          className="rounded-sm bg-[hsl(var(--primary))] px-4 py-2 text-xs font-medium text-[hsl(var(--primary-foreground))] transition-opacity hover:opacity-90"
        >
          Create Space
        </Link>
      </div>

      {isPending && (
        <div className="space-y-0">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex animate-pulse items-center gap-4 border-b border-[hsl(var(--border-light))] py-5 last:border-0"
            >
              <div className="flex-1 space-y-2">
                <div className="h-4 w-40 rounded bg-[hsl(var(--secondary))]" />
                <div className="h-3 w-64 rounded bg-[hsl(var(--secondary))]" />
              </div>
              <div className="h-5 w-16 rounded bg-[hsl(var(--secondary))]" />
            </div>
          ))}
        </div>
      )}

      {isError && (
        <p className="py-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
          Failed to load spaces. Please try again.
        </p>
      )}

      {!isPending && !isError && spaces?.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            No spaces yet.{" "}
            <Link
              href="/space/new"
              className="underline underline-offset-2 hover:text-[hsl(var(--foreground))] transition-colors"
            >
              Create the first one.
            </Link>
          </p>
        </div>
      )}

      {spaces && spaces.length > 0 && (
        <div>
          {spaces.map((space) => (
            <Link
              key={space.id}
              href={`/space/${space.id}`}
              className="flex items-center gap-4 border-b border-[hsl(var(--border-light))] py-5 last:border-0 hover:bg-[hsl(var(--secondary))] transition-colors px-2 -mx-2 rounded-sm"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-[hsl(var(--foreground))] truncate">
                    {space.name}
                  </p>
                  <SpaceTypePip type={space.type} />
                </div>
                {space.description && (
                  <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))] truncate">
                    {space.description}
                  </p>
                )}
              </div>
              <div className="shrink-0 text-right">
                {space.type === "verified" && (
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    {space.minScore}+ rep
                  </p>
                )}
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  {space.memberCount} {space.memberCount === 1 ? "member" : "members"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
