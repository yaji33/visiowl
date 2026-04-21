# Visiowl — Claude Agentic Coding Guide

## Product Strategy (updated Apr 2026)

### Positioning

Visiowl is **Solana's sybil-resistant identity layer** — an API-first infrastructure
primitive that any protocol can integrate in one call to filter bots and qualify
wallets before airdrops, mints, and DAO votes.

The **Rep Card** is the consumer-facing proof and viral marketing surface.
The **API** (`GET /api/score?address=<pubkey>`) is the product.
The **RepCard PDA** is the on-chain canonical record, queryable via CPI.

### Why this positioning wins

- Solana protocols lose millions per launch to sybil wallets — clear market pain
- No shared behavioral identity primitive exists on Solana today
- API-SaaS model has a clear revenue path (per-call or protocol subscription)
- On-chain PDAs make the score composable and permanent, not just a dashboard

### Oracle Trust Model (honest, documented)

Current pipeline: `Helius API → Next.js server → score_authority keypair → RepCard PDA`

The `score_authority` keypair is centralized (hardcoded in `programs/visiowl/src/lib.rs`).
This is an acknowledged hackathon-window trade-off. The roadmap replaces it with a
Switchboard oracle or ZK-compressed Helius proof, making updates permissionless.

Anyone can independently verify any score by rerunning `fetchWalletData` + `computeRepScore`
against Helius with the same address — the computation is deterministic and open-source.

### Shipped features (as of Apr 2026)

- `GET /api/score?address=<pubkey>` — public REST API
- Rep Card with tiered scores, badges, and signal breakdown
- Wallet Lookup — paste any address on the home page
- Leaderboard — `/activity` page ranked by Rep Score descending
- Verified Spaces — score-gated community access links (Redis-backed, on-chain wire pending)
- Solana Actions / Blinks — Rep Card as a Blink
- Degen Badge — pump.fun detection
- On-chain RepCard PDA with `initialize_rep_card`, `update_score`, `award_badge`, `verify_access`
- Next Steps panel — personalised score-growth action guide

### Planned (priority order)

1. Wire `create_space` Anchor instruction from the frontend (replace Redis TODO)
2. Trustless oracle via Switchboard or ZK compression
3. Protocol demo: devnet NFT mint gated by RepScore ≥ 200 (CPI path)
4. Dialect notifications for tier-crossing events

---

## Project Overview

Visiowl is the sybil-resistant identity layer for Solana. Every wallet gets a
real-time Rep Score from six behavioral on-chain signals. Protocols query it via
a single REST API call. The score lives permanently in a Solana RepCard PDA.

**Stack:** Next.js 16 App Router · React 19.2 · TypeScript (strict) · Tailwind v4
Motion (motion/react) · Solana Wallet Adapter · Anchor · TanStack Query · Zustand · Zod

**Network:** Solana devnet (hackathon) → mainnet post-launch
**Package manager:** pnpm (never npm or yarn)

---

## Directory Structure

```
src/
├── app/                  # Next.js App Router pages + API routes
│   ├── layout.tsx        # Root layout — providers, fonts, nav
│   ├── page.tsx          # Landing / wallet connect hero
│   ├── wallet/[address]/ # Public profile page
│   ├── space/[id]/       # Verified Space access flow
│   ├── activity/         # Public activity feed
│   └── api/              # Route handlers (score, space)
├── components/
│   ├── rep-card/         # RepCard, RepScore, SignalBar, WalletStamp, …
│   ├── spaces/           # AccessGate, ThresholdPicker, SpaceCard
│   ├── feed/             # FeedRow, ActivityFeed
│   └── layout/           # Nav, Footer, Providers
├── lib/
│   ├── scoring/          # compute.ts — weighted signal engine
│   ├── solana/           # RPC client, wallet provider
│   ├── hooks/            # useRepScore, useSpace, useFeed
│   ├── utils/            # cn, address, tier helpers
│   └── validators/       # Zod schemas
├── stores/               # Zustand — score store, UI store
└── types/                # Shared TypeScript types
```

---

## Coding Standards

### Always

- Use `pnpm` — never npm or yarn
- Prefer named exports over default exports for components
- All components accept a `className` prop for composability
- Use `cn()` from `@/lib/utils` for conditional class merging
- Validate all external data with Zod at API boundaries
- Use `@/` path alias — never relative `../../` imports

### Never

- `console.log` in production code (use `console.warn`/`console.error`)
- Direct `fetch` in components — always go through TanStack Query hooks
- Store sensitive data in localStorage — wallet state lives in Zustand
- Use `any` type — use `unknown` + type narrowing instead

