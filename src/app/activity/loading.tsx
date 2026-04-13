export default function ActivityLoading() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="mb-8 space-y-2">
        <div className="h-8 w-48 animate-pulse rounded bg-[hsl(var(--secondary))]" />
        <div className="h-4 w-72 animate-pulse rounded bg-[hsl(var(--secondary))]" />
      </div>
      <div className="space-y-0">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex animate-pulse items-center gap-4 border-b border-[hsl(var(--border-light))] py-4 last:border-0"
          >
            <div className="h-9 w-9 rounded-sm bg-[hsl(var(--secondary))]" />
            <div className="h-3 flex-1 rounded bg-[hsl(var(--secondary))]" />
            <div className="h-6 w-10 rounded bg-[hsl(var(--secondary))]" />
            <div className="h-5 w-20 rounded bg-[hsl(var(--secondary))]" />
            <div className="h-3 w-14 rounded bg-[hsl(var(--secondary))]" />
          </div>
        ))}
      </div>
    </div>
  );
}
