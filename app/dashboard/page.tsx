import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getNotesByUser } from "@/lib/notes";

function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/authenticate");

  const notes = await getNotesByUser(session.user.id);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-900">My Notes</h1>
          <Link
            href="/notes/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
          >
            <span aria-hidden="true">+</span> New Note
          </Link>
        </div>

        {notes.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg mb-4">No notes yet.</p>
            <Link
              href="/notes/new"
              className="text-indigo-600 hover:text-indigo-800 font-medium underline"
            >
              Create your first note
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <Link
                key={note.id}
                href={`/notes/${note.id}`}
                className="group flex items-center justify-between p-5 bg-white rounded-xl border border-gray-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all"
              >
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-700 truncate transition-colors">
                    {note.title}
                  </h2>
                  <p className="text-sm text-gray-400 mt-0.5">
                    Updated {formatDate(note.updatedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                  {note.isPublic && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                      Public
                    </span>
                  )}
                  <svg
                    className="w-5 h-5 text-gray-300 group-hover:text-indigo-400 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
