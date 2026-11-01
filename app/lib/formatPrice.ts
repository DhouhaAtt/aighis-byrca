/** Formats stored product prices consistently for the storefront. */
export function formatTndPrice(value: string | number | null | undefined): string {
  const price = String(value ?? "")
    .trim()
    .replace(/\s*(?:TND|Tnd|DT)\s*$/i, "")
    .trim();
  return `${price || "0"} TND`;
}
