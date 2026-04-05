import type { RawWalletData } from "./compute";

const HELIUS_API_KEY = process.env.HELIUS_API_KEY ?? "";
const HELIUS_RPC = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
const HELIUS_API = `https://api.helius.xyz/v0`;

// Known program IDs for instruction-level DeFi detection (Enhanced Transactions API)
const DEFI_PROGRAMS = new Set([
  // Aggregators 
  "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4", // Jupiter Aggregator v6
  // AMMs / DEXes 
  "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8", // Raydium AMM v4
  "CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK", // Raydium CPMM
  "RVKd61ztZW9GUwhRbbLoYVRE5Xf1B2tVscKqwZqXgEr", // Raydium CLMM
  "whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc", // Orca Whirlpools
  "9W959DqEETiGZocYWCQPaJ6sBmUzgfxXfqGeTEdp3aQP", // Orca v2
  "LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo", // Meteora DLMM
  "Eo7WjKq67rjJQDd81yD4uyWABBaI6SgaA4v5fGZeFGf", // Meteora Dynamic Pools
  "PhoeNiXZ8ByJGLkxNfZRnkUfjvmuYqLR89jjFHGqdXY", // Phoenix DEX
  // Lending / Money Markets 
  "KaMNeReftLhJoefgd3apEoHZo4Uf1aTiZqTMfSdtEgr", // Kamino Lending
  "MFv2hWf31Z9kbCa1snEPdcgp168vLLAael5V6fvGrXg", // MarginFi v2
  "So1endDq2YkqhipRh3WViPa8hdiSpxWy6z3Z6tMCpAo", // Solend
  // Liquid Staking 
  "MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD", // Marinade Finance
  "SPoo1Ku8WFXoNDMHPsrGSTSG1Y47rzgn41SLUNakuHy", // Solana Stake Pool program
  // NFT / Trading 
  "TSWAPaqyCSx2KABk68Shruf4rp7CxcAi9Pu7KHQg5aB", // Tensor Swap
]);

// Known governance / DAO program IDs
const GOVERNANCE_PROGRAMS = new Set([
  "GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw", // SPL Governance (Realms)
  "SMPLecH534NA9acpos4G6x7uf3LWbCAwZQE9e8ZekMu", // Squads Multisig v3
  "SQDS4ep65T869zMMBKyuUq6aD6EgTu8psMjkvj52pCf", // Squads Multisig v4
]);

// Known DeFi protocol token mints — RPC-native fallback.
// Holding these tokens is on-chain proof of DeFi participation,
// detectable via getTokenAccountsByOwner even when the Enhanced API is unavailable.
const DEFI_TOKEN_MINTS = new Set([
  // Liquid Staking Tokens 
  "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So", // mSOL   — Marinade
  "J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn", // jitoSOL — Jito
  "bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1", // bSOL   — BlazeStake
  "7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj", // stSOL  — Lido (deprecated but holders remain)
  // DEX Governance / Utility Tokens 
  "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R", // RAY   — Raydium
  "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN", // JUP   — Jupiter
  "27G8MtK7VtTcCHkpASjSDdkWWYfoqT6ggEuKidVJidD4", // JLP   — Jupiter Liquidity Provider token
]);

