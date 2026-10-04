import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

const cookieName = "inventory_access";

function hasTrustedAccessCookie(request: NextRequest) {
  const secret = process.env.SESSION_SECRET || (process.env.NODE_ENV === "production" ? "" : "local-development-secret-change-before-deploying");
  const value = request.cookies.get(cookieName)?.value;
  if (!secret || !value) return false;
  const [encodedHeader, encodedPayload, encodedSignature, extraPart] = value.split(".");
  if (!encodedHeader || !encodedPayload || !encodedSignature || extraPart) return false;

  try {
    const header = JSON.parse(Buffer.from(encodedHeader, "base64url").toString("utf8"));
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
    if (header.alg !== "HS256" || !Number.isSafeInteger(Number(payload.userId)) || Number(payload.userId) < 1) {
      return false;
    }

    const expectedBuffer = createHmac("sha256", secret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest();
    const actualBuffer = Buffer.from(encodedSignature, "base64url");
    if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) {
      return false;
    }
  } catch {
    return false;
  }

  // An expired but correctly signed access cookie may still have a valid refresh cookie.
  // API routes enforce expiry and the client refreshes access before retrying protected calls.
  return true;
}

export function proxy(request: NextRequest) {
  const authenticated = hasTrustedAccessCookie(request);
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
