import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getNoteById, updateNote, deleteNote } from "@/lib/notes";
import { z } from "zod";

const UpdateNoteSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  contentJson: z.string().min(1).optional(),
  isPublic: z.boolean().optional(),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  const [session, { id }] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    params,
  ]);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = UpdateNoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const note = updateNote(session.user.id, id, parsed.data);
  if (!note) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  return NextResponse.json(note);
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const [session, { id }] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    params,
  ]);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const note = getNoteById(session.user.id, id);
  if (!note) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  deleteNote(session.user.id, id);
  return new NextResponse(null, { status: 204 });
}
