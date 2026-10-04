import "dotenv/config";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

const databaseUrl = process.env.DRIZZLE_DATABASE_URL || process.env.DATABASE_URL;
const requiredEnvironment = databaseUrl ? [] : ["DATABASE_HOST", "DATABASE_NAME"];

const user = process.env.DRIZZLE_DATABASE_USER
  || process.env.TYPEORM_DATABASE_USER
  || process.env.DATABASE_USER;
const password = process.env.DRIZZLE_DATABASE_PASSWORD
  || process.env.TYPEORM_DATABASE_PASSWORD
  || process.env.DATABASE_PASSWORD;

if (!databaseUrl && !user) requiredEnvironment.push("DRIZZLE_DATABASE_USER");
if (!databaseUrl && !password) requiredEnvironment.push("DRIZZLE_DATABASE_PASSWORD");

const missingEnvironment = requiredEnvironment.filter((key) => !process.env[key]);
if (missingEnvironment.length > 0) {
  throw new Error(`Missing database settings: ${missingEnvironment.join(", ")}. Check inventory-api/.env.`);
}

const databaseOptions = databaseUrl
  ? { connectionString: databaseUrl }
  : {
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT || 5432),
      database: process.env.DATABASE_NAME,
      user,
      password,
    };
const sslSetting = process.env.DATABASE_SSL
  ?? (!databaseUrl ? process.env.DRIZZLE_DATABASE_SSL : undefined);
if (sslSetting === "true") databaseOptions.ssl = true;
if (sslSetting === "false") databaseOptions.ssl = false;

const pool = new Pool(databaseOptions);

const db = drizzle(pool);
const migrationsFolder = fileURLToPath(new URL("../../drizzle", import.meta.url));
const knownTypeOrmMigrations = [
  "InitialSchema1700000000001",
  "AppPermissions1700000000002",
  "AuthChallenges1700000000003",
  "AuthChallengePermissions1700000000004",
  "RefreshTokens1700000000005",
  "RefreshTokenPermissions1700000000006",
  "OrganizationSettings1700000000007",
  "OrganizationSettingsPermissions1700000000008",
  "RequireEmailVerification1700000000009",
  "RevokeUnverifiedSessions1700000000010",
];

async function adoptExistingTypeOrmDatabase() {
  const { rows: relations } = await pool.query(`
    SELECT
      to_regclass('public.users') AS users,
      to_regclass('public.typeorm_migrations') AS legacy_migrations,
      to_regclass('drizzle.__drizzle_migrations') AS drizzle_migrations,
      to_regclass('public.categories') AS categories,
      to_regclass('public.products') AS products,
      to_regclass('public.auth_challenges') AS auth_challenges,
      to_regclass('public.password_resets') AS password_resets,
      to_regclass('public.refresh_token_families') AS refresh_token_families,
      to_regclass('public.refresh_tokens') AS refresh_tokens,
      to_regclass('public.organization_settings') AS organization_settings
  `);
  const schema = relations[0];
  const existingBusinessTables = [
    "users",
    "categories",
    "products",
    "auth_challenges",
    "password_resets",
    "refresh_token_families",
    "refresh_tokens",
    "organization_settings",
  ].filter((table) => schema[table]);

  if (existingBusinessTables.length === 0) return false;
  if (!schema.users) {
    throw new Error("Found part of an existing inventory schema without its users table. No migration was run.");
  }

  if (schema.drizzle_migrations) {
    const { rows } = await pool.query("SELECT COUNT(*)::int AS count FROM drizzle.__drizzle_migrations");
    if (rows[0].count > 0) return false;
  }

  if (!schema.legacy_migrations) {
    throw new Error("Found existing app tables without Drizzle migration history. No schema changes were made.");
  }

  const { rows: oldMigrations } = await pool.query(
    "SELECT name FROM public.typeorm_migrations",
  );
  const completedNames = new Set(oldMigrations.map(({ name }) => name));
  const missingMigrations = knownTypeOrmMigrations.filter((name) => !completedNames.has(name));
  const requiredTables = [
    "users",
    "categories",
    "products",
    "auth_challenges",
    "password_resets",
    "refresh_token_families",
    "refresh_tokens",
    "organization_settings",
  ];
  const missingTables = requiredTables.filter((table) => !schema[table]);

  if (missingMigrations.length > 0 || missingTables.length > 0) {
    throw new Error("Existing database does not match the known TypeORM schema. No schema changes were made.");
  }

  const { rows: verifiedColumn } = await pool.query(`
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'users'
      AND column_name = 'email_verified_at'
  `);
  if (verifiedColumn.length === 0) {
    throw new Error("Existing users table is missing email_verified_at. No schema changes were made.");
  }

  const journalPath = path.join(migrationsFolder, "meta", "_journal.json");
  const journal = JSON.parse(await readFile(journalPath, "utf8"));
  const firstMigration = journal.entries[0];
  if (!firstMigration) throw new Error("There is no Drizzle baseline migration to adopt.");

  const migrationSql = await readFile(
    path.join(migrationsFolder, `${firstMigration.tag}.sql`),
    "utf8",
  );
  const hash = createHash("sha256").update(migrationSql).digest("hex");

  await pool.query("CREATE SCHEMA IF NOT EXISTS drizzle");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
      id SERIAL PRIMARY KEY,
      hash text NOT NULL,
      created_at bigint
    )
  `);
  await pool.query(
    "INSERT INTO drizzle.__drizzle_migrations (hash, created_at) VALUES ($1, $2)",
    [hash, firstMigration.when],
  );

  console.log("Adopted the existing TypeORM database as the Drizzle baseline; no app tables or records were changed.");
  return true;
}

try {
  await adoptExistingTypeOrmDatabase();
  await migrate(db, {
    migrationsFolder,
    migrationsSchema: "drizzle",
    migrationsTable: "__drizzle_migrations",
  });
  console.log("Drizzle migrations completed.");
} catch (error) {
  console.error("Drizzle migrations failed:", error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
