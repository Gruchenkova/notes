import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { createNote } from "@/lib/notes";
import { z } from "zod";

const CreateNoteSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  contentJson: z.string().min(1, "Content is required"),
});

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = CreateNoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { title, contentJson } = parsed.data;
  const note = await createNote(session.user.id, title, contentJson);
  return NextResponse.json({ id: note.id }, { status: 201 });
}
