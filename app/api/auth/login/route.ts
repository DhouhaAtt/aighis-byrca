import { NextResponse } from "next/server";

import {
  SESSION_COOKIE,
  adminDisplayName,
  createSessionToken,
  sessionCookieOptions,
  verifyCredentials,
} from "../../../lib/adminAuth";

export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 400 }
    );
  }

  const email = (body.email ?? "").trim();
  const password = body.password ?? "";

  if (!email || !password) {
    return NextResponse.json(
      { success: false, error: "Please fill in all fields" },
      { status: 400 }
    );
  }

  if (!verifyCredentials(email, password)) {
    return NextResponse.json(
      { success: false, error: "Invalid email or password" },
      { status: 401 }
    );
  }

  const response = NextResponse.json({
    success: true,
    user: { email, name: adminDisplayName(), role: "admin" },
  });

  response.cookies.set(SESSION_COOKIE, createSessionToken(email), sessionCookieOptions());

  return response;
}
