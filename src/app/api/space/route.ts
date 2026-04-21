import { NextResponse } from "next/server";
import { CreateSpaceSchema } from "@/lib/validators";
import { pushSpace, getSpaces } from "@/lib/space-store";
import { shortenAddress } from "@/lib/utils";
import type { Space } from "@/types";

export async function GET() {
  return NextResponse.json(await getSpaces());
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as unknown;
    const parsed = CreateSpaceSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const id = crypto.randomUUID();
    const gatedUrl = parsed.data.gatedUrl || undefined;
    const space: Space = {
      id,
      ...parsed.data,
      gatedUrl,
      spacePda: parsed.data.spacePda ?? undefined,
      operatorShortAddress: shortenAddress(parsed.data.operatorAddress),
      inviteUrl: `${process.env["NEXT_PUBLIC_APP_URL"] ?? ""}/space/${id}`,
      createdAt: new Date().toISOString(),
      memberCount: 0,
    };

    await pushSpace(space);
    return NextResponse.json(space, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
