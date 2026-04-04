# Visiowl 🦉

> Visible Reputation for Solana — every wallet has a story. We make it visible to everyone.

Built for the **Solana Frontier Hackathon** (April 6 – May 11, 2026).

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 App Router |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Animation | Motion 12 (motion/react) |
| Wallet | Solana Wallet Adapter (Phantom, Solflare, Backpack) |
| On-chain program | **Anchor 0.32** (Rust) · `programs/visiowl` |
| Client ↔ chain | `@coral-xyz/anchor` · IDL in `programs/visiowl/target/` |
| Data fetching | TanStack Query v5 |
| State | Zustand v5 |
| Validation | Zod |
| Testing | Vitest + Testing Library (app) · Mocha + ts-mocha (on-chain integration tests) |
| Package mgr | pnpm (workspace) |

## Repository layout

This repo is a **pnpm monorepo**: the Next.js app at the root and an **Anchor workspace** under `programs/visiowl`.

```
.
├── src/                          # Next.js frontend
│   └── lib/solana/
│       └── program.ts          # Typed Anchor client (IDL + getProgram, PDAs)
├── programs/visiowl/            # Anchor — Solana program (Rust)
│   ├── programs/visiowl/src/
│   │   └── lib.rs              # Program entry (RepCard, Spaces, instructions)
│   ├── tests/
│   │   └── visiowl.ts          # Integration tests (local validator)
│   ├── Anchor.toml             # Cluster, program id, test script
│   ├── Cargo.toml              # Rust workspace
│   └── target/                 # Build output (IDL, types, .so) — see .gitignore
│       ├── idl/visiowl.json    # Generated; imported by the frontend
│       └── types/visiowl.ts
├── pnpm-workspace.yaml         # "." + "programs/visiowl"
└── .env.example                # Includes NEXT_PUBLIC_PROGRAM_ID
```

### On-chain program (`programs/visiowl`)

The **Visiowl** program implements reputation state on Solana: **RepCard** PDAs (score, tier, badges, visibility), **Verified Spaces** (min score gates), and instructions for initializing cards, updating scores (authority key), awarding badges, and verifying access.

- **Develop:** install [Rust](https://rustup.rs/), [Solana CLI](https://docs.anza.xyz/cli/install), and [Anchor](https://www.anchor-lang.com/docs/installation) (`avm` recommended).
- **Build & generate IDL/types:** from `programs/visiowl`, run `anchor build` (updates `target/idl/` and `target/types/` used by `src/lib/solana/program.ts`).
- **Test:** `anchor test` (local validator + TypeScript tests).
- **Deploy:** e.g. `anchor deploy --provider.cluster devnet` — then update the program id in `declare_id!`, `Anchor.toml`, and `NEXT_PUBLIC_PROGRAM_ID` to match the deployed address.

Placeholder program id in repo: `Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS` (replace after your own deploy).

## Quick Start

```bash
# Install dependencies (root + workspace packages)
pnpm install

# Copy env
cp .env.example .env.local

# Start dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server with Turbopack |
| `pnpm build` | Production build |
| `pnpm lint` | ESLint check |
| `pnpm type-check` | TypeScript check (Next app; Anchor tests are excluded — use `anchor test` in `programs/visiowl`) |
| `pnpm test` | Run Vitest tests |
| `pnpm format` | Prettier format |

**Anchor** (run inside `programs/visiowl`):

| Command | Description |
|---------|-------------|
| `anchor build` | Compile program + refresh IDL and TypeScript types |
| `anchor test` | Local validator + integration tests |
| `anchor deploy --provider.cluster devnet` | Deploy to devnet |

## Project Structure (`src/`)

```
src/
├── app/                  # Pages + API routes (App Router)
│   ├── page.tsx          # Landing — wallet connect + hero card
│   ├── wallet/[address]/ # Public profile page
│   ├── space/[id]/       # Verified Space access flow
│   ├── activity/         # Public activity feed
│   └── api/score|space   # Route handlers
├── components/
│   ├── rep-card/         # RepCard, RepScore, SignalBar, WalletStamp…
│   ├── spaces/           # AccessGate, ThresholdPicker
│   ├── feed/             # FeedRow
│   └── layout/           # Nav, Providers
├── lib/
│   ├── scoring/          # Weighted signal computation engine
│   ├── solana/           # Wallet provider, Anchor program client (`program.ts`)
│   ├── hooks/            # useRepScore
│   ├── utils/            # cn, address, tier, seededRandom
│   └── validators/       # Zod schemas
├── stores/               # Zustand (ScoreStore, UIStore)
└── types/                # Shared TypeScript types
```

## Score Architecture

Six on-chain signals, weights summing to 100%:

| Signal | Weight | Max |
|--------|--------|-----|
| Staking History | 20% | 200 pts |
| Governance Votes | 20% | 200 pts |
| DeFi Activity | 20% | 200 pts |
| NFT Holding | 15% | 150 pts |
| Transaction Volume | 15% | 150 pts |
| Wallet Age | 10% | 100 pts |

Anti-gaming: diversity and tenure weighted over raw volume.
Data source: Helius RPC → `src/lib/scoring/compute.ts`.

## Agentic Coding

See `.claude/CLAUDE.md` for full coding conventions, architecture notes,
on-chain program overview, and task patterns used with Claude Code.

---

*Proof of Rep · Visiowl · Solana Frontier Hackathon 2026*
