export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://aighisbyrca.com"
).replace(/\/$/, "");

export function absoluteSiteUrl(path: string): string {
  return new URL(path, `${SITE_URL}/`).toString();
}

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
