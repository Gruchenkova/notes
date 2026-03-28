import { vi, describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock("@/lib/notes", () => ({
  getNoteById: vi.fn(),
  updateNote: vi.fn(),
  deleteNote: vi.fn(),
}));

import { PUT, DELETE } from "@/app/api/notes/[id]/route";
import { auth } from "@/lib/auth";
import { getNoteById, updateNote, deleteNote } from "@/lib/notes";

const mockGetSession = vi.mocked(auth.api.getSession);
const mockGetNoteById = vi.mocked(getNoteById);
const mockUpdateNote = vi.mocked(updateNote);
const mockDeleteNote = vi.mocked(deleteNote);

const fakeNote = {
  id: "note-1",
  userId: "user-1",
  title: "Existing Note",
  contentJson: '{"type":"doc","content":[]}',
  isPublic: false,
  publicSlug: null,
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
};

function makeRouteContext(id: string) {
  return { params: Promise.resolve({ id }) };
}

function makePutRequest(body: unknown) {
  return new NextRequest("http://localhost/api/notes/note-1", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function makeDeleteRequest() {
  return new NextRequest("http://localhost/api/notes/note-1", {
    method: "DELETE",
  });
}

beforeEach(() => {
  vi.resetAllMocks();
});

// ── PUT /api/notes/:id ───────────────────────────────────────────────────────

describe("PUT /api/notes/:id", () => {
  it("returns 401 when unauthenticated", async () => {
    mockGetSession.mockResolvedValue(null);

    const res = await PUT(makePutRequest({ title: "New" }), makeRouteContext("note-1"));

    expect(res.status).toBe(401);
  });

  it("returns 400 for malformed JSON", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-1" } } as never);

    const req = new NextRequest("http://localhost/api/notes/note-1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: "bad-json",
    });

    const res = await PUT(req, makeRouteContext("note-1"));

    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid field types", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-1" } } as never);

    // isPublic must be boolean, not a string
    const res = await PUT(
      makePutRequest({ isPublic: "yes" }),
      makeRouteContext("note-1")
    );

    expect(res.status).toBe(400);
  });

  it("returns 404 when the note does not exist", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockUpdateNote.mockReturnValue(null);

    const res = await PUT(
      makePutRequest({ title: "New Title" }),
      makeRouteContext("note-1")
    );

    expect(res.status).toBe(404);
  });

  it("returns 200 with the updated note", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockUpdateNote.mockReturnValue({ ...fakeNote, title: "Updated" });

    const res = await PUT(
      makePutRequest({ title: "Updated" }),
      makeRouteContext("note-1")
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.title).toBe("Updated");
  });

  it("passes the authenticated user id and note id to updateNote", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-99" } } as never);
    mockUpdateNote.mockReturnValue({ ...fakeNote, userId: "user-99" });

    await PUT(makePutRequest({ title: "T" }), makeRouteContext("note-abc"));

    expect(mockUpdateNote).toHaveBeenCalledWith(
      "user-99",
      "note-abc",
      expect.any(Object)
    );
  });

  it("allows toggling isPublic via the update endpoint", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockUpdateNote.mockReturnValue({
      ...fakeNote,
      isPublic: true,
      publicSlug: "slug-abc",
    });

    const res = await PUT(
      makePutRequest({ isPublic: true }),
      makeRouteContext("note-1")
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.isPublic).toBe(true);
    expect(body.publicSlug).toBe("slug-abc");
  });
});

// ── DELETE /api/notes/:id ────────────────────────────────────────────────────

describe("DELETE /api/notes/:id", () => {
  it("returns 401 when unauthenticated", async () => {
    mockGetSession.mockResolvedValue(null);

    const res = await DELETE(makeDeleteRequest(), makeRouteContext("note-1"));

    expect(res.status).toBe(401);
  });

  it("returns 404 when the note does not exist", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockGetNoteById.mockReturnValue(null);

    const res = await DELETE(makeDeleteRequest(), makeRouteContext("note-1"));

    expect(res.status).toBe(404);
    expect(mockDeleteNote).not.toHaveBeenCalled();
  });

  it("deletes the note and returns 204", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockGetNoteById.mockReturnValue(fakeNote);
    mockDeleteNote.mockReturnValue(undefined);

    const res = await DELETE(makeDeleteRequest(), makeRouteContext("note-1"));

    expect(res.status).toBe(204);
    expect(mockDeleteNote).toHaveBeenCalledWith("user-1", "note-1");
  });

  it("scopes the lookup to the authenticated user", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-42" } } as never);
    mockGetNoteById.mockReturnValue(null);

    await DELETE(makeDeleteRequest(), makeRouteContext("some-note"));

    expect(mockGetNoteById).toHaveBeenCalledWith("user-42", "some-note");
  });
});
