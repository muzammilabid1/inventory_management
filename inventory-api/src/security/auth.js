import {
  createHash,
  randomBytes,
  randomInt,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db } from "../config/database.js";
import { users } from "../db/schema.js";

const scrypt = promisify(scryptCallback);
const accessCookieName = "inventory_access";
const refreshCookieName = "inventory_refresh";
export const accessTokenDurationSeconds = 60 * 15;
export const refreshTokenDurationSeconds = 60 * 60 * 24 * 30;
const sessionSecret =
  process.env.SESSION_SECRET ||
  (process.env.NODE_ENV === "production"
    ? ""
    : "local-development-secret-change-before-deploying");

if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set in production.");
}

export async function hashPassword(password) {
  return argon2.hash(password);
}

async function verifyLegacyScryptPassword(password, storedHash) {
  const [algorithm, salt, storedKeyHex] = storedHash.split("$");

  if (algorithm !== "scrypt" || !salt || !storedKeyHex) {
    return false;
  }

  const storedKey = Buffer.from(storedKeyHex, "hex");
  const derivedKey = await scrypt(password, salt, storedKey.length);

  return (
    storedKey.length === derivedKey.length &&
    timingSafeEqual(storedKey, derivedKey)
  );
}

export async function verifyPassword(password, storedHash) {
  if (storedHash.startsWith("$argon2")) {
    try {
      return await argon2.verify(storedHash, password);
    } catch {
      return false;
    }
  }

  return verifyLegacyScryptPassword(password, storedHash);
}

export function needsPasswordRehash(storedHash) {
  return storedHash.startsWith("scrypt$");
}

export function createOneTimeCode() {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export function hashOneTimeValue(value) {
  return createHash("sha256").update(`${sessionSecret}:${value}`).digest("hex");
}

export function createResetToken() {
  return randomBytes(32).toString("base64url");
}

export function createRefreshToken() {
  return randomBytes(32).toString("base64url");
}

function createAccessToken(userId) {
  return jwt.sign({ userId }, sessionSecret, {
    expiresIn: accessTokenDurationSeconds,
    algorithm: "HS256",
  });
}

function cookieOptions(maxAgeSeconds) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    maxAge: maxAgeSeconds * 1000,
    secure: process.env.NODE_ENV === "production",
  };
}

export function setAuthCookies(response, userId, refreshToken, refreshMaxAge = refreshTokenDurationSeconds) {
  response.cookie(accessCookieName, createAccessToken(userId), cookieOptions(accessTokenDurationSeconds));
  response.cookie(refreshCookieName, refreshToken, cookieOptions(refreshMaxAge));
  response.clearCookie("inventory_session", {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export function getRefreshToken(request) {
  return request.cookies?.[refreshCookieName] || null;
}

export function clearAuthCookies(response) {
  const options = {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  };
  response.clearCookie(accessCookieName, options);
  response.clearCookie(refreshCookieName, options);
  response.clearCookie("inventory_session", options);
}

function readAccessToken(request) {
  const value = request.cookies?.[accessCookieName];
  if (!value) return null;
  try {
    const decodedToken = jwt.verify(value, sessionSecret, { algorithms: ["HS256"] });
    const userId = Number(decodedToken.userId);
    if (!Number.isSafeInteger(userId) || userId < 1) return null;
    return userId;
  } catch {
    return null;
  }
}

export async function requireAuth(request, response, next) {
  const userId = readAccessToken(request);

  if (!userId) {
    return response.status(401).json({ error: "Please sign in to continue." });
  }

  try {
    const [user] = await db
      .select({ emailVerifiedAt: users.emailVerifiedAt })
      .from(users)
      .where(eq(users.id, BigInt(userId)))
      .limit(1);
    if (!user?.emailVerifiedAt) {
      return response.status(401).json({ error: "Please verify your email and sign in to continue." });
    }
    request.userId = userId;
    next();
  } catch (error) {
    next(error);
  }
}
