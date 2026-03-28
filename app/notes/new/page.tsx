import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import NewNoteForm from "@/components/NewNoteForm";

export default async function NewNotePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/authenticate");

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">New Note</h1>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <NewNoteForm />
        </div>
      </div>
    </main>
  );
}
