import { NextResponse } from "next/server";
import { getSpace, addSpaceEvent, getSpaceEvents } from "@/lib/space-store";
import { z } from "zod";

const CreateEventSchema = z.object({
  title:       z.string().min(3).max(120),
  description: z.string().max(400).optional(),
  type:        z.enum(["ama", "mint", "vote", "airdrop", "other"]),
  link:        z.string().url().optional().or(z.literal("")),
  scheduledAt: z.string().datetime(),
});

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const events = await getSpaceEvents(id);
  return NextResponse.json(events);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const space = await getSpace(id);
  if (!space) return NextResponse.json({ error: "Space not found" }, { status: 404 });

  try {
    const body = (await req.json()) as unknown;
    const parsed = CreateEventSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const event = {
      id:          crypto.randomUUID(),
      spaceId:     id,
      title:       parsed.data.title,
      description: parsed.data.description,
      type:        parsed.data.type,
      link:        parsed.data.link || undefined,
      scheduledAt: parsed.data.scheduledAt,
      createdAt:   new Date().toISOString(),
    };

    await addSpaceEvent(event);
    return NextResponse.json(event, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
