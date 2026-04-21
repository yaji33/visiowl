import Link from "next/link";
import { Users } from "lucide-react";
import { useSpaces } from "@/lib/hooks/useSpaces";
import { cn } from "@/lib/utils";

const LIMIT = 3;

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

export function FeaturedSpaces() {
  const { data: spaces, isPending } = useSpaces();

  const top = spaces
    ? [...spaces].sort((a, b) => b.memberCount - a.memberCount).slice(0, LIMIT)
    : [];

  if (!isPending && top.length === 0) return null;

  return (
    <section className="w-full max-w-2xl">
      <div className="mb-4 flex items-center justify-between">
        <p className="label-caps text-[hsl(var(--muted-foreground))]">Verified Spaces</p>
        <Link
          href="/spaces"
          className="text-xs text-[hsl(var(--muted-foreground))] underline underline-offset-2 transition-colors hover:text-[hsl(var(--foreground))]"
        >
          Browse all →
        </Link>
      </div>

      {isPending && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {Array.from({ length: LIMIT }).map((_, i) => (
            <div key={i} className="card-surface animate-pulse space-y-3 p-4">
              <div className="h-3 w-16 rounded bg-[hsl(var(--secondary))]" />
              <div className="h-4 w-32 rounded bg-[hsl(var(--secondary))]" />
              <div className="h-3 w-20 rounded bg-[hsl(var(--secondary))]" />
            </div>
          ))}
        </div>
      )}

      {!isPending && top.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {top.map((space) => (
            <Link
              key={space.id}
              href={`/space/${space.id}`}
              className="card-surface flex flex-col gap-2 rounded-sm p-4 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-2">
                <SpaceTypePip type={space.type} />
                {space.type === "verified" && (
                  <span className="label-caps text-[hsl(var(--muted-foreground))]">
                    {space.minScore}+ rep
                  </span>
                )}
              </div>

              <p className="truncate text-sm font-medium text-[hsl(var(--foreground))]">
                {space.name}
              </p>

              {space.description && (
                <p className="line-clamp-2 text-xs leading-relaxed text-[hsl(var(--muted-foreground))]">
                  {space.description}
                </p>
              )}

              <div className="mt-auto flex items-center gap-1 pt-1 text-xs text-[hsl(var(--muted-foreground))]">
                <Users className="h-3 w-3" strokeWidth={1.5} />
                <span>{space.memberCount} {space.memberCount === 1 ? "member" : "members"}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
