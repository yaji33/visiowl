import { NextResponse } from "next/server";
import { getSpace, patchSpace } from "@/lib/space-store";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const space = await getSpace(id);
  if (!space) return NextResponse.json({ error: "Space not found" }, { status: 404 });
  return NextResponse.json(space);
}

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const space = await getSpace(id);
  if (!space) return NextResponse.json({ error: "Space not found" }, { status: 404 });
  const updated = await patchSpace(id, { memberCount: space.memberCount + 1 });
  return NextResponse.json(updated);
}
