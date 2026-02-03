import { drizzle } from "drizzle-orm/node-postgres";
import { missionItems } from "./schema";
import { Pool } from "pg";

let pool: Pool | null = null;
let db: ReturnType<typeof drizzle> | null = null;

function getPool(): Pool {
  if (!pool) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      // Return a dummy pool for build time (when DATABASE_URL is not set)
      pool = new Pool({
        connectionString: "postgres://localhost:5432/buildtime",
      });
    } else {
      pool = new Pool({
        connectionString: databaseUrl,
      });
    }
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
