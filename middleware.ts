import { NextRequest, NextResponse } from "next/server";

/** HTTP Basic auth for the staff board: user "admin", password = ADMIN_PASSWORD. */
export function middleware(req: NextRequest) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    return new NextResponse("ADMIN_PASSWORD is not configured", { status: 503 });
  }
  const header = req.headers.get("authorization") ?? "";
  if (header.startsWith("Basic ")) {
    try {
      const [user, ...rest] = atob(header.slice(6)).split(":");
      if (user === "admin" && rest.join(":") === password) return NextResponse.next();
    } catch {
      /* fall through */
    }
  }
  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="PWB staff"' },
  });
}

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
