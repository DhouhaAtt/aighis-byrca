import { NextResponse } from "next/server";

import { getSession } from "./adminAuth";

export async function isAdmin(): Promise<boolean> {
  return (await getSession()) !== null;
}

export function unauthorized(message = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 });
}
