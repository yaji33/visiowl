# Visiowl 🦉

> **The public reputation layer for Solana.** Every wallet instantly gets a shareable Rep Card — a beautiful, on-chain identity that turns transaction history into visible social capital.

Built for the **Solana Frontier Hackathon** (April 6 – May 11, 2026) · Consumer App track.

---

## What is Visiowl?

Visiowl answers one question: _"Who is this wallet, really?"_

It reads any Solana wallet's on-chain history through Helius, computes a **Rep Score** across six weighted signals, and surfaces the result as a visual **Rep Card** — tiered, badged, and shareable. Wallets with high Rep Scores can create or join **Verified Spaces**, gating communities and allowlists by proven on-chain reputation instead of bot-susceptible invite codes.

### Who it's for

| User                         | What they get                                                     |
| ---------------------------- | ----------------------------------------------------------------- |
| **Any Solana wallet holder** | Instant Rep Card — know your standing, share your story           |
| **Community operators**      | Verified Spaces — gate Discord/allowlist access by Rep Score      |
| **NFT & token projects**     | Sybil-resistant allowlists of quality holders, queryable on-chain |
| **New Solana users**         | Guided Next Steps toward real platforms to build their reputation |

### User journey

1. Connect wallet (or paste any address) → Rep Card loads in seconds
2. See your score, tier, signals breakdown, and earned badges
3. Follow personalised **Next Steps** to grow your score on real Solana platforms
4. Create a **Verified Space** to gate your community by minimum Rep Score
5. Share your Rep Card — your on-chain identity, visible to everyone

---

## Score Architecture

Six on-chain signals, weights summing to 100%:

| Signal             | Weight | Max pts | Anti-gaming                            |
| ------------------ | ------ | ------- | -------------------------------------- |
| Staking History    | 20%    | 200     | Duration × amount — not raw SOL        |
| Governance Votes   | 20%    | 200     | Vote count × distinct DAOs             |
| DeFi Activity      | 20%    | 200     | Protocol diversity × transaction depth |
| NFT Holding        | 15%    | 150     | Hold duration weighted over flip count |
| Transaction Volume | 15%    | 150     | Distinct programs × total txns         |
| Wallet Age         | 10%    | 100     | Days active since first transaction    |

Data source: Helius RPC + Enhanced Transactions API → `src/lib/scoring/compute.ts`

---

## Ecosystem Platforms (Next Steps)

Visiowl surfaces the most relevant platforms for each signal gap. These are the real sources your Rep Card points to:

### 🪙 Staking

