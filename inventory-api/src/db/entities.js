import { EntitySchema } from "typeorm";

// Entity schemas keep this API's JavaScript code fully typed by TypeORM metadata
// without requiring a TypeScript build or experimental decorators.
export const User = new EntitySchema({
  name: "User",
  tableName: "users",
  columns: {
    id: { type: "bigint", primary: true, generated: "identity" },
    fullName: { name: "full_name", type: "varchar", length: 120 },
    email: { type: "varchar", length: 255, unique: true },
    passwordHash: { name: "password_hash", type: "text" },
    emailVerifiedAt: { name: "email_verified_at", type: "timestamptz", nullable: true },
    createdAt: { name: "created_at", type: "timestamptz", createDate: true },
    updatedAt: { name: "updated_at", type: "timestamptz", updateDate: true },
  },
});

export const Category = new EntitySchema({
  name: "Category",
  tableName: "categories",
  columns: {
    id: { type: "bigint", primary: true, generated: "identity" },
    userId: { name: "user_id", type: "bigint" },
    name: { type: "varchar", length: 120 },
    description: { type: "text", default: "" },
    createdAt: { name: "created_at", type: "timestamptz", createDate: true },
    updatedAt: { name: "updated_at", type: "timestamptz", updateDate: true },
  },
  uniques: [{ columns: ["userId", "name"] }, { columns: ["userId", "id"] }],
  indices: [{ columns: ["userId"] }],
  relations: {
    user: { type: "many-to-one", target: "User", joinColumn: { name: "user_id" }, onDelete: "RESTRICT" },
  },
});

export const Product = new EntitySchema({
  name: "Product",
  tableName: "products",
  columns: {
    id: { type: "bigint", primary: true, generated: "identity" },
    userId: { name: "user_id", type: "bigint" },
    categoryId: { name: "category_id", type: "bigint" },
    name: { type: "varchar", length: 160 },
    sku: { type: "varchar", length: 80 },
    description: { type: "text", default: "" },
    price: { type: "numeric", precision: 12, scale: 2 },
    quantity: { type: "integer", default: 0 },
    lowStockThreshold: { name: "low_stock_threshold", type: "integer", default: 10 },
    createdAt: { name: "created_at", type: "timestamptz", createDate: true },
    updatedAt: { name: "updated_at", type: "timestamptz", updateDate: true },
  },
  uniques: [{ columns: ["userId", "sku"] }],
  indices: [{ columns: ["userId", "name"] }],
  relations: {
    user: { type: "many-to-one", target: "User", joinColumn: { name: "user_id" }, onDelete: "RESTRICT" },
    category: { type: "many-to-one", target: "Category", joinColumn: { name: "category_id" }, onDelete: "RESTRICT" },
  },
});

export const AuthChallenge = new EntitySchema({
  name: "AuthChallenge",
  tableName: "auth_challenges",
  columns: {
    id: { type: "bigint", primary: true, generated: "identity" },
    userId: { name: "user_id", type: "bigint" },
    purpose: { type: "varchar", length: 16 },
    codeHash: { name: "code_hash", type: "char", length: 64 },
    expiresAt: { name: "expires_at", type: "timestamptz" },
    attempts: { type: "integer", default: 0 },
    createdAt: { name: "created_at", type: "timestamptz", createDate: true },
  },
  indices: [{ columns: ["userId", "purpose"] }],
});

export const PasswordReset = new EntitySchema({
  name: "PasswordReset",
  tableName: "password_resets",
  columns: {
    id: { type: "bigint", primary: true, generated: "identity" },
    userId: { name: "user_id", type: "bigint" },
    codeHash: { name: "code_hash", type: "char", length: 64 },
    codeExpiresAt: { name: "code_expires_at", type: "timestamptz" },
    codeAttempts: { name: "code_attempts", type: "integer", default: 0 },
    resetTokenHash: { name: "reset_token_hash", type: "char", length: 64, nullable: true },
    tokenExpiresAt: { name: "token_expires_at", type: "timestamptz", nullable: true },
    tokenUsedAt: { name: "token_used_at", type: "timestamptz", nullable: true },
    createdAt: { name: "created_at", type: "timestamptz", createDate: true },
  },
  indices: [{ columns: ["userId"] }],
});

export const RefreshTokenFamily = new EntitySchema({
  name: "RefreshTokenFamily",
  tableName: "refresh_token_families",
  columns: {
    id: { type: "uuid", primary: true },
    userId: { name: "user_id", type: "bigint" },
    createdAt: { name: "created_at", type: "timestamptz", createDate: true },
    expiresAt: { name: "expires_at", type: "timestamptz" },
    revokedAt: { name: "revoked_at", type: "timestamptz", nullable: true },
  },
  indices: [{ columns: ["userId"] }],
});

export const RefreshToken = new EntitySchema({
  name: "RefreshToken",
  tableName: "refresh_tokens",
  columns: {
    id: { type: "bigint", primary: true, generated: "identity" },
    familyId: { name: "family_id", type: "uuid" },
    tokenHash: { name: "token_hash", type: "char", length: 64, unique: true },
    createdAt: { name: "created_at", type: "timestamptz", createDate: true },
    revokedAt: { name: "revoked_at", type: "timestamptz", nullable: true },
    replacedById: { name: "replaced_by_id", type: "bigint", nullable: true },
  },
  indices: [{ columns: ["familyId"] }],
});

export const OrganizationSettings = new EntitySchema({
  name: "OrganizationSettings",
  tableName: "organization_settings",
  columns: {
    userId: { name: "user_id", type: "bigint", primary: true },
    organizationName: { name: "organization_name", type: "varchar", length: 160 },
    phone: { type: "varchar", length: 40, default: "" },
    address: { type: "varchar", length: 500, default: "" },
    createdAt: { name: "created_at", type: "timestamptz", createDate: true },
    updatedAt: { name: "updated_at", type: "timestamptz", updateDate: true },
  },
});

export const entities = [
  User,
  Category,
  Product,
  AuthChallenge,
  PasswordReset,
  RefreshTokenFamily,
  RefreshToken,
  OrganizationSettings,
];
