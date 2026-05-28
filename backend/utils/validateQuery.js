// ─────────────────────────────────────────────
// utils/validateQuery.js
// Checks whether a user's SQL query is safe to run.
// Only SELECT and WITH (CTEs) are allowed.
// Everything else is blocked to protect the database.
// ─────────────────────────────────────────────

/**
 * List of SQL keywords that must never appear in a user query.
 * These can modify or destroy data / schema.
 */
const BLOCKED_KEYWORDS = [
  "DROP",
  "DELETE",
  "UPDATE",
  "INSERT",
  "ALTER",
  "CREATE",
  "PRAGMA",    // SQLite-specific — can expose internals
  "ATTACH",    // Could attach external DB files
  "DETACH",
  "VACUUM",
  "REINDEX",
];

/**
 * validateQuery(query)
 *
 * Returns an object:
 *   { valid: true }                        — query is safe
 *   { valid: false, error: "reason" }      — query is blocked
 *
 * @param {string} query  The SQL string submitted by the user
 */
function validateQuery(query) {
  // Reject empty input
  if (!query || query.trim() === "") {
    return { valid: false, error: "Query cannot be empty." };
  }

  // Work with uppercase so keyword checks are case-insensitive
  const upperQuery = query.trim().toUpperCase();

  // ── Block dangerous keywords ──────────────
  for (const keyword of BLOCKED_KEYWORDS) {
    // Use a word-boundary style check: keyword must be a whole word,
    // not a substring of a column name like "UPDATES_count".
    // We look for the keyword followed by a non-word character or end of string.
    const pattern = new RegExp(`\\b${keyword}\\b`);
    if (pattern.test(upperQuery)) {
      return {
        valid: false,
        error: `Query contains a blocked keyword: ${keyword}. Only SELECT and WITH queries are allowed.`,
      };
    }
  }

  // ── Allow only SELECT or WITH at the start ──
  // After stripping leading whitespace, the query must begin with SELECT or WITH.
  if (!upperQuery.startsWith("SELECT") && !upperQuery.startsWith("WITH")) {
    return {
      valid: false,
      error: "Only SELECT and WITH (CTE) queries are allowed.",
    };
  }

  // ── Block multiple statements ──────────────
  // A semicolon in the middle of the query is a red flag for stacked statements.
  // We allow a trailing semicolon but not one mid-query.
  const withoutTrailingSemicolon = upperQuery.replace(/;\s*$/, "");
  if (withoutTrailingSemicolon.includes(";")) {
    return {
      valid: false,
      error: "Multiple SQL statements are not allowed. Send a single query.",
    };
  }

  // All checks passed — query is safe to run
  return { valid: true };
}

module.exports = { validateQuery };
