import { z } from "zod";

const email = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid email address.")
  .max(255, "Email must be 255 characters or fewer.");

const password = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(128, "Password must be 128 characters or fewer.");

const oneTimeCode = z
  .string()
  .trim()
  .regex(/^\d{6}$/, "Enter the six digit code.");

export const registerBody = z.object({
  fullName: z.string().trim().min(1, "Enter your name.").max(120, "Name must be 120 characters or fewer."),
  email,
  password,
});

export const loginBody = z.object({
  email,
  password: z
    .string()
    .min(1, "Enter your password.")
    .max(128, "Password must be 128 characters or fewer."),
});
export const verifyCodeBody = z.object({
  email,
  code: oneTimeCode,
  purpose: z.enum(["login", "register"]).default("login"),
});
export const emailBody = z.object({ email });
export const resetCodeBody = z.object({ email, code: oneTimeCode });
export const resetPasswordBody = z.object({
  token: z
    .string()
    .min(40, "Reset token is invalid.")
    .max(100, "Reset token is invalid."),
  password,
});

export const productBody = z.object({
  name: z.string().trim().min(1, "Product name is required.").max(160),
  sku: z.string().trim().min(1, "SKU is required.").max(80),
  description: z.string().trim().max(5000, "Description must be 5000 characters or fewer.").default(""),
  category: z.string().trim().min(1, "Choose a category.").max(120),
  price: z.coerce.number().finite().min(0).max(9_999_999_999.99),
  quantity: z.coerce.number().int().min(0).max(2_147_483_647),
  lowStockThreshold: z.coerce.number().int().min(0).max(2_147_483_647).default(10),
});

export const productIdParams = z.object({
  id: z
    .string()
    .regex(/^[1-9]\d{0,18}$/, "Product ID must be a positive integer.")
    .refine(
      (value) =>
        /^[1-9]\d{0,18}$/.test(value) &&
        BigInt(value) <= 9_223_372_036_854_775_807n,
      "Product ID is too large.",
    ),
});