### Component patterns

```tsx
// ✅ Correct — named export, typed props, className forwarded
interface RepCardProps {
  wallet: WalletProfile;
  className?: string;
}
export function RepCard({ wallet, className }: RepCardProps) {
  return <div className={cn("card-surface", className)}>…</div>;
}

// ❌ Avoid — default export, no className prop
export default function RepCard({ wallet }) { … }
```

---

## Design System

### Fonts (loaded via Google Fonts in globals.css)

- `font-serif-display` → Fraunces (headings, score display)
- `font-sans` → DM Sans (body, UI text)
- `font-mono-address` → IBM Plex Mono (wallet addresses)

### CSS Variables (defined in globals.css)

- `hsl(var(--background))` · `hsl(var(--foreground))`
- `hsl(var(--card))` · `hsl(var(--border))`
- `hsl(var(--accent))` — teal, used for links + highlights
- `hsl(var(--muted-foreground))` — secondary text

### Key utility classes

- `.card-surface` — card bg + border + shadow
- `.card-divider` — horizontal rule within cards
- `.label-caps` — ALL-CAPS tracking label
- `.address-mono` — IBM Plex Mono wallet address display

---

## Scoring Architecture

Six signals, weights summing to 100%:
| Signal | Weight | Max pts |
|--------------------|--------|---------|
| Staking History | 20% | 200 |
| Governance Votes | 20% | 200 |
| DeFi Activity | 20% | 200 |
| NFT Holding | 15% | 150 |
| Transaction Volume | 15% | 150 |
| Wallet Age | 10% | 100 |

Anti-gaming: diversity and tenure weighted over raw volume.
See `src/lib/scoring/compute.ts` for full logic.

---

## Common Tasks

### Add a new page

```
src/app/new-page/page.tsx      # Server component by default
src/app/new-page/loading.tsx   # Suspense fallback
src/app/new-page/error.tsx     # Error boundary
```

### Add a new API route

```
src/app/api/new-endpoint/route.ts
```

Always validate input with Zod. Return `NextResponse.json()` with proper status codes.

### Add a new hook

```
src/lib/hooks/useNewThing.ts
```

Use TanStack Query for server data, Zustand for global client state.

---

## Environment Variables

See `.env.example`. Never commit `.env.local`.

## Testing

`pnpm test` — run all tests once
`pnpm test:watch` — watch mode
`pnpm test:coverage` — coverage report in coverage/

## Key URLs (devnet)

- App: http://localhost:3000
- Feed: http://localhost:3000/activity
- Profile: http://localhost:3000/wallet/[address]
- Space: http://localhost:3000/space/[id]

---

## On-Chain Program (Anchor / Rust)

Location: `programs/visiowl/programs/visiowl/src/lib.rs`

### Program ID (devnet)

Set in `NEXT_PUBLIC_PROGRAM_ID` env var and `declare_id!` macro.
After any redeployment, update both.

### Instructions

| Instruction         | Caller          | Description                                |
| ------------------- | --------------- | ------------------------------------------ |
| initialize_rep_card | wallet owner    | Creates RepCard PDA for a wallet           |
| update_score        | score_authority | Updates score + tier (backend keypair)     |
| award_badge         | score_authority | Awards a named badge to a wallet           |
| set_visibility      | wallet owner    | Toggles public visibility in activity feed |
| create_space        | anyone          | Creates a gated Verified Space             |
| verify_access       | wallet owner    | Proves score meets Space threshold         |

### Build & Deploy

```bash
cd programs/visiowl
anchor build      # compile + generate IDL + TypeScript types
anchor test       # run against localnet
anchor deploy --provider.cluster devnet
```

### Frontend Integration

The typed program client is at `src/lib/solana/program.ts`.
Import `getProgram()` inside hooks that need to call instructions.
The IDL lives at `programs/visiowl/target/idl/visiowl.json` —
regenerated automatically on every `anchor build`.

Root `pnpm type-check` excludes `programs/visiowl/tests` so the Next.js app is not blocked by Anchor’s integration tests (they type-check against the generated IDL when you run `anchor test`).

---

## Tech Debt

- [ ] Migrate @solana/web3.js → @solana/kit when wallet-adapter v1 support lands
- [ ] Replace @solana/wallet-adapter-react-ui modal with custom WalletModal component
      that matches Visiowl design system (Fraunces, warm palette, WalletStamp avatar)
