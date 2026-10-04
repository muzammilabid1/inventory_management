import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const user = process.env.DRIZZLE_DATABASE_USER
  || process.env.TYPEORM_DATABASE_USER
  || process.env.DATABASE_USER;
const password = process.env.DRIZZLE_DATABASE_PASSWORD
  || process.env.TYPEORM_DATABASE_PASSWORD
  || process.env.DATABASE_PASSWORD;
const databaseUrl = process.env.DRIZZLE_DATABASE_URL || process.env.DATABASE_URL;
const sslSetting = process.env.DATABASE_SSL
  ?? (!databaseUrl ? process.env.DRIZZLE_DATABASE_SSL : undefined);

const dbCredentials = databaseUrl
  ? { url: databaseUrl }
  : {
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT || 5432),
      database: process.env.DATABASE_NAME,
      user,
      password,
    };
if (sslSetting === "true") dbCredentials.ssl = true;
if (sslSetting === "false") dbCredentials.ssl = false;

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.js",
  out: "./drizzle",
  dbCredentials,
  migrations: {
    schema: "drizzle",
    table: "__drizzle_migrations",
  },
});
