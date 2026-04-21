import { NextResponse } from "next/server";
import { getSpace, patchSpace, addSpaceMember } from "@/lib/space-store";
import type { SpaceMember } from "@/types";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const space = await getSpace(id);
  if (!space) return NextResponse.json({ error: "Space not found" }, { status: 404 });
  return NextResponse.json(space);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const space = await getSpace(id);
  if (!space) return NextResponse.json({ error: "Space not found" }, { status: 404 });

  let memberData: Omit<SpaceMember, "joinedAt"> | undefined;
  try {
    const body = (await req.json()) as Partial<Omit<SpaceMember, "joinedAt">>;
    if (body.address && body.score !== undefined && body.tier && body.shortAddress) {
      memberData = body as Omit<SpaceMember, "joinedAt">;
    }
  } catch {

  }

  const updated = await patchSpace(id, { memberCount: space.memberCount + 1 });

  if (memberData) {
    await addSpaceMember(id, {
      ...memberData,
      joinedAt: new Date().toISOString(),
    });
  }

  return NextResponse.json(updated);
}
