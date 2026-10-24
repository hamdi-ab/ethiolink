import { NextResponse } from "next/server";

/**
 * Checks whether an unknown error is related to database connectivity,
 * unreachable host, DNS resolution failure, connection timeout, or serverless compute spin-up.
 */
export function isDatabaseConnectionError(error: unknown): boolean {
  if (!error) return false;

  const err = error as Record<string, unknown>;
  const code = typeof err.code === "string" ? err.code : "";
  const name = typeof err.name === "string" ? err.name : "";
  const message = typeof err.message === "string" ? err.message : "";

  // Prisma connection & timeout error codes
  // P1001: Can't reach database server
  // P1002: Database server was reached but timed out
  // P1008: Operations timed out
  // P1017: Server closed connection
  const networkCodes = [
    "P1001",
    "P1002",
    "P1008",
    "P1017",
    "ECONNREFUSED",
    "ENOTFOUND",
    "EHOSTUNREACH",
    "ETIMEDOUT",
    "EAI_AGAIN",
    "ECONNRESET",
  ];

  if (networkCodes.includes(code)) {
    return true;
  }

  // Driver adapter and client initialization error names
  if (name === "DriverAdapterError" || name === "PrismaClientInitializationError") {
    return true;
  }

  // Text inspection for database connectivity failure markers
  const lowerMsg = message.toLowerCase();
  if (
    lowerMsg.includes("can't reach database server") ||
    lowerMsg.includes("databasenotreachable") ||
    lowerMsg.includes("database not reachable") ||
    lowerMsg.includes("connection terminated") ||
    lowerMsg.includes("enotfound") ||
    lowerMsg.includes("econnrefused") ||
    lowerMsg.includes("ehostunreach") ||
    lowerMsg.includes("etimedout") ||
    lowerMsg.includes("timeout expired")
  ) {
    return true;
  }

  // Check nested cause if present (e.g. pg DriverAdapterError has [cause])
  if (err.cause && typeof err.cause === "object") {
    return isDatabaseConnectionError(err.cause);
  }

  return false;
}

/**
 * Standardized API error response handler.
 * If the error is identified as a database / network connectivity issue, returns HTTP 503
 * with a helpful, user-friendly explanation instead of a generic 500 internal server error.
 */
export function handleApiError(
  error: unknown,
  fallbackMessage = "An unexpected error occurred",
  defaultStatus = 500
): NextResponse {
  if (isDatabaseConnectionError(error)) {
    console.warn("[Database Connection Warning]:", error);
    return NextResponse.json(
      {
        error: "Unable to reach database server. Please check your internet connection and network status.",
        code: "DATABASE_UNREACHABLE",
      },
      { status: 503 }
    );
  }

  console.error(`[API Error - ${fallbackMessage}]:`, error);
  return NextResponse.json(
    {
      error: fallbackMessage,
      code: "INTERNAL_SERVER_ERROR",
    },
    { status: defaultStatus }
  );
}
