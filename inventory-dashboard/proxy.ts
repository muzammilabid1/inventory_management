import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

const cookieName = "inventory_session";

function hasValidSession(request: NextRequest) {
  const secret = process.env.SESSION_SECRET || (process.env.NODE_ENV === "production" ? "" : "local-development-secret-change-before-deploying");
  const value = request.cookies.get(cookieName)?.value;
  if (!secret || !value) return false;
  const [userId, expiry, signature] = value.split(".");
  if (!userId || !expiry || !signature || !/^\d+$/.test(userId) || !/^\d+$/.test(expiry)) return false;
  const payload = `${userId}.${expiry}`;
  const expected = createHmac("sha256", secret).update(payload).digest("base64url");
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  return Number(userId) > 0 && Number(expiry) > Date.now() / 1000 && actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

export function proxy(request: NextRequest) {
  const authenticated = hasValidSession(request);
  const path = request.nextUrl.pathname;
  if (!authenticated && ["/dashboard", "/products", "/categories"].some((root) => path === root || path.startsWith(`${root}/`))) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", path);
    return NextResponse.redirect(login);
  }
  if (authenticated && ["/login", "/register"].includes(path)) return NextResponse.redirect(new URL("/dashboard", request.url));
  return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*", "/products/:path*", "/categories/:path*", "/login", "/register"] };
