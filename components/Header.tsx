"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();

  async function handleLogout() {
    await authClient.signOut();
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          href={session ? "/dashboard" : "/"}
          className="text-xl font-bold text-indigo-600 hover:text-indigo-700 tracking-tight transition-colors"
        >
          NextNotes
        </Link>

        {pathname === "/" && !session && !isPending && (
          <nav className="flex items-center gap-2">
            <Link
              href="/authenticate"
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/authenticate"
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm shadow-indigo-200"
            >
              Sign up
            </Link>
          </nav>
        )}

        {pathname !== "/" && session && (
          <button
            type="button"
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          >
            Log out
          </button>
        )}
      </div>
    </header>
  );
}
