/**
 * Sanitizes post-login redirect destinations.
 * Enforces same-origin internal relative paths starting with exactly one '/'
 * and rejects protocol-relative URLs, executable schemes, and redirect cycles.
 */
export function sanitizeNextUrl(
  rawUrl: string | null | undefined,
  defaultDestination: string
): string {
  if (!rawUrl || typeof rawUrl !== "string") {
    return defaultDestination;
  }

  const trimmed = rawUrl.trim();
  if (trimmed.length === 0) {
    return defaultDestination;
  }

  // Reject protocol-relative URLs (//evil.com), backslashes, colons (schemes), and control chars
  if (
    trimmed.startsWith("//") ||
    trimmed.includes("\\") ||
    trimmed.includes(":") ||
    /[\x00-\x1F\x7F]/.test(trimmed)
  ) {
    return defaultDestination;
  }

  // Must begin with exactly one '/'
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return defaultDestination;
  }

  // Avoid redirect loops back to auth gateways
  if (
    trimmed === "/login" ||
    trimmed.startsWith("/login?") ||
    trimmed === "/logout" ||
    trimmed.startsWith("/logout?")
  ) {
    return defaultDestination;
  }

  return trimmed;
}
