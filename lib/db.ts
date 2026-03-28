import { Pool, neon } from "@neondatabase/serverless";

const connectionString = process.env.DATABASE_URL!;

// pg-compatible Pool for better-auth
export const pool = new Pool({ connectionString });

// Tagged-template SQL client for direct queries
export const sql = neon(connectionString);
