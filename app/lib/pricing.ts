/**
 * Prices are stored as free-form strings such as "250 Tnd", "€895" or
 * "1 299,00 Tnd", so amount extraction has to tolerate currency symbols,
 * thousands separators and non-breaking spaces.
 */
export function parseAmount(value: string | null | undefined): number | null {
  if (typeof value !== "string") return null;

  const cleaned = value
    .replace(/[\u00a0\u202f]/g, " ")
    .replace(/[^\d.,-]/g, "")
    .trim();

  if (!cleaned) return null;

  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");

  let normalized: string;

  if (lastComma !== -1 && lastDot !== -1) {
    // The right-most separator is the decimal one.
    const decimalIndex = Math.max(lastComma, lastDot);
    const decimalChar = cleaned[decimalIndex];
    normalized =
      cleaned.slice(0, decimalIndex).replace(/[.,]/g, "") +
      "." +
      cleaned.slice(decimalIndex + 1).replace(/[.,]/g, "");
  } else if (lastComma !== -1) {
    const decimals = cleaned.length - lastComma - 1;
    normalized =
      decimals === 3 && !/^-?\d{1,3},\d{3}$/.test(cleaned)
        ? cleaned.replace(/,/g, "")
        : cleaned.replace(",", ".");
  } else if (lastDot !== -1) {
    const decimals = cleaned.length - lastDot - 1;
    normalized =
      decimals === 3 && !/^-?\d{1,3}\.\d{3}$/.test(cleaned)
        ? cleaned.replace(/\./g, "")
        : cleaned;
  } else {
    normalized = cleaned;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Percentage saved when buying at `price` instead of `originalPrice`.
 * Returns null unless there is a genuine markdown.
 */
export function discountPercent(
  price: string | null | undefined,
  originalPrice: string | null | undefined
): number | null {
  if (!originalPrice) return null;

  const current = parseAmount(price);
  const original = parseAmount(originalPrice);

  if (current === null || original === null) return null;
  if (original <= 0 || current >= original) return null;

  const percent = Math.round(((original - current) / original) * 100);
  return percent > 0 ? percent : null;
}
