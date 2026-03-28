"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export default function LandingCTA() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="flex items-center justify-center gap-3">
        <div className="h-12 w-48 rounded-xl bg-gray-200 animate-pulse" />
        <div className="h-12 w-24 rounded-xl bg-gray-100 animate-pulse" />
      </div>
    );
  }

  if (session) {
    return (
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 px-8 py-3.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
      >
        Go to your notes
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
            d="M17 8l4 4m0 0l-4 4m4-4H3"
          />
        </svg>
      </Link>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3">
      <Link
        href="/authenticate"
        className="inline-flex items-center gap-2 px-8 py-3.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
      >
        Start writing — it&apos;s free
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
            d="M17 8l4 4m0 0l-4 4m4-4H3"
          />
        </svg>
      </Link>
      <Link
        href="/authenticate"
        className="px-6 py-3.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
      >
        Sign in
      </Link>
    </div>
  );
}
