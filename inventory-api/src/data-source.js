import "dotenv/config";
import { DataSource } from "typeorm";
import { entities } from "./db/entities.js";
import { InitialSchema1700000000001 } from "./db/migrations/1700000000001-InitialSchema.js";
import { AppPermissions1700000000002 } from "./db/migrations/1700000000002-AppPermissions.js";
import { AuthChallenges1700000000003 } from "./db/migrations/1700000000003-AuthChallenges.js";
import { AuthChallengePermissions1700000000004 } from "./db/migrations/1700000000004-AuthChallengePermissions.js";
import { RefreshTokens1700000000005 } from "./db/migrations/1700000000005-RefreshTokens.js";
import { RefreshTokenPermissions1700000000006 } from "./db/migrations/1700000000006-RefreshTokenPermissions.js";
import { OrganizationSettings1700000000007 } from "./db/migrations/1700000000007-OrganizationSettings.js";
import { OrganizationSettingsPermissions1700000000008 } from "./db/migrations/1700000000008-OrganizationSettingsPermissions.js";
import { RequireEmailVerification1700000000009 } from "./db/migrations/1700000000009-RequireEmailVerification.js";
import { RevokeUnverifiedSessions1700000000010 } from "./db/migrations/1700000000010-RevokeUnverifiedSessions.js";

const user = process.env.TYPEORM_DATABASE_USER || process.env.DATABASE_USER;
const password = process.env.TYPEORM_DATABASE_PASSWORD || process.env.DATABASE_PASSWORD;

if (!process.env.DATABASE_HOST || !process.env.DATABASE_NAME || !user || !password) {
  throw new Error("Set database settings and TYPEORM_DATABASE_USER/TYPEORM_DATABASE_PASSWORD for the TypeORM migration account.");
}

export default new DataSource({
  type: "postgres",
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT || 5432),
  database: process.env.DATABASE_NAME,
  username: user,
  password,
  entities,
  migrations: [
    InitialSchema1700000000001,
    AppPermissions1700000000002,
    AuthChallenges1700000000003,
    AuthChallengePermissions1700000000004,
    RefreshTokens1700000000005,
    RefreshTokenPermissions1700000000006,
    OrganizationSettings1700000000007,
    OrganizationSettingsPermissions1700000000008,
    RequireEmailVerification1700000000009,
    RevokeUnverifiedSessions1700000000010,
  ],
  migrationsTableName: "typeorm_migrations",
  synchronize: false,
  migrationsRun: false,
  migrationsTransactionMode: "all",
});
