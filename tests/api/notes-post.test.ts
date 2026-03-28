import { vi, describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// next/headers is a server-only API — replace with a stub
vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

// Prevent real auth (which imports db) from loading
vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

// Isolate from the real DB layer
vi.mock("@/lib/notes", () => ({
  createNote: vi.fn(),
}));

import { POST } from "@/app/api/notes/route";
import { auth } from "@/lib/auth";
import { createNote } from "@/lib/notes";

const mockGetSession = vi.mocked(auth.api.getSession);
const mockCreateNote = vi.mocked(createNote);

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe("POST /api/notes", () => {
  it("returns 401 when the request is unauthenticated", async () => {
    mockGetSession.mockResolvedValue(null);

    const res = await POST(makeRequest({ title: "T", contentJson: "{}" }));

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("returns 400 when the request body is not valid JSON", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-1" } } as never);

    const req = new NextRequest("http://localhost/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json",
    });

    const res = await POST(req);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Invalid JSON");
  });

  it("returns 400 when required fields are missing", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-1" } } as never);

    // title is required (min length 1)
    const res = await POST(makeRequest({ contentJson: "{}" }));

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it("returns 400 when title is an empty string", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-1" } } as never);

    const res = await POST(makeRequest({ title: "", contentJson: "{}" }));

    expect(res.status).toBe(400);
  });

  it("creates the note and returns 201 with the note id", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockCreateNote.mockReturnValue({
      id: "new-note",
      userId: "user-1",
      title: "My Note",
      contentJson: "{}",
      isPublic: false,
      publicSlug: null,
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    });

    const res = await POST(
      makeRequest({ title: "My Note", contentJson: '{"type":"doc"}' })
    );

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.id).toBe("new-note");
  });

  it("passes the authenticated user id to createNote", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-42" } } as never);
    mockCreateNote.mockReturnValue({
      id: "n1",
      userId: "user-42",
      title: "T",
      contentJson: "{}",
      isPublic: false,
      publicSlug: null,
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    });

    await POST(makeRequest({ title: "T", contentJson: "{}" }));

    expect(mockCreateNote).toHaveBeenCalledWith(
      "user-42",
      expect.any(String),
      expect.any(String)
    );
  });
});
