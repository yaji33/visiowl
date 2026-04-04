"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Nav() {
  const path = usePathname();
  const link = (href: string, label: string) => (
    <Link href={href} className={cn("text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors", path === href && "text-[hsl(var(--foreground))]")}>
      {label}
    </Link>
  );
  return (
    <header className="sticky top-0 z-50 border-b border-[hsl(var(--border-light))] bg-[hsl(var(--background)/0.95)] px-6 py-4 backdrop-blur-sm">
      <div className="mx-auto flex max-w-4xl items-center justify-between">
        <Link href="/" className="font-serif-display text-lg font-light text-[hsl(var(--foreground))]">Visiowl</Link>
        <nav className="flex items-center gap-6">
          {link("/activity", "Activity")}
          {link("/space/superteam-core", "Create Space")}
        </nav>
      </div>
    </header>
  );
}
