import {
  createHash,
  createHmac,
  randomBytes,
  randomInt,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";

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
  const salt = randomBytes(16).toString("hex");
  const derivedKey = await scrypt(password, salt, 64);
  return `scrypt$${salt}$${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password, storedHash) {
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

function sign(payload) {
  return createHmac("sha256", sessionSecret).update(payload).digest("base64url");
}

function createAccessToken(userId) {
  const expiresAt = Math.floor(Date.now() / 1000) + accessTokenDurationSeconds;
  const payload = `${userId}.${expiresAt}`;
  return `${payload}.${sign(payload)}`;
}

function cookieOptions(maxAge) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `HttpOnly; Path=/; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

export function setAuthCookies(response, userId, refreshToken, refreshMaxAge = refreshTokenDurationSeconds) {
  response.setHeader("Set-Cookie", [
    `${accessCookieName}=${createAccessToken(userId)}; ${cookieOptions(accessTokenDurationSeconds)}`,
    `${refreshCookieName}=${refreshToken}; ${cookieOptions(refreshMaxAge)}`,
    `inventory_session=; ${cookieOptions(0)}`,
  ]);
}

function readCookie(request, cookieName) {
  const cookie = (request.headers.cookie || "")
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${cookieName}=`));
  if (!cookie) return null;
  try {
    return decodeURIComponent(cookie.slice(cookieName.length + 1));
  } catch {
    return null;
  }
}

export function getRefreshToken(request) {
  return readCookie(request, refreshCookieName);
}

export function clearAuthCookies(response) {
  response.setHeader("Set-Cookie", [
    `${accessCookieName}=; ${cookieOptions(0)}`,
    `${refreshCookieName}=; ${cookieOptions(0)}`,
    `inventory_session=; ${cookieOptions(0)}`,
  ]);
}

function readAccessToken(request) {
  const value = readCookie(request, accessCookieName);
  if (!value) return null;
  const [userIdText, expiresAtText, providedSignature] = value.split(".");
  const payload = `${userIdText}.${expiresAtText}`;
  const expectedSignature = sign(payload);
  const provided = Buffer.from(providedSignature || "", "base64url");
  const expected = Buffer.from(expectedSignature, "base64url");

  if (
    provided.length !== expected.length ||
    !timingSafeEqual(provided, expected)
  ) {
    return null;
  }

  const userId = Number(userIdText);
  const expiresAt = Number(expiresAtText);

  if (!Number.isSafeInteger(userId) || userId < 1 || expiresAt <= Date.now() / 1000) {
    return null;
  }

  return userId;
}

export function requireAuth(request, response, next) {
  const userId = readAccessToken(request);

  if (!userId) {
    return response.status(401).json({ error: "Please sign in to continue." });
  }

  request.userId = userId;
  next();
}
