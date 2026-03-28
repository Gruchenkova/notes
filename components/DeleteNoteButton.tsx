"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface DeleteNoteButtonProps {
  noteId: string;
}

export default function DeleteNoteButton({ noteId }: DeleteNoteButtonProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  function openDialog() {
    dialogRef.current?.showModal();
  }

  function closeDialog() {
    dialogRef.current?.close();
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/notes/${noteId}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/dashboard");
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Delete
      </button>

      <dialog
        ref={dialogRef}
        className="rounded-xl border border-gray-200 shadow-xl p-6 w-full max-w-sm m-auto backdrop:bg-black/40"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Delete note?</h2>
        <p className="text-sm text-gray-500 mb-6">
          This action cannot be undone. The note will be permanently deleted.
        </p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={closeDialog}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-60"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </dialog>
    </>
  );
}
