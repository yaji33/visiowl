import { useMutation } from "@tanstack/react-query";
import type { CreateSpaceInput } from "@/lib/validators";
import type { Space } from "@/types";

async function createSpace(input: CreateSpaceInput): Promise<Space> {
  const res = await fetch("/api/space", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(input),
  });
  if (!res.ok) {
    const body = await res.json() as { error?: unknown };
    throw new Error(typeof body.error === "string" ? body.error : "Failed to create space");
  }
  return res.json() as Promise<Space>;
}

export function useCreateSpace() {
  return useMutation<Space, Error, CreateSpaceInput>({
    mutationFn: createSpace,
  });
}
