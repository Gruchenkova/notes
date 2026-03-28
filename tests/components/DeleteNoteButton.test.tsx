import { vi, describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// useRouter must be mocked before importing the component
const mockPush = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

import DeleteNoteButton from "@/components/DeleteNoteButton";

// jsdom doesn't implement HTMLDialogElement.showModal / close
beforeEach(() => {
  vi.resetAllMocks();
  HTMLDialogElement.prototype.showModal = vi.fn(function (
    this: HTMLDialogElement
  ) {
    this.setAttribute("open", "");
  });
  HTMLDialogElement.prototype.close = vi.fn(function (
    this: HTMLDialogElement
  ) {
    this.removeAttribute("open");
  });
  global.fetch = vi.fn() as unknown as typeof fetch;
});

describe("DeleteNoteButton", () => {
  describe("initial render", () => {
    it("shows a Delete button", () => {
      render(<DeleteNoteButton noteId="note-1" />);

      expect(
        screen.getByRole("button", { name: /delete/i })
      ).toBeInTheDocument();
    });

    it("does not show the confirmation dialog initially", () => {
      render(<DeleteNoteButton noteId="note-1" />);

      // <dialog> children are always in the DOM; check the open attribute instead
      const dialog = screen.getByRole("dialog", { hidden: true });
      expect(dialog).not.toHaveAttribute("open");
    });
  });

  describe("opening the confirmation dialog", () => {
    it("opens the dialog when the Delete button is clicked", async () => {
      const user = userEvent.setup();
      render(<DeleteNoteButton noteId="note-1" />);

      await user.click(screen.getByRole("button", { name: /^delete$/i }));

      expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
    });

    it("shows confirmation text inside the dialog", async () => {
      const user = userEvent.setup();
      render(<DeleteNoteButton noteId="note-1" />);

      await user.click(screen.getByRole("button", { name: /^delete$/i }));

      expect(
        screen.getByText(/this action cannot be undone/i)
      ).toBeInTheDocument();
    });

    it("shows Cancel and confirm Delete buttons inside the dialog", async () => {
      const user = userEvent.setup();
      render(<DeleteNoteButton noteId="note-1" />);

      await user.click(screen.getByRole("button", { name: /^delete$/i }));

      expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
      // There should now be two Delete buttons: the trigger and the confirm button
      const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
      expect(deleteButtons.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("cancelling the dialog", () => {
    it("closes the dialog when Cancel is clicked", async () => {
      const user = userEvent.setup();
      render(<DeleteNoteButton noteId="note-1" />);

      await user.click(screen.getByRole("button", { name: /^delete$/i }));
      await user.click(screen.getByRole("button", { name: /cancel/i }));

      expect(HTMLDialogElement.prototype.close).toHaveBeenCalled();
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe("confirming deletion", () => {
    it("calls DELETE /api/notes/:id", async () => {
      const user = userEvent.setup();
      vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 204 }));

      render(<DeleteNoteButton noteId="note-42" />);

      await user.click(screen.getByRole("button", { name: /^delete$/i }));

      // Click the confirm button inside the dialog (last Delete button)
      const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
      await user.click(deleteButtons[deleteButtons.length - 1]);

      expect(fetch).toHaveBeenCalledWith("/api/notes/note-42", {
        method: "DELETE",
      });
    });

    it("navigates to /dashboard after a successful delete", async () => {
      const user = userEvent.setup();
      vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 204 }));

      render(<DeleteNoteButton noteId="note-1" />);

      await user.click(screen.getByRole("button", { name: /^delete$/i }));
      const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
      await user.click(deleteButtons[deleteButtons.length - 1]);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/dashboard");
      });
    });

    it("does not navigate when the API call fails", async () => {
      const user = userEvent.setup();
      vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 500 }));

      render(<DeleteNoteButton noteId="note-1" />);

      await user.click(screen.getByRole("button", { name: /^delete$/i }));
      const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
      await user.click(deleteButtons[deleteButtons.length - 1]);

      await waitFor(() => {
        expect(mockPush).not.toHaveBeenCalled();
      });
    });
  });
});
