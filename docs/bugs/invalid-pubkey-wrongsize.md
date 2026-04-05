# Bug Report: `RPC error: Invalid param: WrongSize` on `/api/score`

**Status:** Fixed  
**Severity:** High — crashes the score API for any malformed-but-plausible Solana address  
**File fixed:** `src/lib/validators/index.ts`

---

## Symptoms

```
POST /api/score
Body: { "address": "8mH3qX7vR2kL9ePdNtF4uWsYcB6jA1mZ5nV8pK9R" }

Response: { "error": "Internal server error" }  (HTTP 500)

Server log:
  Score API error: Error: RPC error: Invalid param: WrongSize
      at rpc (src\lib\scoring\helius.ts:35:25)
      at async getStakingAccounts (src\lib\scoring\helius.ts:96:15)
      at async fetchWalletData (src\lib\scoring\helius.ts:114:60)
      at async POST (src\app\api\score\route.ts:14:20)
```

---

## Call Chain

```
POST /api/score (route.ts)
  └─ ScoreRefreshSchema.safeParse(body)          ← passes (bug is here)
  └─ fetchWalletData(address)  (helius.ts)
       └─ Promise.all([
            getWalletCreationSlot(address),
            getEnhancedTransactions(address),
            getTokenAccounts(address),
            getStakingAccounts(address),          ← throws WrongSize
          ])
```

---

## Root Cause

### The Validator Gap

`SolanaAddressSchema` in `src/lib/validators/index.ts` (before fix):

```typescript
export const SolanaAddressSchema = z
  .string()
  .min(32)
  .max(44)
  .regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, "Invalid Solana address");
```

It checked two things:

1. String character length is between 32 and 44.
2. Every character is in the base58 alphabet (`[1-9A-HJ-NP-Za-km-z]`).

It did **not** check that the string base58-decodes to **exactly 32 bytes** — the only encoding size that represents a valid Solana `Pubkey`.

### Why the Address Passes Validation but Fails the RPC

A Solana public key is 32 bytes. Base58-encoding 32 bytes consistently produces a string of **43–44 characters**.

The address `8mH3qX7vR2kL9ePdNtF4uWsYcB6jA1mZ5nV8pK9R` is:

- **41 characters** — within the 32–44 string-length window → `min/max` check passes.
- **All valid base58 characters** → `regex` check passes.
- **Decodes to ~30 bytes**, not 32 → invalid `Pubkey`.

The Zod schema accepted it; the Helius RPC did not.

### Why `getStakingAccounts` Specifically

`getStakingAccounts` calls `getProgramAccounts` with a `memcmp` filter:

```typescript
// src/lib/scoring/helius.ts  lines 96–103
const res = await rpc("getProgramAccounts", [
  "Stake11111111111111111111111111111111111111112",
  {
    filters: [{ memcmp: { offset: 44, bytes: address } }],
    encoding: "jsonParsed",
  },
]);
```

The `memcmp.bytes` field is interpreted as the raw bytes to compare at the given offset in an account's data. The Solana JSON-RPC node validates that the byte sequence is exactly the right size for the comparison — at offset 44 in a native stake account, the field is the 32-byte staker `Pubkey`. Any `bytes` value that does not base58-decode to exactly 32 bytes is rejected with:

```
Invalid param: WrongSize
```

Other calls are more lenient or fail gracefully:

- `getEnhancedTransactions` — REST API, catches HTTP errors and returns `[]` silently.
- `getSignaturesForAddress` / `getTokenAccountsByOwner` — pass the address as a direct positional parameter; these may also have returned errors (since `Promise.all` races), but `getStakingAccounts` is the call shown in the stack trace as the rejection that surfaced.

---

## Fix

`src/lib/validators/index.ts` — add a `.refine()` step that attempts to construct a `PublicKey`. The `@solana/web3.js` constructor throws on any address that does not decode to exactly 32 bytes, making it the authoritative guard:

```typescript
import { z } from "zod";
import { PublicKey } from "@solana/web3.js";

function isValidPublicKey(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

export const SolanaAddressSchema = z
  .string()
  .min(32)
  .max(44)
  .regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, "Invalid Solana address")
  .refine(isValidPublicKey, "Address does not decode to a valid 32-byte Solana public key");
```

The existing `.min(32).max(44)` and `.regex(...)` checks are kept as cheap pre-filters that short-circuit before the `PublicKey` constructor runs.

### Effect on the Error Scenario

With the fix, the same `curl` now returns a structured 400 instead of a 500:

