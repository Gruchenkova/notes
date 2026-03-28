import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  get: vi.fn(),
  query: vi.fn(),
  run: vi.fn(),
  default: {},
  getDb: vi.fn(),
}));

import * as db from "@/lib/db";
import {
  createNote,
  getNotesByUser,
  getNoteById,
  updateNote,
  deleteNote,
  getNoteBySlug,
} from "@/lib/notes";

const mockGet = vi.mocked(db.get);
const mockQuery = vi.mocked(db.query);
const mockRun = vi.mocked(db.run);

const baseRow = {
  id: "note-1",
  user_id: "user-1",
  title: "Test Note",
  content_json: '{"type":"doc","content":[]}',
  is_public: 0 as 0 | 1,
  public_slug: null as string | null,
  created_at: "2024-01-01T00:00:00",
  updated_at: "2024-01-01T00:00:00",
};

beforeEach(() => {
  vi.resetAllMocks();
});

// ── createNote ──────────────────────────────────────────────────────────────

describe("createNote", () => {
  it("inserts a row and returns the created note", () => {
    mockGet.mockReturnValueOnce(baseRow);

    const note = createNote("user-1", "Test Note", '{"type":"doc"}');

    expect(mockRun).toHaveBeenCalledOnce();
    expect(mockGet).toHaveBeenCalledOnce();
    expect(note.userId).toBe("user-1");
    expect(note.title).toBe("Test Note");
    expect(note.isPublic).toBe(false);
    expect(note.publicSlug).toBeNull();
  });

  it("generates a unique id for each note", () => {
    mockGet
      .mockReturnValueOnce({ ...baseRow, id: "id-a" })
      .mockReturnValueOnce({ ...baseRow, id: "id-b" });

    const a = createNote("user-1", "A", "{}");
    const b = createNote("user-1", "B", "{}");

    expect(a.id).not.toBe(b.id);
  });
});

// ── getNotesByUser ───────────────────────────────────────────────────────────

describe("getNotesByUser", () => {
  it("returns an array of mapped notes", () => {
    mockQuery.mockReturnValueOnce([baseRow]);

    const notes = getNotesByUser("user-1");

    expect(notes).toHaveLength(1);
    expect(notes[0].userId).toBe("user-1");
  });

  it("returns an empty array when user has no notes", () => {
    mockQuery.mockReturnValueOnce([]);

    const notes = getNotesByUser("user-1");

    expect(notes).toHaveLength(0);
  });

  it("passes userId as a query param to scope results", () => {
    mockQuery.mockReturnValueOnce([]);

    getNotesByUser("user-42");

    expect(mockQuery).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ userId: "user-42" })
    );
  });
});

// ── getNoteById ──────────────────────────────────────────────────────────────

describe("getNoteById", () => {
  it("returns null when the note is not found", () => {
    mockGet.mockReturnValueOnce(undefined);

    const note = getNoteById("user-1", "missing");

    expect(note).toBeNull();
  });

  it("returns the note when found", () => {
    mockGet.mockReturnValueOnce(baseRow);

    const note = getNoteById("user-1", "note-1");

    expect(note).not.toBeNull();
    expect(note!.id).toBe("note-1");
    expect(note!.title).toBe("Test Note");
  });

  it("scopes the query to the given userId", () => {
    mockGet.mockReturnValueOnce(undefined);

    getNoteById("user-99", "note-1");

    expect(mockGet).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ userId: "user-99", noteId: "note-1" })
    );
  });
});

// ── toNote field mapping ─────────────────────────────────────────────────────

describe("toNote field mapping", () => {
  it("converts is_public = 0 to isPublic = false", () => {
    mockQuery.mockReturnValueOnce([{ ...baseRow, is_public: 0 }]);

    const [note] = getNotesByUser("user-1");

    expect(note.isPublic).toBe(false);
  });

  it("converts is_public = 1 to isPublic = true", () => {
    mockQuery.mockReturnValueOnce([{ ...baseRow, is_public: 1 }]);

    const [note] = getNotesByUser("user-1");

    expect(note.isPublic).toBe(true);
  });

  it("maps all snake_case columns to camelCase fields", () => {
    const row = { ...baseRow, is_public: 1 as 1, public_slug: "abc123" };
    mockQuery.mockReturnValueOnce([row]);

    const [note] = getNotesByUser("user-1");

    expect(note.userId).toBe(row.user_id);
    expect(note.contentJson).toBe(row.content_json);
    expect(note.publicSlug).toBe(row.public_slug);
    expect(note.createdAt).toBe(row.created_at);
    expect(note.updatedAt).toBe(row.updated_at);
  });
});

