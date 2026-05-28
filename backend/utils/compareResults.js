// ─────────────────────────────────────────────
// utils/compareResults.js
// Compares two normalized result sets and decides
// whether they are identical.
// ─────────────────────────────────────────────

/**
 * compareResults(expected, actual)
 *
 * Converts both arrays to JSON strings and does a
 * strict string comparison.  Because normalizeOutput
 * already sorted keys and rows, two equivalent result
 * sets will always produce the same JSON string.
 *
 * Returns:
 *   { passed: true }
 *   { passed: false, error: "Wrong Answer" }
 *
 * @param {Object[]} expected  Normalized rows from the solution query
 * @param {Object[]} actual    Normalized rows from the user query
 */
function compareResults(expected, actual) {
  const expectedJSON = JSON.stringify(expected);
  const actualJSON   = JSON.stringify(actual);

  if (expectedJSON === actualJSON) {
    return { passed: true };
  }

  return {
    passed: false,
    error: "Wrong Answer",
  };
}

module.exports = { compareResults };
