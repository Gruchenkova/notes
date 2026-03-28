import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getNoteById } from "@/lib/notes";
import EditNoteForm from "@/components/EditNoteForm";

interface EditNotePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditNotePage({ params }: EditNotePageProps) {
  const [{ id }, resolvedHeaders] = await Promise.all([params, headers()]);
  const session = await auth.api.getSession({ headers: resolvedHeaders });
  if (!session) redirect("/authenticate");

  const note = await getNoteById(session.user.id, id);
  if (!note) notFound();

  let initialContent: object;
  try {
    initialContent = JSON.parse(note.contentJson) as object;
  } catch {
    initialContent = { type: "doc", content: [] };
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Note</h1>
          <Link
            href={`/notes/${id}`}
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
            Back to note
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <EditNoteForm
            noteId={id}
            initialTitle={note.title}
            initialContent={initialContent}
          />
        </div>
      </div>
    </main>
  );
}
