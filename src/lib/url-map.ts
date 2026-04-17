/**
 * URL Obfuscation Map
 *
 * OBFUSCATED_BASE replaces the "/api/" prefix in browser URLs.
 * Browser sees: /t4x8n2q6/x9k2m7p4q1/login
 * Middleware rewrites to: /api/x9k2m7p4q1/login
 * Proxy decodes to: /v1/auth/login → backend
 *
 * HOW IT WORKS:
 *   Browser calls:  /t4x8n2q6/x9k2m7p4q1/login
 *   Middleware:     /api/x9k2m7p4q1/login
 *   Proxy decodes:  /v1/auth/login   → sent to backend
 *
 * IMPORTANT: Changing a key here WILL break existing clients.
 * Only change values (real paths) when refactoring the backend.
 */

/** Replaces the "/api" base in all frontend requests. */
export const OBFUSCATED_BASE = "t4x8n2q6";

export const OBFUSCATED_TO_REAL: Record<string, string> = {
  // --- Auth ---
  "x9k2m7p4q1":   "auth",

  // --- User ---
  "r3n8v5t2w6":   "user",

  // --- Hotels / Channel Manager ---
  "h7d3f2j9c5":   "hotels",

  // --- Flights ---
  "f4s1b8z6y0":   "flights",

  // --- Marketing ---
  "m2q7e5u3a9":   "marketing",

  // --- Admin ---
  "d6l9k4p0x8":   "admin",
};

/**
 * Reverse map — real path prefix → obfuscated prefix.
 * Used by the API client to build obfuscated URLs.
 */
export const REAL_TO_OBFUSCATED: Record<string, string> = Object.fromEntries(
  Object.entries(OBFUSCATED_TO_REAL).map(([obfuscated, real]) => [real, obfuscated])
);

/**
 * Helper: given a full obfuscated path string (e.g. "x9k2m7p4q1/login"),
 * returns the real backend path (e.g. "auth/login").
 * If no match, returns the original path unchanged (fail-open for safety).
 */
export function decodePath(obfuscatedPath: string): string {
  const segments = obfuscatedPath.split("/");
  const firstSegment = segments[0];
  const realPrefix = OBFUSCATED_TO_REAL[firstSegment];
  if (realPrefix) {
    segments[0] = realPrefix;
  }
  return segments.join("/");
}

/**
 * Helper: given a real path string (e.g. "auth/login"),
 * returns the obfuscated path (e.g. "x9k2m7p4q1/login").
 * If no match, returns the original path unchanged.
 */
export function encodePath(realPath: string): string {
  // Strip leading slash
  const clean = realPath.startsWith("/") ? realPath.slice(1) : realPath;
  const segments = clean.split("/");
  const firstSegment = segments[0];
  const obfuscatedPrefix = REAL_TO_OBFUSCATED[firstSegment];
  if (obfuscatedPrefix) {
    segments[0] = obfuscatedPrefix;
  }
  return "/" + segments.join("/");
}
