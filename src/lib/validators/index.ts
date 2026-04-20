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

export const ScoreRefreshSchema = z.object({ address: SolanaAddressSchema });
export const CreateSpaceSchema = z.object({
  name: z.string().min(3).max(60),
  description: z.string().max(200).optional(),
  type: z.enum(["open", "verified"]),
  minScore: z.number().int().min(0).max(1000),
  operatorAddress: SolanaAddressSchema,
  gatedUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  spacePda: z.string().optional(),
});

export type ScoreRefreshInput = z.infer<typeof ScoreRefreshSchema>;
export type CreateSpaceInput = z.infer<typeof CreateSpaceSchema>;
