"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import NoteEditor from "./NoteEditor";

interface EditNoteFormProps {
  noteId: string;
  initialTitle: string;
  initialContent: object;
}

export default function EditNoteForm({ noteId, initialTitle, initialContent }: EditNoteFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [contentJson, setContentJson] = useState<object>(initialContent);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/notes/${noteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          contentJson: JSON.stringify(contentJson),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "Failed to save note");
      }

      router.push(`/notes/${noteId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div>
        <label
          htmlFor="note-title"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          Title <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <input
          id="note-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Give your note a title…"
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Content
        </label>
        <NoteEditor onChange={setContentJson} initialContent={initialContent} />
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isSubmitting || !title.trim()}
          className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? "Saving…" : "Save Changes"}
        </button>
        <a
          href={`/notes/${noteId}`}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
