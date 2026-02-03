import { drizzle } from "drizzle-orm/node-postgres";
import { missionItems } from "./schema";
import { Pool } from "pg";

let pool: Pool | null = null;
let db: ReturnType<typeof drizzle> | null = null;

function getPool(): Pool {
  if (!pool) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    pool = new Pool({
      connectionString: databaseUrl,
    });
  }
  return pool;
}

export function getDb() {
  if (!db) {
    db = drizzle(getPool());
  }
  return db;
}

export { missionItems };