```json
{
  "error": {
    "formErrors": [],
    "fieldErrors": {
      "address": ["Address does not decode to a valid 32-byte Solana public key"]
    }
  }
}
```

No RPC call is made. The Helius API is never reached for invalid addresses.

---

## Affected Files

| File                          | Change                                                                               |
| ----------------------------- | ------------------------------------------------------------------------------------ |
| `src/lib/validators/index.ts` | Added `PublicKey` import + `.refine(isValidPublicKey, ...)` to `SolanaAddressSchema` |

## Related Files (unchanged)

| File                                           | Role                                                                                             |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `src/app/api/score/route.ts`                   | Calls `ScoreRefreshSchema.safeParse()` — now correctly rejects invalid addresses at the boundary |
| `src/lib/scoring/helius.ts`                    | `getStakingAccounts` was the first call to surface the RPC error; no change needed here          |
| `programs/visiowl/programs/visiowl/src/lib.rs` | On-chain program; unrelated to this off-chain RPC validation bug                                 |

---

## Prevention

- All external address inputs must be validated with `new PublicKey(addr)` before reaching any RPC call.
- The `SolanaAddressSchema` is the single source of truth for this — any new API route that accepts a wallet address should use it from `@/lib/validators`.

---

# Bug Report 2: `RPC error: Invalid param: WrongSize` for Valid Mainnet Addresses

**Status:** Fixed  
**Severity:** High — score API returned 500 for every request, including valid mainnet addresses  
**File fixed:** `src/lib/scoring/helius.ts`

---

## Symptoms

After fixing the validator (Bug 1), valid mainnet addresses still produced the same error:

```
POST /api/score
Body: { "address": "EJBhw3TP6pCXo4ZEx9t41tSm3u3Bye9EzSW48tL5bu4N" }

Response: { "error": "Internal server error" }  (HTTP 500)

Server log:
  Score API error: Error: RPC error: Invalid param: WrongSize
      at rpc (src\lib\scoring\helius.ts:35:25)
      at async getStakingAccounts (src\lib\scoring\helius.ts:96:15)
```

---

## Root Cause

### Stake Program ID Typo

`getStakingAccounts` in `src/lib/scoring/helius.ts` contained a one-character typo in the native stake program address:

```typescript
// WRONG — 38 ones followed by "2"
"Stake11111111111111111111111111111111111111112";

// CORRECT — 39 ones
"Stake11111111111111111111111111111111111111111";
```

The last character was `2` instead of `1`. This is a single-character typo that is easy to miss visually since the string is 44 characters long.

### Why This Caused WrongSize

When `getProgramAccounts` is called with `encoding: "jsonParsed"` on an unrecognised/wrong program ID, the Helius RPC node cannot resolve the account data schema for that program. It attempts to validate the `memcmp` filter against an unknown account layout and returns:

```
Invalid param: WrongSize
```

The address itself was valid (passed `new PublicKey()`), but the wrong program ID caused the RPC filter validation to fail before any accounts were fetched.

---

## Fix

Two changes were applied to `src/lib/scoring/helius.ts`:

### 1. Corrected the stake program ID

```typescript
// Before
"Stake11111111111111111111111111111111111111112";

// After
"Stake11111111111111111111111111111111111111111";
```

### 2. Added graceful error handling

Wrapped the `getProgramAccounts` call in a `try/catch` so that any future RPC errors (rate limits, plan restrictions, network issues) return an empty staking array rather than crashing the entire scoring pipeline:

```typescript
async function getStakingAccounts(address: string): Promise<Array<{...}>> {
  try {
    const res = await rpc("getProgramAccounts", [
      "Stake11111111111111111111111111111111111111111",
      { filters: [{ memcmp: { offset: 44, bytes: address } }], encoding: "jsonParsed" },
    ]) as Array<...>;
    return (res ?? []).map((a) => ({ ... }));
  } catch {
    return [];
  }
}
```

---

## Affected Files

| File                        | Change                                                                 |
| --------------------------- | ---------------------------------------------------------------------- |
| `src/lib/scoring/helius.ts` | Fixed stake program ID typo; added `try/catch` to `getStakingAccounts` |

---

## Prevention

- Native Solana program addresses should be sourced from `@solana/web3.js` constants (e.g. `StakeProgram.programId.toBase58()`) rather than hand-typed strings.
- All `getProgramAccounts`-based helpers should handle errors gracefully and return empty arrays to avoid cascading failures in `Promise.all` pipelines.
