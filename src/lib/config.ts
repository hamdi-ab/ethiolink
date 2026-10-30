/**
 * Centralized Application Configuration & Environment Guards
 * Ensures consistent base URLs, region indicators, currency tokens, and secrets across environments.
 */

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "EthioLink";
export const APP_REGION = process.env.APP_REGION || process.env.NEXT_PUBLIC_APP_REGION || "Primary Server Cluster";
export const DEFAULT_CURRENCY = process.env.NEXT_PUBLIC_DEFAULT_CURRENCY || "ETB";
export const DEFAULT_RETENTION_DAYS = 90;
export const TELEMETRY_DEDUP_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Resolves the fully qualified base URL of the running application.
 * Prioritizes explicit environment configurations (NEXT_PUBLIC_APP_URL, APP_URL, VERCEL_URL),
 * followed by client-side window origin, forwarded request headers, and local fallbacks.
 */
export function getBaseUrl(reqHeaders?: Headers | { get(name: string): string | null }): string {
  // 1. Explicit configured public URL
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }

  // 2. Server-side explicit APP_URL
  if (process.env.APP_URL) {
    return process.env.APP_URL.replace(/\/$/, "");
  }

  // 3. Vercel deployment URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }

  // 4. Client-side browser window origin
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  // 5. Inbound HTTP request headers
  if (reqHeaders) {
    const host = reqHeaders.get("x-forwarded-host") || reqHeaders.get("host");
    const proto = reqHeaders.get("x-forwarded-proto") || "http";
    if (host) {
      return `${proto}://${host}`;
    }
  }

  // 6. Safe local fallback
  return "http://localhost:3000";
}

/**
 * Returns the session cryptographic secret.
 * Emits a security warning in production environments if a fallback secret is detected.
 */
export function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      console.warn("⚠️ [SECURITY WARNING]: AUTH_SECRET is not configured in production environment! Using fallback key.");
    }
    return "ethiolink-super-secret-auth-key-production-ready";
  }
  return secret;
}

/**
 * Returns the daily telemetry salting secret.
 */
export function getTelemetrySalt(): string {
  return process.env.TELEMETRY_SALT || "ethiolink-daily-salt";
}
