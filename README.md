# NextNotes

> A distraction-free writing app for people who think in words.

**Live demo:** https://notes-eta-two-88.vercel.app/

NextNotes is my personal pet project — a full-stack notes application where you can write rich-text notes, keep them private, and share the ones that deserve an audience. No bloat, no clutter, just you and your ideas.

---

## What it does

- **Rich text editor** powered by [TipTap](https://tiptap.dev) — bold, italic, headings (H1–H3), bullet lists, inline code, code blocks, and horizontal rules. A full formatting toolbar that stays out of your way until you need it.
- **Instant public sharing** — toggle a switch on any note to generate a unique, unguessable public URL. Anyone with the link can read it (no account needed). Toggle it off and the link goes dark immediately.
- **Private by default** — every note is locked to your account. No note can be accessed, guessed, or enumerated by another user.
- **Clean landing page** that explains the app and gets you to your dashboard in one click.

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) — App Router |
| Runtime | [Bun](https://bun.sh) |
| Language | TypeScript (strict mode) |
| Styling | [TailwindCSS v4](https://tailwindcss.com) |
| Database | SQLite via [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) (raw SQL, no ORM) |
| Auth | [better-auth](https://better-auth.com) (email + password) |
| Editor | [TipTap](https://tiptap.dev) with StarterKit |
| Validation | [Zod](https://zod.dev) |
| Testing | [Vitest](https://vitest.dev) + [React Testing Library](https://testing-library.com) |

---

## Getting started

### 1. Install dependencies

```bash
bun install
```

### 2. Configure environment variables

Copy the example and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `BETTER_AUTH_SECRET` | A random string of 32+ characters |
| `DB_PATH` | Path to the SQLite file (default: `data/app.db`) |

### 3. Run the dev server

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Running tests

Tests use Vitest (not Bun's native runner), so run them via:

```bash
bun run test          # single run
bun run test:watch    # watch mode
```

The suite covers:
- **Unit tests** — all note repository functions (`lib/notes.ts`) with mocked DB
- **API route tests** — `POST /api/notes`, `PUT /api/notes/:id`, `DELETE /api/notes/:id` with mocked auth and DB
- **Component tests** — `ShareToggle` and `DeleteNoteButton` with mocked `fetch` and `next/navigation`

---

## Project structure

```
app/
  page.tsx              # Landing page
  authenticate/         # Sign in / sign up
  dashboard/            # Note list (authenticated)
  notes/[id]/           # Note editor (authenticated)
  p/[slug]/             # Public note viewer
  api/notes/            # REST API for CRUD

components/
  LandingCTA.tsx        # Auth-aware hero button
  NoteEditor.tsx        # TipTap rich-text editor
  ShareToggle.tsx       # Public sharing toggle
  DeleteNoteButton.tsx  # Delete with confirmation dialog

lib/
  db.ts                 # SQLite client + query helpers
  notes.ts              # Note repository functions
  auth.ts               # better-auth server config
  auth-client.ts        # better-auth client

tests/
  lib/notes.test.ts
  api/notes-post.test.ts
  api/notes-id.test.ts
  components/ShareToggle.test.tsx
  components/DeleteNoteButton.test.tsx
```

---

## Why I built this

I wanted a notes app that felt like a blank piece of paper — fast to open, easy to write in, and completely in my control. Most note apps are either too simple (plain textarea) or too complex (Notion-style everything). NextNotes sits in the middle: a real editor with just the formatting I actually use, a proper backend I understand end-to-end, and sharing that works without friction.

It's also a playground for the stack I enjoy building with: Next.js App Router, Bun, SQLite, and TipTap. Everything is intentionally straightforward — raw SQL instead of an ORM, minimal abstractions, and a single SQLite file for the entire database.

---

## License

MIT
