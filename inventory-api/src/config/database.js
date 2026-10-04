import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../db/schema.js";

const databaseUrl = process.env.DATABASE_URL;
const requiredEnvironment = databaseUrl
  ? []
  : ["DATABASE_HOST", "DATABASE_NAME", "DATABASE_USER", "DATABASE_PASSWORD"];

const missingEnvironment = requiredEnvironment.filter((key) => !process.env[key]);
if (missingEnvironment.length > 0) {
  throw new Error(
    `Missing database settings: ${missingEnvironment.join(", ")}. Copy .env.example to .env and fill it in.`,
  );
}

const databaseOptions = databaseUrl
  ? { connectionString: databaseUrl }
  : {
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT || 5432),
      database: process.env.DATABASE_NAME,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
    };

// A hosted PostgreSQL provider may require TLS. If DATABASE_URL contains its
// own sslmode setting, leave ssl undefined so node-postgres can read that URL.
if (process.env.DATABASE_SSL === "true") databaseOptions.ssl = true;
if (process.env.DATABASE_SSL === "false") databaseOptions.ssl = false;

// pg maintains the connection pool; Drizzle uses that pool to run queries.
export const pool = new Pool(databaseOptions);

export const db = drizzle({ client: pool, schema });

export async function initializeDatabase() {
  await pool.query("SELECT 1");
}
