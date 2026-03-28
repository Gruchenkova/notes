import { vi, describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ShareToggle from "@/components/ShareToggle";

beforeEach(() => {
  vi.resetAllMocks();
  global.fetch = vi.fn() as unknown as typeof fetch;
});

describe("ShareToggle", () => {
  describe("initial render — private note", () => {
    it("shows that only the owner can see the note", () => {
      render(
        <ShareToggle noteId="n1" initialIsPublic={false} initialSlug={null} />
      );

      expect(
        screen.getByText("Only you can see this note.")
      ).toBeInTheDocument();
    });

    it("renders the toggle in an off state", () => {
      render(
        <ShareToggle noteId="n1" initialIsPublic={false} initialSlug={null} />
      );

      const toggle = screen.getByRole("button", {
        name: /enable public sharing/i,
      });
      expect(toggle).toHaveAttribute("aria-pressed", "false");
    });

    it("does not show a public URL input", () => {
      render(
        <ShareToggle noteId="n1" initialIsPublic={false} initialSlug={null} />
      );

      expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    });
  });

  describe("initial render — public note with slug", () => {
    it("shows that anyone with the link can view the note", () => {
      render(
        <ShareToggle noteId="n1" initialIsPublic={true} initialSlug="slug123" />
      );

      expect(
        screen.getByText("Anyone with the link can view this note.")
      ).toBeInTheDocument();
    });

    it("shows the public URL", () => {
      render(
        <ShareToggle noteId="n1" initialIsPublic={true} initialSlug="slug123" />
      );

      const urlInput = screen.getByRole("textbox");
      expect(urlInput).toHaveValue("http://localhost/p/slug123");
    });

    it("shows a Copy button", () => {
      render(
        <ShareToggle noteId="n1" initialIsPublic={true} initialSlug="slug123" />
      );

      expect(screen.getByRole("button", { name: /copy/i })).toBeInTheDocument();
    });
  });

  describe("toggling sharing on", () => {
    it("calls PUT /api/notes/:id with isPublic: true", async () => {
      const user = userEvent.setup();
      vi.mocked(fetch).mockResolvedValue(
        new Response(
          JSON.stringify({ isPublic: true, publicSlug: "new-slug" }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        )
      );

      render(
        <ShareToggle noteId="note-42" initialIsPublic={false} initialSlug={null} />
      );

      await user.click(
        screen.getByRole("button", { name: /enable public sharing/i })
      );

      expect(fetch).toHaveBeenCalledWith("/api/notes/note-42", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: true }),
      });
    });

    it("reveals the public URL after a successful toggle", async () => {
      const user = userEvent.setup();
      vi.mocked(fetch).mockResolvedValue(
        new Response(
          JSON.stringify({ isPublic: true, publicSlug: "new-slug" }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        )
      );

      render(
        <ShareToggle noteId="n1" initialIsPublic={false} initialSlug={null} />
      );

      await user.click(
        screen.getByRole("button", { name: /enable public sharing/i })
      );

      await waitFor(() => {
        expect(screen.getByRole("textbox")).toHaveValue(
          "http://localhost/p/new-slug"
        );
      });
    });
  });

  describe("toggling sharing off", () => {
    it("calls PUT /api/notes/:id with isPublic: false", async () => {
      const user = userEvent.setup();
      vi.mocked(fetch).mockResolvedValue(
        new Response(
          JSON.stringify({ isPublic: false, publicSlug: null }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        )
      );

      render(
        <ShareToggle noteId="note-42" initialIsPublic={true} initialSlug="s1" />
      );

      await user.click(
        screen.getByRole("button", { name: /disable public sharing/i })
      );

      expect(fetch).toHaveBeenCalledWith(
        "/api/notes/note-42",
        expect.objectContaining({ body: JSON.stringify({ isPublic: false }) })
      );
    });

    it("hides the URL after disabling sharing", async () => {
      const user = userEvent.setup();
      vi.mocked(fetch).mockResolvedValue(
        new Response(
          JSON.stringify({ isPublic: false, publicSlug: null }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        )
      );

      render(
        <ShareToggle noteId="n1" initialIsPublic={true} initialSlug="s1" />
      );

      await user.click(
        screen.getByRole("button", { name: /disable public sharing/i })
      );

      await waitFor(() => {
        expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
      });
    });
  });

  describe("copy to clipboard", () => {
    it("copies the displayed URL and shows Copied! feedback", async () => {
      const user = userEvent.setup();

      render(
        <ShareToggle noteId="n1" initialIsPublic={true} initialSlug="slug-abc" />
      );

      // The input shows the URL that will be written to clipboard
      expect(screen.getByRole("textbox")).toHaveValue(
        "http://localhost/p/slug-abc"
      );

      await user.click(screen.getByRole("button", { name: /copy/i }));

      // setCopied(true) is only called after a successful navigator.clipboard.writeText —
      // so "Copied!" appearing confirms that writeText was called successfully.
      expect(await screen.findByText("Copied!")).toBeInTheDocument();
    });
  });
});
