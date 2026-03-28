import { sql } from "./db";
import { randomUUID, randomBytes } from "crypto";

function generateSlug(): string {
  return randomBytes(12).toString("base64url");
}

export interface Note {
  id: string;
  userId: string;
  title: string;
  contentJson: string;
  isPublic: boolean;
  publicSlug: string | null;
  createdAt: string;
  updatedAt: string;
}

interface NoteRow {
  id: string;
  user_id: string;
  title: string;
  content_json: string;
  is_public: boolean;
  public_slug: string | null;
  created_at: string;
  updated_at: string;
}

function toNote(row: NoteRow): Note {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    contentJson: row.content_json,
    isPublic: row.is_public,
    publicSlug: row.public_slug,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createNote(
  userId: string,
  title: string,
  contentJson: string
): Promise<Note> {
  const id = randomUUID();
  const rows = await sql`
    INSERT INTO notes (id, user_id, title, content_json)
    VALUES (${id}, ${userId}, ${title}, ${contentJson})
    RETURNING *
  `;
  return toNote(rows[0] as NoteRow);
}

export async function getNotesByUser(userId: string): Promise<Note[]> {
  const rows = await sql`
    SELECT * FROM notes WHERE user_id = ${userId} ORDER BY updated_at DESC
  `;
  return rows.map((r) => toNote(r as NoteRow));
}

export async function getNoteById(
  userId: string,
  noteId: string
): Promise<Note | null> {
  const rows = await sql`
    SELECT * FROM notes WHERE id = ${noteId} AND user_id = ${userId}
  `;
  return rows[0] ? toNote(rows[0] as NoteRow) : null;
}

export async function updateNote(
  userId: string,
  noteId: string,
  data: Partial<{ title: string; contentJson: string; isPublic: boolean }>
): Promise<Note | null> {
  const existing = await getNoteById(userId, noteId);
  if (!existing) return null;

  const title = data.title ?? existing.title;
  const contentJson = data.contentJson ?? existing.contentJson;

  if (data.isPublic === undefined) {
    await sql`
      UPDATE notes
      SET title = ${title}, content_json = ${contentJson}, updated_at = NOW()
      WHERE id = ${noteId} AND user_id = ${userId}
    `;
  } else {
    const isPublic = data.isPublic;
    const publicSlug = data.isPublic
      ? (existing.publicSlug ?? generateSlug())
      : null;
    await sql`
      UPDATE notes
      SET title = ${title}, content_json = ${contentJson},
          is_public = ${isPublic}, public_slug = ${publicSlug}, updated_at = NOW()
      WHERE id = ${noteId} AND user_id = ${userId}
    `;
  }

  return getNoteById(userId, noteId);
}

export async function getNoteBySlug(slug: string): Promise<Note | null> {
  const rows = await sql`
    SELECT * FROM notes WHERE public_slug = ${slug} AND is_public = TRUE
  `;
  return rows[0] ? toNote(rows[0] as NoteRow) : null;
}

export async function deleteNote(userId: string, noteId: string): Promise<void> {
  await sql`
    DELETE FROM notes WHERE id = ${noteId} AND user_id = ${userId}
  `;
}
