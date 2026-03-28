import { get, query, run } from "./db";
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
  is_public: number;
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
    isPublic: row.is_public === 1,
    publicSlug: row.public_slug,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function createNote(
  userId: string,
  title: string,
  contentJson: string
): Note {
  const id = randomUUID();
  run(
    `INSERT INTO notes (id, user_id, title, content_json)
     VALUES ($id, $userId, $title, $contentJson)`,
    { id, userId, title, contentJson }
  );
  const row = get<NoteRow>(`SELECT * FROM notes WHERE id = $id`, { id })!;
  return toNote(row);
}

export function getNotesByUser(userId: string): Note[] {
  const rows = query<NoteRow>(
    `SELECT * FROM notes WHERE user_id = $userId ORDER BY updated_at DESC`,
    { userId }
  );
  return rows.map(toNote);
}

export function getNoteById(userId: string, noteId: string): Note | null {
  const row = get<NoteRow>(
    `SELECT * FROM notes WHERE id = $noteId AND user_id = $userId`,
    { noteId, userId }
  );
  return row ? toNote(row) : null;
}

export function updateNote(
  userId: string,
  noteId: string,
  data: Partial<{ title: string; contentJson: string; isPublic: boolean }>
): Note | null {
  const existing = getNoteById(userId, noteId);
  if (!existing) return null;

  const title = data.title ?? existing.title;
  const contentJson = data.contentJson ?? existing.contentJson;

  if (data.isPublic === undefined) {
    run(
      `UPDATE notes
       SET title = $title, content_json = $contentJson, updated_at = datetime('now')
       WHERE id = $noteId AND user_id = $userId`,
      { title, contentJson, noteId, userId }
    );
  } else {
    const isPublic = data.isPublic ? 1 : 0;
    const publicSlug = data.isPublic
      ? (existing.publicSlug ?? generateSlug())
      : null;
    run(
      `UPDATE notes
       SET title = $title, content_json = $contentJson, is_public = $isPublic,
           public_slug = $publicSlug, updated_at = datetime('now')
       WHERE id = $noteId AND user_id = $userId`,
      { title, contentJson, isPublic, publicSlug, noteId, userId }
    );
  }

  return getNoteById(userId, noteId);
}

export function getNoteBySlug(slug: string): Note | null {
  const row = get<NoteRow>(
    `SELECT * FROM notes WHERE public_slug = $slug AND is_public = 1`,
    { slug }
  );
  return row ? toNote(row) : null;
}

export function deleteNote(userId: string, noteId: string): void {
  run(
    `DELETE FROM notes WHERE id = $noteId AND user_id = $userId`,
    { noteId, userId }
  );
}
