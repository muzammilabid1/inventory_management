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
const sessionCookieName = "inventory_session";
const sessionDurationSeconds = 60 * 60 * 24 * 7;
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

function sign(payload) {
  return createHmac("sha256", sessionSecret).update(payload).digest("base64url");
}

export function setSessionCookie(response, userId) {
  const expiresAt = Math.floor(Date.now() / 1000) + sessionDurationSeconds;
  const payload = `${userId}.${expiresAt}`;
  const value = `${payload}.${sign(payload)}`;
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";

  response.setHeader(
    "Set-Cookie",
    `${sessionCookieName}=${value}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${sessionDurationSeconds}${secure}`,
  );
}

export function clearSessionCookie(response) {
  response.setHeader(
    "Set-Cookie",
    `${sessionCookieName}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`,
  );
}

function readSession(request) {
  const cookieHeader = request.headers.cookie || "";
  const cookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${sessionCookieName}=`));

  if (!cookie) return null;

  const value = decodeURIComponent(cookie.slice(sessionCookieName.length + 1));
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
  const userId = readSession(request);

  if (!userId) {
    return response.status(401).json({ error: "Please sign in to continue." });
  }

  request.userId = userId;
  next();
}
