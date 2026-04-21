# Visiowl 🦉

> **The sybil-resistant identity layer for Solana.** Any wallet gets a real-time Rep Score from six on-chain signals. Any protocol queries it with a single API call — to filter bots, gate allowlists, and qualify voters before they cost you millions.

Built for the **Solana Frontier Hackathon** (April 6 – May 11, 2026) · Consumer App track.

---

## The Problem

Every airdrop, NFT mint, DAO vote, and token distribution on Solana is exposed to the same threat: sybil wallets and bots claiming rewards they didn't earn. Projects routinely lose millions per launch to fake participants, and every protocol rolls its own heuristics to compensate — poorly, expensively, and differently each time.

**Solana has no shared behavioral identity primitive.** Visiowl is that primitive.

---

## What is Visiowl?

Visiowl reads any Solana wallet's on-chain history through Helius, computes a **Rep Score** across six weighted behavioral signals, and exposes the result in two ways:

1. **API** — `GET /api/score?address=<pubkey>` — any protocol integrates sybil filtering in one line
2. **Rep Card** — a visual, shareable identity card that turns on-chain history into social capital

Scores are stored in on-chain **RepCard PDAs**, queryable by any Solana program via CPI — no server dependency for the final verification step.

### Who it's for

| Audience                 | Value                                                                    |
| ------------------------ | ------------------------------------------------------------------------ |
| **Solana protocols**     | One API call to filter sybils before airdrops, mints, and DAO votes      |
| **Community operators**  | Verified Spaces — gate access by proven Rep Score instead of invite bots |
| **NFT & token projects** | On-chain allowlists of quality holders, queryable by any program via CPI |
| **Any wallet holder**    | Instant Rep Card — know your standing, share your proof, grow your score |
| **New Solana users**     | Guided Next Steps toward real platforms to build on-chain reputation     |

### User journey

1. Connect wallet **or paste any address** → Rep Card loads in seconds
2. See your score, tier, signal breakdown, and earned badges
3. Follow personalised **Next Steps** to grow your score on real Solana platforms
4. Create a **Verified Space** to gate your community by minimum Rep Score
5. Share your Rep Card — your on-chain proof, visible to everyone

### Protocol integration (30 seconds)

```bash
# Before any airdrop, mint gate, or DAO vote — check wallet quality:
curl "https://visiowl.app/api/score?address=<pubkey>"
# → { score: 437, tier: "Power User", signals: [...], badges: [...] }
```

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

## Roadmap

### ✅ Shipped

| Feature                                                                                      | Location                                          |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| Rep Score API — `GET /api/score?address=<pubkey>`                                            | `src/app/api/score/route.ts`                      |
| Rep Card — tiered, badged, shareable                                                         | `src/components/rep-card/`                        |
| Wallet Lookup — paste any address on home                                                    | `src/app/page.tsx`                                |
| Leaderboard — wallets ranked by Rep Score                                                    | `src/app/activity/page.tsx`                       |
| Verified Spaces — score-gated community links                                                | `src/app/spaces/` · `src/app/space/`              |
| Solana Actions / Blinks — Rep Card as a Blink                                                | `src/app/api/actions/wallet/[address]/route.ts`   |
| Degen Badge — pump.fun detection                                                             | `src/lib/scoring/helius.ts` · `src/lib/badges.ts` |
| On-chain RepCard PDA — `initialize_rep_card`, `update_score`, `award_badge`, `verify_access` | `programs/visiowl/`                               |
| Next Steps panel — personalised score-growth actions                                         | `src/components/rep-card/LevelUpPanel.tsx`        |

### 🔜 Planned

| Feature                          | Description                                                                                                                                                      |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Trustless score oracle**       | Replace centralized `score_authority` with a Switchboard oracle feed or ZK-compressed proof of Helius data. The PDA computation becomes verifiable by any party. |
| **`create_space` on-chain wire** | Connect the frontend Space creation form to the `create_space` Anchor instruction (PDA currently stored in Redis; instruction is implemented and tested).        |
| **Protocol demo integration**    | A devnet NFT mint gated by `RepScore ≥ 200` — demonstrates the CPI verification path end-to-end.                                                                 |
| **Dialect notifications**        | Tier-crossing alerts when your Rep Score hits a new threshold — no email or centralised push required.                                                           |

### Oracle Trust Model (current)

The score computation pipeline is: `Helius API → Next.js server → centralized score_authority keypair → RepCard PDA`.

This is an acknowledged trust assumption for the hackathon window. The score_authority keypair is held by the Visiowl backend; anyone can independently verify the score by rerunning the same Helius calls and computation. The roadmap item above (Switchboard oracle) removes this centralization entirely.

> The `update_score` and `award_badge` instructions require `score_authority::ID` to sign — see `programs/visiowl/programs/visiowl/src/lib.rs:207-217`. The on-chain PDA is the canonical score record; the API is the read interface.

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

_Sybil Resistance, On-Chain · Visiowl · Solana Frontier Hackathon 2026_
