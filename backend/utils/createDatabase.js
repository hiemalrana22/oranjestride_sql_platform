// ─────────────────────────────────────────────
// utils/createDatabase.js
// Creates a fresh SQLite in-memory database for
// a single test case, then runs the schema and
// seed data provided in that test case.
// ─────────────────────────────────────────────

// better-sqlite3 is a synchronous SQLite driver — simple and fast
const Database = require("better-sqlite3");

/**
 * createDatabase(testCase)
 *
 * Opens a brand-new in-memory SQLite database,
 * executes every CREATE TABLE statement from testCase.schema,
 * then runs every INSERT statement from testCase.seed.
 *
 * Returns the ready-to-query database instance.
 *
 * @param {{ schema: string[], seed: string[] }} testCase
 * @returns {Database}  An open better-sqlite3 connection
 */
function createDatabase(testCase) {
  // ":memory:" tells SQLite to keep everything in RAM.
  // Each call creates an independent database — no shared state.
  const db = new Database(":memory:");

  // ── Run schema (CREATE TABLE statements) ──
  for (const statement of testCase.schema) {
    db.exec(statement);
  }

  // ── Insert seed data ──────────────────────
  for (const statement of testCase.seed) {
    db.exec(statement);
  }

  return db;
}

module.exports = { createDatabase };
