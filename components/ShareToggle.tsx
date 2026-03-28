"use client";

import { useState } from "react";

interface ShareToggleProps {
  noteId: string;
  initialIsPublic: boolean;
  initialSlug: string | null;
}

export default function ShareToggle({ noteId, initialIsPublic, initialSlug }: ShareToggleProps) {
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [slug, setSlug] = useState<string | null>(initialSlug);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const publicUrl = slug
    ? `${window.location.origin}/p/${slug}`
    : null;

  async function handleToggle() {
    setLoading(true);
    try {
      const res = await fetch(`/api/notes/${noteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: !isPublic }),
      });
      if (!res.ok) return;
      const updated = await res.json();
      setIsPublic(updated.isPublic);
      setSlug(updated.publicSlug ?? null);
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!publicUrl) return;
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-800">Public sharing</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {isPublic ? "Anyone with the link can view this note." : "Only you can see this note."}
          </p>
        </div>

        <button
          type="button"
          onClick={handleToggle}
          disabled={loading}
          aria-pressed={isPublic}
          aria-label={isPublic ? "Disable public sharing" : "Enable public sharing"}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
            isPublic ? "bg-indigo-600" : "bg-gray-300"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 ${
              isPublic ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {isPublic && publicUrl && (
        <div className="mt-3 flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={publicUrl}
            className="flex-1 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 truncate"
          />
          <button
            type="button"
            onClick={handleCopy}
            className="shrink-0 px-3 py-1.5 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      )}
    </div>
  );
}
