import { Program, AnchorProvider, setProvider } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import type { AnchorWallet } from "@solana/wallet-adapter-react";
// NOTE: Regenerated on every `anchor build` in programs/visiowl.
import type { Visiowl } from "@programs/visiowl/target/types/visiowl";
import IDL from "@programs/visiowl/target/idl/visiowl.json";

export const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_PROGRAM_ID ??
    "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"
);

export function getProgram(
  wallet: AnchorWallet,
  connection: Connection
): Program<Visiowl> {
  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  setProvider(provider);
  return new Program<Visiowl>(IDL as Visiowl, provider);
}

export function getRepCardPda(walletPublicKey: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("rep-card"), walletPublicKey.toBuffer()],
    PROGRAM_ID
  );
}

export function getSpacePda(
  operatorPublicKey: PublicKey,
  nameSeedPublicKey: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("space"),
      operatorPublicKey.toBuffer(),
      nameSeedPublicKey.toBuffer(),
    ],
    PROGRAM_ID
  );
}
