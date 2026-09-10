import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
  __arenaNextJsDb?: NodePgDatabase;
};

function getPool(): Pool {
  if (!globalForDb.__arenaNextJsPostgresqlPool) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error(
        "DATABASE_URL is required. Set it in your environment variables.",
      );
    }
    globalForDb.__arenaNextJsPostgresqlPool = new Pool({
      connectionString: databaseUrl,
    });
  }
  return globalForDb.__arenaNextJsPostgresqlPool;
}

function getDb(): NodePgDatabase {
  if (!globalForDb.__arenaNextJsDb) {
    globalForDb.__arenaNextJsDb = drizzle(getPool());
  }
  return globalForDb.__arenaNextJsDb;
}

export const pool = new Proxy({} as Pool, {
  get(_, prop) {
    return Reflect.get(getPool(), prop);
  },
});

export const db = new Proxy({} as NodePgDatabase, {
  get(_, prop) {
    return Reflect.get(getDb(), prop);
  },
});
