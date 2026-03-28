import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getNoteById } from "@/lib/notes";
import NoteRenderer, { type TipTapNode } from "@/components/NoteRenderer";
import DeleteNoteButton from "@/components/DeleteNoteButton";
import ShareToggle from "@/components/ShareToggle";

interface NoteViewPageProps {
  params: Promise<{ id: string }>;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function NoteViewPage({ params }: NoteViewPageProps) {
  const [{ id }, resolvedHeaders] = await Promise.all([params, headers()]);
  const session = await auth.api.getSession({ headers: resolvedHeaders });
  if (!session) redirect("/authenticate");

  const note = await getNoteById(session.user.id, id);
  if (!note) notFound();

  let doc: TipTapNode;
  try {
    doc = JSON.parse(note.contentJson) as TipTapNode;
  } catch {
    doc = { type: "doc", content: [] };
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-6">
        {/* Top bar: back link + actions */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to notes
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href={`/notes/${id}/edit`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </Link>
            <DeleteNoteButton noteId={id} />
          </div>
        </div>

        <article className="bg-white rounded-xl border border-gray-200 shadow-sm px-8 py-10">
          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-900 mb-3 leading-tight">
            {note.title}
          </h1>

          {/* Meta row */}
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100">
            <span className="text-sm text-gray-400">
              Updated {formatDate(note.updatedAt)}
            </span>
            {note.isPublic && (
              <>
                <span className="text-gray-200" aria-hidden="true">·</span>
                <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                  Public
                </span>
              </>
            )}
          </div>

          {/* Rendered content */}
          <NoteRenderer doc={doc} />

          {/* Public sharing */}
          <ShareToggle
            noteId={id}
            initialIsPublic={note.isPublic}
            initialSlug={note.publicSlug}
          />
        </article>
      </div>
    </div>
  );
}
