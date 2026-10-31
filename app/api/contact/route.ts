import { NextResponse } from "next/server";
import { sendContactMessage } from "../../lib/email";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!name || name.length > 120 || !EMAIL_PATTERN.test(email) || email.length > 254 || message.length < 10 || message.length > 5000) {
    return NextResponse.json({ error: "Please check the contact form fields" }, { status: 400 });
  }

  const result = await sendContactMessage({ name, email, message });
  if (!result.sent) {
    return NextResponse.json({ error: "Your message could not be sent right now" }, { status: 503 });
  }

  return NextResponse.json({ sent: true }, { status: 200 });
}