async function rpc(method: string, params: unknown[]): Promise<unknown> {
  const res = await fetch(HELIUS_RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  if (!res.ok) throw new Error(`Helius RPC error: ${res.status}`);
  const json = (await res.json()) as { result?: unknown; error?: { message: string } };
  if (json.error) throw new Error(`RPC error: ${json.error.message}`);
  return json.result;
}

async function getSignatureData(
  address: string,
): Promise<{ createdAt: number; totalTxCount: number }> {
  const sigs = (await rpc("getSignaturesForAddress", [address, { limit: 1000 }])) as Array<{
    blockTime: number;
    signature: string;
  }>;
  if (!sigs.length) {
    return { createdAt: Math.floor(Date.now() / 1000) - 60 * 24 * 3600, totalTxCount: 0 };
  }
  const lastSig = sigs[sigs.length - 1];
  return {
    createdAt: lastSig?.blockTime ?? Math.floor(Date.now() / 1000),
    totalTxCount: sigs.length,
  };
}

async function getEnhancedTransactions(address: string): Promise<
  Array<{
    type: string;
    source: string;
    accountData: Array<{ account: string }>;
    instructions: Array<{ programId: string }>;
    timestamp: number;
  }>
> {
  const url = `${HELIUS_API}/addresses/${address}/transactions?api-key=${HELIUS_API_KEY}&limit=100&type=ANY`;
  const res = await fetch(url);
  if (!res.ok) return [];
  return res.json() as Promise<
    Array<{
      type: string;
      source: string;
      accountData: Array<{ account: string }>;
      instructions: Array<{ programId: string }>;
      timestamp: number;
    }>
  >;
}

async function getTokenAccounts(address: string): Promise<
  Array<{
    mint: string;
    amount: number;
    decimals: number;
  }>
> {
  const res = (await rpc("getTokenAccountsByOwner", [
    address,
    { programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" },
    { encoding: "jsonParsed" },
  ])) as {
    value: Array<{
      account: {
        data: {
          parsed: { info: { mint: string; tokenAmount: { amount: string; decimals: number } } };
        };
      };
    }>;
  };

  return (res.value ?? []).map((a) => ({
    mint: a.account.data.parsed.info.mint,
    amount: parseInt(a.account.data.parsed.info.tokenAmount.amount),
    decimals: a.account.data.parsed.info.tokenAmount.decimals,
  }));
}

async function getStakingAccounts(address: string): Promise<
  Array<{
    activationEpoch: number;
    stake: number;
  }>
> {
  try {
    const res = (await rpc("getProgramAccounts", [
      "Stake11111111111111111111111111111111111111111",
      {
        filters: [{ memcmp: { offset: 44, bytes: address } }],
        encoding: "jsonParsed",
      },
    ])) as Array<{
      account: {
        data: {
          parsed: { info: { stake: { delegation: { activationEpoch: string; stake: string } } } };
        };
      };
    }>;

    return (res ?? []).map((a) => ({
      activationEpoch: parseInt(a.account.data.parsed.info.stake.delegation.activationEpoch),
      stake: parseInt(a.account.data.parsed.info.stake.delegation.stake) / 1e9,
    }));
  } catch {
    return [];
  }
}

const DEFI_POSITION_PROGRAMS: Array<{ program: string; offset: number; label: string }> = [
  { program: "LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo", offset: 40, label: "Meteora DLMM" }, // discriminator[8] + lb_pair[32] = owner at 40
  { program: "Eo7WjKq67rjJQDd81yD4uyWABBaI6SgaA4v5fGZeFGf", offset: 40, label: "Meteora Pools" }, // same struct layout
  { program: "KaMNeReftLhJoefgd3apEoHZo4Uf1aTiZqTMfSdtEgr", offset: 8, label: "Kamino" }, // discriminator[8] = owner at 8
  { program: "MFv2hWf31Z9kbCa1snEPdcgp168vLLAael5V6fvGrXg", offset: 8, label: "MarginFi" }, // discriminator[8] = authority at 8
];

async function getDeFiPositionCount(address: string): Promise<number> {
  const results = await Promise.allSettled(
    DEFI_POSITION_PROGRAMS.map(async ({ program, offset }) => {
      const res = (await rpc("getProgramAccounts", [
        program,
        {
          filters: [{ memcmp: { offset, bytes: address } }],
          dataSlice: { offset: 0, length: 0 }, 
          encoding: "base64",
        },
      ])) as Array<unknown>;
      return res.length > 0;
    }),
  );
  return results.filter((r) => r.status === "fulfilled" && r.value === true).length;
}

export async function fetchWalletData(address: string): Promise<RawWalletData> {
  const [sigData, txs, tokenAccounts, stakingAccounts, defiPositionCount] = await Promise.all([
    getSignatureData(address),
    getEnhancedTransactions(address), 
    getTokenAccounts(address),
    getStakingAccounts(address),
    getDeFiPositionCount(address),
  ]);
  const { createdAt, totalTxCount } = sigData;


  const currentEpoch = 750; 
  const stakingMonths =
    stakingAccounts.length > 0
      ? Math.max(
          ...stakingAccounts.map(
            (s) => Math.floor(((currentEpoch - s.activationEpoch) * 2.5) / 30), 
          ),
        )
      : 0;
  const totalSolStaked = stakingAccounts.reduce((sum, s) => sum + s.stake, 0);

  const programsSeen = new Set<string>();
  const daosSeen = new Set<string>();
  let defiTxCount = 0;
  let governanceVoteCount = 0;

  for (const tx of txs) {
    for (const ix of tx.instructions) {
      programsSeen.add(ix.programId);
      if (DEFI_PROGRAMS.has(ix.programId)) defiTxCount++;
      if (GOVERNANCE_PROGRAMS.has(ix.programId)) {
        governanceVoteCount++;
        daosSeen.add(ix.programId);
      }
    }
  }

  const defiProgramCount = [...programsSeen].filter((p) => DEFI_PROGRAMS.has(p)).length;

  // Fallback: count distinct DeFi token mints held (always available via RPC getTokenAccountsByOwner).
  // Each distinct mint maps to one protocol — mSOL=Marinade, jitoSOL=Jito, RAY=Raydium, etc.
  const defiMintProtocols = new Set(
    tokenAccounts.filter((t) => DEFI_TOKEN_MINTS.has(t.mint)).map((t) => t.mint),
  );

  const defiProtocolCount = Math.max(defiProgramCount, defiMintProtocols.size, defiPositionCount);
  const nftAccounts = tokenAccounts.filter((t) => t.decimals === 0 && t.amount === 1);
  const nftHeldCount = nftAccounts.length;
  const maxNftHoldMonths = nftHeldCount > 0 ? 6 : 0;

  return {
    address,
    createdAt,
    stakingMonths: Math.max(stakingMonths, 0),
    totalSolStaked: Math.round(totalSolStaked),
    governanceVoteCount,
    distinctDaos: daosSeen.size,
    defiProtocolCount,
    defiTxCount,
    nftHeldCount,
    maxNftHoldMonths,
    totalTxCount, 
    distinctProgramCount: programsSeen.size, 
  };
}
