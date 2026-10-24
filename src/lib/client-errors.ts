/**
 * Formats client-side errors into user-friendly, actionable messages.
 * Detects offline state, browser network failures (e.g. unplugged LAN cable),
 * database connectivity errors returned from APIs, and standard validation errors.
 */
export function formatClientError(
  err: unknown,
  fallbackMessage = "An unexpected error occurred. Please try again."
): string {
  // Check if browser is currently offline
  if (typeof window !== "undefined" && typeof navigator !== "undefined" && !navigator.onLine) {
    return "You are currently offline. Please check your network connection or LAN cable.";
  }

  if (err instanceof Error) {
    const msg = err.message || "";
    const lower = msg.toLowerCase();

    // Browser network failures (DNS lookup failure, cable unplugged, connection refused)
    if (
      lower.includes("failed to fetch") ||
      lower.includes("networkerror") ||
      lower.includes("load failed") ||
      err.name === "TypeError"
    ) {
      return "Unable to connect to the server. Please check your network cable or Wi-Fi connection.";
    }

    // Database unreachable / 503 response
    if (
      msg.includes("DATABASE_UNREACHABLE") ||
      lower.includes("unable to reach database server") ||
      lower.includes("unable to connect to the database") ||
      lower.includes("database is unreachable")
    ) {
      return "Database server is currently unreachable. Please check your internet connection or try again shortly.";
    }

    return msg;
  }

  if (typeof err === "string" && err.trim().length > 0) {
    return err;
  }

  return fallbackMessage;
}
