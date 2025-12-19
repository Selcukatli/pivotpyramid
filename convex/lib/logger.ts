/**
 * Simple logger for Convex functions
 * Wraps console methods for consistent logging
 */
export const logger = {
  info: (...args: unknown[]) => console.log("[INFO]", ...args),
  error: (...args: unknown[]) => console.error("[ERROR]", ...args),
  warn: (...args: unknown[]) => console.warn("[WARN]", ...args),
  debug: (...args: unknown[]) => console.log("[DEBUG]", ...args),
};
