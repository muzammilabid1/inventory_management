import pg from "pg";

const { Pool } = pg;

const requiredEnvironment = [
  "DATABASE_HOST",
  "DATABASE_NAME",
  "DATABASE_USER",
  "DATABASE_PASSWORD",
];

const missingEnvironment = requiredEnvironment.filter(
  (key) => !process.env[key],
);

if (missingEnvironment.length > 0) {
  throw new Error(
    `Missing database settings: ${missingEnvironment.join(", ")}. Copy .env.example to .env and fill it in.`,
  );
}

export const pool = new Pool({
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT || 5432),
  database: process.env.DATABASE_NAME,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
});

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL connection error:", error.message);
});
