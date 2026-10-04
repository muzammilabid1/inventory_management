import {
  bigint,
  check,
  char,
  foreignKey,
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

const idColumn = (name = "id") => bigint(name, { mode: "bigint" })
  .generatedAlwaysAsIdentity()
  .primaryKey();

const createdAtColumn = () => timestamp("created_at", { withTimezone: true })
  .notNull()
  .defaultNow();

const updatedAtColumn = () => timestamp("updated_at", { withTimezone: true })
  .notNull()
  .defaultNow();

export const users = pgTable("users", {
  id: idColumn(),
  fullName: varchar("full_name", { length: 120 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});

export const categories = pgTable("categories", {
  id: idColumn(),
  userId: bigint("user_id", { mode: "bigint" })
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  name: varchar("name", { length: 120 }).notNull(),
  description: text("description").notNull().default(""),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
}, (table) => [
  unique("categories_user_name_unique").on(table.userId, table.name),
  unique("categories_user_id_unique").on(table.userId, table.id),
  index("categories_user_id_idx").on(table.userId),
]);

export const products = pgTable("products", {
  id: idColumn(),
  userId: bigint("user_id", { mode: "bigint" })
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  categoryId: bigint("category_id", { mode: "bigint" }).notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  sku: varchar("sku", { length: 80 }).notNull(),
  description: text("description").notNull().default(""),
  // PostgreSQL numeric values stay strings, preserving the previous API output.
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull().default(0),
  lowStockThreshold: integer("low_stock_threshold").notNull().default(10),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
}, (table) => [
  unique("products_user_sku_unique").on(table.userId, table.sku),
  index("products_user_name_idx").on(table.userId, table.name),
  foreignKey({
    name: "products_category_same_user_fk",
    columns: [table.userId, table.categoryId],
    foreignColumns: [categories.userId, categories.id],
  }).onDelete("restrict"),
  check("products_price_check", sql`${table.price} >= 0`),
  check("products_quantity_check", sql`${table.quantity} >= 0`),
  check("products_low_stock_threshold_check", sql`${table.lowStockThreshold} >= 0`),
]);

export const authChallenges = pgTable("auth_challenges", {
  id: idColumn(),
  userId: bigint("user_id", { mode: "bigint" })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  purpose: varchar("purpose", { length: 16 }).notNull(),
  codeHash: char("code_hash", { length: 64 }).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  attempts: integer("attempts").notNull().default(0),
  createdAt: createdAtColumn(),
}, (table) => [
  index("auth_challenges_user_purpose_idx").on(table.userId, table.purpose),
  check("auth_challenges_purpose_check", sql`${table.purpose} IN ('login', 'register')`),
  check("auth_challenges_attempts_check", sql`${table.attempts} >= 0`),
]);

export const passwordResets = pgTable("password_resets", {
  id: idColumn(),
  userId: bigint("user_id", { mode: "bigint" })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  codeHash: char("code_hash", { length: 64 }).notNull(),
  codeExpiresAt: timestamp("code_expires_at", { withTimezone: true }).notNull(),
  codeAttempts: integer("code_attempts").notNull().default(0),
  resetTokenHash: char("reset_token_hash", { length: 64 }),
  tokenExpiresAt: timestamp("token_expires_at", { withTimezone: true }),
  tokenUsedAt: timestamp("token_used_at", { withTimezone: true }),
  createdAt: createdAtColumn(),
}, (table) => [
  index("password_resets_user_idx").on(table.userId),
  check("password_resets_code_attempts_check", sql`${table.codeAttempts} >= 0`),
]);

export const refreshTokenFamilies = pgTable("refresh_token_families", {
  id: uuid("id").primaryKey(),
  userId: bigint("user_id", { mode: "bigint" })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: createdAtColumn(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
}, (table) => [
  index("refresh_token_families_user_idx").on(table.userId),
]);

export const refreshTokens = pgTable("refresh_tokens", {
  id: idColumn(),
  familyId: uuid("family_id")
    .notNull()
    .references(() => refreshTokenFamilies.id, { onDelete: "cascade" }),
  tokenHash: char("token_hash", { length: 64 }).notNull().unique(),
  createdAt: createdAtColumn(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  replacedById: bigint("replaced_by_id", { mode: "bigint" })
    .references(() => refreshTokens.id, { onDelete: "set null" }),
}, (table) => [
  index("refresh_tokens_family_idx").on(table.familyId),
]);

export const organizationSettings = pgTable("organization_settings", {
  userId: bigint("user_id", { mode: "bigint" })
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  organizationName: varchar("organization_name", { length: 160 }).notNull(),
  phone: varchar("phone", { length: 40 }).notNull().default(""),
  address: varchar("address", { length: 500 }).notNull().default(""),
  createdAt: createdAtColumn(),
  updatedAt: updatedAtColumn(),
});