// ── updateNote ───────────────────────────────────────────────────────────────

describe("updateNote", () => {
  it("returns null when the note does not exist", () => {
    mockGet.mockReturnValueOnce(undefined);

    const result = updateNote("user-1", "missing", { title: "New" });

    expect(result).toBeNull();
    expect(mockRun).not.toHaveBeenCalled();
  });

  it("updates title and content without touching sharing fields", () => {
    const updated = { ...baseRow, title: "New Title" };
    mockGet.mockReturnValueOnce(baseRow).mockReturnValueOnce(updated);

    const note = updateNote("user-1", "note-1", {
      title: "New Title",
      contentJson: '{"type":"doc"}',
    });

    expect(mockRun).toHaveBeenCalledOnce();
    const [sql] = mockRun.mock.calls[0];
    expect(sql).not.toContain("is_public");
    expect(note!.title).toBe("New Title");
  });

  it("generates a slug when enabling public sharing and no slug exists", () => {
    const afterUpdate = { ...baseRow, is_public: 1 as 1, public_slug: "generated" };
    mockGet.mockReturnValueOnce(baseRow).mockReturnValueOnce(afterUpdate);

    updateNote("user-1", "note-1", { isPublic: true });

    const params = mockRun.mock.calls[0][1] as Record<string, unknown>;
    expect(params.isPublic).toBe(1);
    expect(typeof params.publicSlug).toBe("string");
    expect((params.publicSlug as string).length).toBeGreaterThan(0);
  });

  it("preserves an existing slug when re-enabling public sharing", () => {
    const withSlug = { ...baseRow, is_public: 0 as 0, public_slug: "keep-me" };
    const afterUpdate = { ...withSlug, is_public: 1 as 1 };
    mockGet.mockReturnValueOnce(withSlug).mockReturnValueOnce(afterUpdate);

    updateNote("user-1", "note-1", { isPublic: true });

    const params = mockRun.mock.calls[0][1] as Record<string, unknown>;
    expect(params.publicSlug).toBe("keep-me");
  });

  it("clears the slug and sets is_public = 0 when disabling sharing", () => {
    const publicRow = { ...baseRow, is_public: 1 as 1, public_slug: "old-slug" };
    mockGet.mockReturnValueOnce(publicRow).mockReturnValueOnce(baseRow);

    updateNote("user-1", "note-1", { isPublic: false });

    const params = mockRun.mock.calls[0][1] as Record<string, unknown>;
    expect(params.isPublic).toBe(0);
    expect(params.publicSlug).toBeNull();
  });
});

// ── deleteNote ───────────────────────────────────────────────────────────────

describe("deleteNote", () => {
  it("calls run with a DELETE statement scoped to the user", () => {
    deleteNote("user-1", "note-1");

    expect(mockRun).toHaveBeenCalledOnce();
    const [sql, params] = mockRun.mock.calls[0];
    expect(sql).toContain("DELETE");
    expect(params).toMatchObject({ noteId: "note-1", userId: "user-1" });
  });
});

// ── getNoteBySlug ─────────────────────────────────────────────────────────────

describe("getNoteBySlug", () => {
  it("returns null when no note matches the slug", () => {
    mockGet.mockReturnValueOnce(undefined);

    const note = getNoteBySlug("nonexistent");

    expect(note).toBeNull();
  });

  it("returns the note when found by public slug", () => {
    const publicRow = { ...baseRow, is_public: 1 as 1, public_slug: "abc123" };
    mockGet.mockReturnValueOnce(publicRow);

    const note = getNoteBySlug("abc123");

    expect(note).not.toBeNull();
    expect(note!.publicSlug).toBe("abc123");
    expect(note!.isPublic).toBe(true);
  });

  it("queries with is_public = 1 to only surface public notes", () => {
    mockGet.mockReturnValueOnce(undefined);

    getNoteBySlug("some-slug");

    const [sql] = mockGet.mock.calls[0];
    expect(sql).toContain("is_public = 1");
  });

  it("passes the slug as a query param", () => {
    mockGet.mockReturnValueOnce(undefined);

    getNoteBySlug("my-slug");

    expect(mockGet).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ slug: "my-slug" })
    );
  });
});
