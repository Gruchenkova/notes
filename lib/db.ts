import Database from "better-sqlite3";
import { mkdirSync, existsSync } from "node:fs";
import { dirname } from "node:path";

const DB_PATH = process.env.DB_PATH ?? "data/app.db";

const dir = dirname(DB_PATH);
if (!existsSync(dir)) {
  mkdirSync(dir, { recursive: true });
}

const db = new Database(DB_PATH);

// Enable WAL mode immediately after opening for better concurrent read performance
db.pragma("journal_mode = WAL");

// Create all required tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS user (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    emailVerified INTEGER NOT NULL DEFAULT 0,
    image TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS session (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expiresAt TEXT NOT NULL,
    ipAddress TEXT,
    userAgent TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (userId) REFERENCES user(id)
  );

  CREATE TABLE IF NOT EXISTS account (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    accountId TEXT NOT NULL,
    providerId TEXT NOT NULL,
    accessToken TEXT,
    refreshToken TEXT,
    accessTokenExpiresAt TEXT,
    refreshTokenExpiresAt TEXT,
    scope TEXT,
    idToken TEXT,
    password TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (userId) REFERENCES user(id)
  );

  CREATE TABLE IF NOT EXISTS verification (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    expiresAt TEXT NOT NULL,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content_json TEXT NOT NULL,
    is_public INTEGER NOT NULL DEFAULT 0,
    public_slug TEXT UNIQUE,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES user(id)
  );

  CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
  CREATE INDEX IF NOT EXISTS idx_notes_public_slug ON notes(public_slug);
  CREATE INDEX IF NOT EXISTS idx_notes_is_public ON notes(is_public);
`);

export function getDb() {
  return db;
}

/**
 * Execute a SELECT that returns multiple rows.
 * SQL placeholders use $ prefix ($userId), but object keys must NOT include it:
 *   query("SELECT * FROM notes WHERE user_id = $userId", { userId: id })
 */
export function query<T>(
  sql: string,
  params?: Record<string, unknown>
): T[] {
  return db.prepare(sql).all(params ?? {}) as T[];
}

/**
 * Execute a SELECT that returns a single row (or undefined).
 * SQL placeholders use $ prefix ($id), but object keys must NOT include it:
 *   get("SELECT * FROM notes WHERE id = $id", { id: noteId })
 */
export function get<T>(
  sql: string,
  params?: Record<string, unknown>
): T | undefined {
  return (db.prepare(sql).get(params ?? {}) as T) ?? undefined;
}

/**
 * Execute a statement that returns no rows (INSERT, UPDATE, DELETE, DDL).
 * SQL placeholders use $ prefix ($id), but object keys must NOT include it:
 *   run("DELETE FROM notes WHERE id = $id", { id: noteId })
 */
export function run(
  sql: string,
  params?: Record<string, unknown>
): void {
  db.prepare(sql).run(params ?? {});
}

export default db;