- [Marinade Finance](https://marinade.finance) — native staking + mSOL liquid staking token
- [Jito](https://jito.network) — MEV-boosted liquid staking (jitoSOL)
- [BlazeStake](https://blaze.finance) — stake for BLZE token rewards
- [Sanctum](https://sanctum.so) — unified LST liquidity and infinite-stake pool

### 🗳️ Governance

- [Realms](https://app.realms.today) — SPL Governance: vote in Mango, Drift, Orca, and 100+ DAOs
- [Squads](https://squads.so) — multisig-based team treasury and governance

### 📊 DeFi

- [Jupiter](https://jup.ag) — best swap aggregator, DCA, JLP yield
- [Kamino Finance](https://kamino.finance) — automated liquidity management + lending
- [Drift Protocol](https://drift.trade) — perpetuals, vaults, and insurance fund staking
- [Meteora](https://meteora.ag) — dynamic AMM pools (DLMM) and stable liquidity
- [MarginFi](https://marginfi.com) — borrowing and lending with merit-based rates

### 🖼️ NFT & Collectibles

- [Magic Eden](https://magiceden.io) — largest Solana NFT marketplace
- [Tensor](https://tensor.trade) — analytics-first NFT trading with portfolio tools
- [DRiP Haus](https://drip.haus) — free digital art drops; ideal starting point for new collectors

### 🌐 Community & Builder Network

- [Superteam](https://superteam.fun) — Solana's global builder community: bounties, grants, and network
- [Colosseum](https://colosseum.com) — hackathons, accelerator, and the path to $250K funding
- [Dialect](https://dialect.to) — on-chain messaging and smart notifications for Solana apps

---

## Proposed Enhancements

The following improvements are validated and planned for the hackathon window:

### 1. Solana Actions / Blinks — _Rep Card as a Blink_ ✅

Any Rep Card URL is a native [Solana Action](https://solana.com/docs/advanced/actions) — renders interactively inside Phantom, Backpack, X posts, and Dialect. Share `https://visiowl.app/api/actions/wallet/<address>` and any Blink-compatible client shows score, tier, badges, and a "View Full Rep Card" button.

> Implemented: `src/app/api/actions/wallet/[address]/route.ts` · `public/actions.json` · CORS via `next.config.ts`

### 2. Spaces — On-chain Allowlist + Gated Link

Two layers of real utility for Verified Spaces:

- **Gated Link** ✅ — Space creator stores a private URL (Discord invite, form, allowlist) revealed only to wallets that pass verification
- **On-chain Allowlist** _(pending)_: `verify_access` instruction appends the caller's pubkey to the Space PDA member list — creates a queryable, sybil-resistant allowlist for NFT mints, DAO airdrops, and token distributions
  > Target: extend `Space` PDA + `create_space` / `verify_access` instructions

### 3. Memecoin Activity — _"Degen" Badge_ ✅

Detects pump.fun program interactions (`6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P`) from the existing Helius Enhanced Transactions response — zero additional API quota. Awards a standalone **Degen badge** that reflects the full Solana meta without influencing the core Rep Score.

> Implemented: `src/lib/scoring/helius.ts` · `src/lib/badges.ts` · `src/lib/scoring/compute.ts`

### 4. Dialect Notifications — _Score Tier Alerts_

Notify a wallet via Dialect when their Rep Score crosses a tier threshold (e.g., "You just hit Power User!"). Drives re-engagement without email or centralised push.

> Target: `src/app/api/score/route.ts` post-compute hook

---

## Stack

| Layer            | Technology                                                                     |
| ---------------- | ------------------------------------------------------------------------------ |
| Framework        | Next.js 16 App Router                                                          |
| Language         | TypeScript (strict)                                                            |
| Styling          | Tailwind CSS v4                                                                |
| Animation        | Motion 12 (motion/react)                                                       |
| Wallet           | Solana Wallet Adapter (Phantom, Solflare, Backpack)                            |
| On-chain program | **Anchor 0.32** (Rust) · `programs/visiowl`                                    |
| Client ↔ chain  | `@coral-xyz/anchor` · IDL in `programs/visiowl/target/`                        |
| Data fetching    | TanStack Query v5                                                              |
| State            | Zustand v5                                                                     |
| Validation       | Zod                                                                            |
| Testing          | Vitest + Testing Library (app) · Mocha + ts-mocha (on-chain integration tests) |
| Package mgr      | pnpm (workspace)                                                               |

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

| Command           | Description                                                                                      |
| ----------------- | ------------------------------------------------------------------------------------------------ |
| `pnpm dev`        | Start dev server with Turbopack                                                                  |
| `pnpm build`      | Production build                                                                                 |
| `pnpm lint`       | ESLint check                                                                                     |
| `pnpm type-check` | TypeScript check (Next app; Anchor tests are excluded — use `anchor test` in `programs/visiowl`) |
| `pnpm test`       | Run Vitest tests                                                                                 |
| `pnpm format`     | Prettier format                                                                                  |

**Anchor** (run inside `programs/visiowl`):

| Command                                   | Description                                        |
| ----------------------------------------- | -------------------------------------------------- |
| `anchor build`                            | Compile program + refresh IDL and TypeScript types |
| `anchor test`                             | Local validator + integration tests                |
| `anchor deploy --provider.cluster devnet` | Deploy to devnet                                   |

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

## Agentic Coding

See `.claude/CLAUDE.md` for full coding conventions, architecture notes,
on-chain program overview, and task patterns used with Claude Code.

---

_Proof of Rep · Visiowl · Solana Frontier Hackathon 2026_
