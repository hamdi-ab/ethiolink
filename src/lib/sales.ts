/**
 * Utilities for Ethiopian Birr (ETB) currency parsing, formatting, and validation.
 */

/**
 * Validates and converts an ETB input into a valid 2-decimal number.
 * Returns null if the value is non-numeric, non-positive, or exceeds 2 decimal places.
 */
export function parseAmountETB(input: unknown): number | null {
  if (input === null || input === undefined) return null;

  let num: number;
  if (typeof input === "number") {
    num = input;
  } else if (typeof input === "string") {
    // Strip commas and whitespace
    const cleanStr = input.replace(/,/g, "").trim();
    if (!/^\d+(\.\d{1,2})?$/.test(cleanStr)) {
      return null;
    }
    num = parseFloat(cleanStr);
  } else {
    return null;
  }

  if (!Number.isFinite(num) || num <= 0 || num > 100_000_000) {
    return null;
  }

  // Round strictly to 2 decimal places to eliminate floating point issues
  return Math.round(num * 100) / 100;
}

/**
 * Formats a numeric ETB amount into Ethiopian currency display format (e.g. "1,500.00 ETB")
 */
export function formatETB(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined) return "0.00 ETB";

  const num = typeof amount === "number" ? amount : parseFloat(String(amount));
  if (!Number.isFinite(num)) return "0.00 ETB";

  const formatted = num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${formatted} ETB`;
}
