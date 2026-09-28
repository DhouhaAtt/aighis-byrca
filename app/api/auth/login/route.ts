import { NextResponse } from "next/server";

const ADMIN_EMAIL = "amore@aighis.com";
const ADMIN_PASSWORD = "doukha";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      return NextResponse.json({
        success: true,
        user: { email: ADMIN_EMAIL, name: "Amor Aighis", role: "admin" },
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid email or password" },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 400 }
    );
  }
}
