# CLAUDE.md

We are building the app described in @SPEC.md. Read that file for general architectural tasks or to bouble-check the exact database structure, tech stack or application architecture.

Whenever working with any third-party library or something similar, you MUST look up the official documentation to ensure that you are wotking up-to-date information.
Use the DocxExplorer subagent for efficient documentation lookup.

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Next.js notes application where authenticated users can create, view, edit, delete, and publicly share rich-text notes. Notes are created with TipTap, stored as JSON in SQLite, and rendered with formatting.

## Common Commands

```bash
# Development server (uses Bun runtime)
bun dev

# Build for production
bun run build

# Start production server
bun start

# Lint
bun run lint
```

## Tech Stack

- **Runtime**: Bun (NOT Node.js - use Bun-specific APIs where applicable)
- **Framework**: Next.js 16.1.1 with App Router
- **Language**: TypeScript with strict mode
- **Styling**: TailwindCSS v4
- **Database**: SQLite via Bun's built-in SQLite client (raw SQL queries)
- **Authentication**: better-auth
- **Rich Text Editor**: TipTap (with StarterKit, Code, CodeBlock extensions)
- **Validation**: Zod

## Architecture

### Application Layers

1. **Presentation Layer** (`app/` directory)
   - Next.js App Router pages and layouts
   - Server Components for data fetching
   - Client Components for interactive UI (TipTap editor, forms)
   - Route Handlers in `app/api/` for JSON APIs

2. **API Layer** (`app/api/` directory)
   - REST-like JSON endpoints for notes CRUD operations
   - Authentication enforcement via better-auth helpers
   - All authenticated endpoints must verify user session and scope queries by `user_id`

3. **Data Access Layer** (`lib/` directory)
   - `lib/db.ts`: Bun SQLite client initialization and query helpers
   - `lib/notes.ts`: Note repository functions with type-safe interfaces
   - All queries use raw SQL (no ORM)

### Path Aliases

- `@/*` maps to project root (configured in `tsconfig.json`)

### Environment Variables

Required environment variables (see `.env.example`):
- `BETTER_AUTH_SECRET`: Must be 32+ characters
- `DB_PATH`: SQLite database file path (default: `data/app.db`)

## Database Schema

### Core Tables

**Notes Table:**
```sql
CREATE TABLE notes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content_json TEXT NOT NULL,  -- Stringified TipTap JSON document
  is_public INTEGER NOT NULL DEFAULT 0,
  public_slug TEXT UNIQUE,     -- For public sharing (generate with nanoid)
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES user(id)
);
```

**better-auth Tables:**
- `user`: Authentication users
- `session`: Active sessions
- `account`: Provider accounts and credentials
- `verification`: Email verification tokens

Refer to SPEC.md section 5 for complete schema definitions.

## Key Patterns & Conventions

### Authentication

- Use better-auth server helpers (`getCurrentUser()` or `getSession()`)
- All `/api/notes/*` endpoints (except public reads) must return 401 if unauthenticated
- All note queries must filter by `user_id` to prevent cross-user access
- Public note access is via `/p/[slug]` route (read-only, no authentication required)

### Note Content Storage

- Notes content is stored as **TipTap JSON** (not HTML or Markdown)
- Always `JSON.stringify()` when saving to DB
- Always `JSON.parse()` when loading from DB
- Never use `dangerouslySetInnerHTML` - rely on TipTap's rendering

### TipTap Editor Configuration

Required extensions:
- StarterKit (paragraphs, headings 1-3, bold, italic, bullet lists, horizontal rule)
- Code (inline code)
- CodeBlock (code snippets)

Content should be controlled with `onUpdate` callback to capture changes.

### Public Note Sharing

- When `isPublic = true`: generate random slug using nanoid (16+ characters)
- When `isPublic = false`: set `public_slug = NULL` and `is_public = 0`
- Public URLs: `/p/[slug]` (404 if not found or not public)
- Slugs must be random enough to prevent guessing

### API Response Patterns

- List endpoints: May omit `contentJson` for performance
- Single note endpoints: Include full note with `contentJson`
- Error responses: Return appropriate HTTP status codes (401, 404, etc.)
- Success patterns: 200 (updated/retrieved), 201 (created), 204 (deleted)

## Development Notes

### Database Access

- Initialize DB connection once and reuse (singleton pattern)
- Use parameterized queries to prevent SQL injection
- Auto-update `updated_at` timestamp on note modifications
- Enforce user ownership via `user_id` in WHERE clauses

### Type Safety

Define TypeScript types for:
- Note model (matching DB schema with camelCase properties)
- API request/response payloads
- TipTap document structure
- better-auth session/user types

### Security Considerations

- All note operations scoped to authenticated user's `user_id`
- Public notes are read-only with no owner information exposed
- Validate all inputs with Zod schemas
- Use better-auth's built-in security features (session management, password hashing)

## Project Structure

```
app/
├── (auth)/              # Authentication routes (login, register)
├── api/
│   ├── notes/          # CRUD endpoints for notes
│   └── public-notes/   # Public note read endpoint
├── dashboard/          # Authenticated user dashboard (notes list)
├── notes/[id]/        # Note editor page (authenticated)
├── p/[slug]/          # Public note viewer (unauthenticated)
├── layout.tsx         # Root layout with global styles
└── page.tsx           # Landing page

lib/
├── db.ts              # SQLite client and query helpers
└── notes.ts           # Note repository functions

components/
├── NoteList.tsx       # List of user notes
├── NoteEditor.tsx     # TipTap editor component
├── ShareToggle.tsx    # Public sharing toggle
├── DeleteNoteButton.tsx
└── PublicNoteViewer.tsx
```

## Reference Documentation

- Full specification: See `SPEC.md` for detailed requirements and API design
- Next.js App Router: https://nextjs.org/docs/app
- TipTap: https://tiptap.dev/docs/editor/introduction
- better-auth: https://better-auth.com/docs
- Bun SQLite: https://bun.sh/docs/api/sqlite
