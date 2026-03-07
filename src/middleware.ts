import { NextRequest, NextResponse } from "next/server";

async function sha256(str: string): Promise<ArrayBuffer> {
  return crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
}

async function safeCompare(a: string, b: string): Promise<boolean> {
  const [ha, hb] = await Promise.all([sha256(a), sha256(b)]);
  const viewA = new Uint8Array(ha);
  const viewB = new Uint8Array(hb);
  if (viewA.length !== viewB.length) return false;
  let result = 0;
  for (let i = 0; i < viewA.length; i++) {
    result |= viewA[i] ^ viewB[i];
  }
  return result === 0;
}

export async function middleware(req: NextRequest) {
  const authUser = process.env.AUTH_USER;
  const authPassword = process.env.AUTH_PASSWORD;

  if (!authUser || !authPassword) {
    return NextResponse.json(
      { error: "Admin auth not configured" },
      { status: 503 }
    );
  }

  const authHeader = req.headers.get("authorization");

  if (authHeader?.startsWith("Basic ")) {
    const decoded = atob(authHeader.slice(6));
    const colonIdx = decoded.indexOf(":");
    const user = decoded.slice(0, colonIdx);
    const pass = decoded.slice(colonIdx + 1);

    if (await safeCompare(user, authUser) && await safeCompare(pass, authPassword)) {
      return NextResponse.next();
    }
  }

  return new NextResponse("Unauthorized", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Uploadless Admin"',
    },
  });
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/dashboard/:path*"],
};
