import { notFound } from "next/navigation";
import { getNoteBySlug } from "@/lib/notes";
import NoteRenderer, { type TipTapNode } from "@/components/NoteRenderer";

interface PublicNotePageProps {
  params: Promise<{ slug: string }>;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function PublicNotePage({ params }: PublicNotePageProps) {
  const { slug } = await params;

  const note = await getNoteBySlug(slug);
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
        <div className="mb-4 flex items-center justify-end">
          <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
            Read-only
          </span>
        </div>

        <article className="bg-white rounded-xl border border-gray-200 shadow-sm px-8 py-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3 leading-tight">
            {note.title}
          </h1>

          <div className="mb-8 pb-6 border-b border-gray-100">
            <span className="text-sm text-gray-400">
              Updated {formatDate(note.updatedAt)}
            </span>
          </div>

          <NoteRenderer doc={doc} />
        </article>
      </div>
    </div>
  );
}
