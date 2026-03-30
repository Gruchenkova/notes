import LandingCTA from "@/components/LandingCTA";

const features = [
  {
    title: "Rich text, zero friction",
    description:
      "Bold, italics, headings, bullet lists, inline code, code blocks, horizontal rules — a full formatting toolbar that stays out of your way until you need it.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
        aria-hidden="true"
      >
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
  },
  {
    title: "Share with a single link",
    description:
      "Toggle public sharing on any note to get a unique, unguessable URL. Anyone with the link can read it — no account required. Turn it off and the link goes dark instantly.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
        aria-hidden="true"
      >
        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
      </svg>
    ),
  },
  {
    title: "Private by default",
    description:
      "Every note is yours alone until you decide otherwise. Your thoughts stay locked to your account, scoped by user — nobody can see or guess their way to your content.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
        aria-hidden="true"
      >
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
      </svg>
    ),
  },
];

export default function HomePage() {
  return (
    <main>
      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white">
        {/* Decorative gradient blob */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 flex justify-center"
        >
          <div className="h-[500px] w-[900px] rounded-full bg-gradient-to-b from-indigo-50 via-violet-50 to-transparent opacity-70 blur-3xl" />
        </div>

        {/* Subtle dot grid */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            backgroundImage:
              "radial-gradient(circle, #c7d2fe 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            opacity: 0.35,
          }}
        />

        <div className="mx-auto max-w-3xl px-6 pt-24 pb-28 text-center">
          {/* Pill badge */}
          <span className="mb-7 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-xs font-semibold tracking-wide text-indigo-700 ring-1 ring-indigo-200">
            <span
              className="h-1.5 w-1.5 rounded-full bg-indigo-500"
              aria-hidden="true"
            />
            Free · No credit card needed · Open to all
          </span>

          <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
            Your thoughts,{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              beautifully written
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-gray-500">
            NextNotes is a distraction-free writing space for anyone who thinks in
            words. Capture ideas with a powerful rich-text editor, keep everything
            private, and share the notes that deserve an audience — all in one
            elegant place.
          </p>

          <LandingCTA />

          {/* Fake note mockup */}
          <div className="relative mx-auto mt-16 max-w-xl">
            {/* Shadow cards stacked behind */}
            <div
              aria-hidden="true"
              className="absolute inset-x-4 -bottom-3 h-full rounded-2xl border border-gray-100 bg-indigo-50/40 shadow-sm"
            />
            <div
              aria-hidden="true"
              className="absolute inset-x-8 -bottom-6 h-full rounded-2xl border border-gray-100 bg-violet-50/30 shadow-sm"
            />

            {/* Main card */}
            <div className="relative rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-xl">
              {/* Toolbar mockup */}
              <div className="mb-4 flex items-center gap-1 rounded-lg bg-gray-50 px-2 py-1.5">
                {[
                  { label: "B", extra: "font-bold" },
                  { label: "I", extra: "italic" },
                  { label: "U", extra: "underline" },
                  { label: "S", extra: "line-through" },
                ].map(({ label, extra }) => (
                  <span
                    key={label}
                    aria-hidden="true"
                    className={`flex h-6 w-6 items-center justify-center rounded text-xs font-bold text-gray-400 ${extra}`}
                  >
                    {label}
                  </span>
                ))}
                <span
                  aria-hidden="true"
                  className="mx-0.5 self-stretch w-px bg-gray-200"
                />
                {["H1", "H2", "H3"].map((label) => (
                  <span
                    key={label}
                    aria-hidden="true"
                    className="flex h-6 items-center rounded px-1 text-xs font-bold text-gray-400"
                  >
                    {label}
                  </span>
                ))}
                <span
                  aria-hidden="true"
                  className="mx-0.5 self-stretch w-px bg-gray-200"
                />
                <span
                  aria-hidden="true"
                  className="flex h-6 w-6 items-center justify-center rounded font-mono text-xs text-gray-400"
                >
                  {"<>"}
                </span>
                <span
                  aria-hidden="true"
                  className="flex h-6 w-6 items-center justify-center rounded text-gray-400"
                >
                  <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
                    <circle cx="2" cy="4.5" r="1.5" />
                    <rect x="5" y="3.75" width="9" height="1.5" rx="0.75" />
                    <circle cx="2" cy="8" r="1.5" />
                    <rect x="5" y="7.25" width="9" height="1.5" rx="0.75" />
                    <circle cx="2" cy="11.5" r="1.5" />
                    <rect x="5" y="10.75" width="9" height="1.5" rx="0.75" />
                  </svg>
                </span>
              </div>

              {/* Fake note content */}
              <h2
                aria-hidden="true"
                className="mb-2 text-xl font-bold text-gray-900"
              >
                Product launch checklist
              </h2>
              <p aria-hidden="true" className="mb-3 text-sm text-gray-600">
                Everything we need to nail the launch. Review before the{" "}
                <strong>all-hands meeting</strong> on Friday.
              </p>
              <ul
                aria-hidden="true"
                className="mb-3 space-y-1 text-sm text-gray-600"
              >
                {[
                  "Finalise landing page copy",
                  "QA the onboarding flow",
                  "Schedule social posts",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                    {item}
                  </li>
                ))}
              </ul>
              <span
                aria-hidden="true"
                className="inline-block rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-green-200"
              >
                Public link active
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────── */}
      <section className="relative border-t border-gray-100 bg-gray-50 py-24">
        {/* Fade from white at the top to smooth hero transition */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white to-transparent"
        />
        <div className="mx-auto max-w-5xl px-6">
          <p className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-indigo-600">
            Why NextNotes
          </p>
          <h2 className="mb-14 text-center text-3xl font-bold text-gray-900">
            Everything you need, nothing you don&apos;t
          </h2>

          <div className="grid gap-6 sm:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl bg-white p-7 shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-lg hover:ring-indigo-200 hover:-translate-y-0.5"
              >
                <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-violet-100 text-indigo-600">
                  {feature.icon}
                </div>
                <h3 className="mb-2 text-base font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-500">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-600 py-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -top-20 flex justify-center -z-10"
        >
          <div className="h-[400px] w-[700px] rounded-full bg-white opacity-5 blur-3xl" />
        </div>
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white">
            Ready to clear your head?
          </h2>
          <p className="mb-9 text-indigo-100">
            Sign up in seconds and start writing. Your first note is one click
            away.
          </p>
          <LandingCTA variant="inverted" />
        </div>
      </section>
    </main>
  );
}
