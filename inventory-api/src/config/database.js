import { DataSource } from "typeorm";
import { entities } from "../db/entities.js";

const requiredEnvironment = [
  "DATABASE_HOST",
  "DATABASE_NAME",
  "DATABASE_USER",
  "DATABASE_PASSWORD",
];

const missingEnvironment = requiredEnvironment.filter((key) => !process.env[key]);
if (missingEnvironment.length > 0) {
  throw new Error(
    `Missing database settings: ${missingEnvironment.join(", ")}. Copy .env.example to .env and fill it in.`,
  );
}

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT || 5432),
  database: process.env.DATABASE_NAME,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  entities,
  synchronize: false,
  migrationsRun: false,
  logging: false,
});

// Keep existing security-focused SQL and transaction flows working while the
// connection lifecycle and entity metadata are managed by TypeORM.
function adaptResult(rows) {
  return { rows, rowCount: Array.isArray(rows) ? rows.length : 0 };
}

export const pool = {
  async query(sql, parameters = []) {
    return adaptResult(await AppDataSource.query(sql, parameters));
  },
  async connect() {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    return {
      async query(sql, parameters = []) {
        const command = sql.trim().toUpperCase();
        if (command === "BEGIN") {
          await queryRunner.startTransaction();
          return { rows: [], rowCount: 0 };
        }
        if (command === "COMMIT") {
          await queryRunner.commitTransaction();
          return { rows: [], rowCount: 0 };
        }
        if (command === "ROLLBACK") {
          if (queryRunner.isTransactionActive) await queryRunner.rollbackTransaction();
          return { rows: [], rowCount: 0 };
        }
        return adaptResult(await queryRunner.query(sql, parameters));
      },
      release: () => queryRunner.release(),
    };
  },
  async end() {
    if (AppDataSource.isInitialized) await AppDataSource.destroy();
  },
};

export async function initializeDatabase() {
  if (!AppDataSource.isInitialized) await AppDataSource.initialize();
}
