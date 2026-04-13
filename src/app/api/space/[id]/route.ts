import { NextResponse } from "next/server";
import { getSpace } from "@/lib/space-store";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const space = getSpace(id);
  if (!space) return NextResponse.json({ error: "Space not found" }, { status: 404 });
  return NextResponse.json(space);
}
