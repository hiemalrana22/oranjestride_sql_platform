// ─────────────────────────────────────────────
// utils/runTestCase.js
// Orchestrates a single test case:
//   1. Create fresh in-memory DB with schema + seed
//   2. Run the official solution query
//   3. Run the user's query
//   4. Normalize both outputs
//   5. Compare and return pass/fail
// ─────────────────────────────────────────────

const { createDatabase }  = require("./createDatabase");
const { normalizeOutput } = require("./normalizeOutput");
const { compareResults }  = require("./compareResults");

/**
 * runTestCase(testCase, userQuery)
 *
 * @param {{ schema: string[], seed: string[], solutionQuery: string }} testCase
 * @param {string} userQuery  The SQL submitted by the user
 *
 * @returns {{
 *   passed:   boolean,
 *   result:   Object[],   // user's raw result rows (for display)
 *   error:    string|null
 * }}
 */
function runTestCase(testCase, userQuery) {
  let db;

  try {
    // ── Step 1: Fresh database ──────────────
    db = createDatabase(testCase);

    // ── Step 2: Run the official solution ───
    let expectedRows;
    try {
      expectedRows = db.prepare(testCase.solutionQuery).all();
    } catch (err) {
      // This should never happen if question JSONs are correct
      return {
        passed: false,
        result: [],
        error: `Internal error in solution query: ${err.message}`,
      };
    }

    // ── Step 3: Run the user's query ────────
    let userRows;
    try {
      userRows = db.prepare(userQuery).all();
    } catch (err) {
      // Catch SQL syntax errors from the user's query
      return {
        passed: false,
        result: [],
        error: `SQL syntax error: ${err.message}`,
      };
    }

    // ── Step 4: Normalize both outputs ──────
    const normalizedExpected = normalizeOutput(expectedRows);
    const normalizedActual   = normalizeOutput(userRows);

    // ── Step 5: Compare ─────────────────────
    const comparison = compareResults(normalizedExpected, normalizedActual);

    return {
      passed: comparison.passed,
      result: userRows,          // raw rows for the frontend to display
      error:  comparison.error || null,
    };

  } finally {
    // Always close the database to free memory,
    // even if an error was thrown above
    if (db) db.close();
  }
}

module.exports = { runTestCase };
