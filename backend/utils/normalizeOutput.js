// ─────────────────────────────────────────────
// utils/normalizeOutput.js
// Converts query result rows into a consistent,
// comparable format so small differences in
// ordering do not cause false failures.
// ─────────────────────────────────────────────

/**
 * normalizeOutput(rows)
 *
 * Takes an array of row objects returned by better-sqlite3
 * and returns a normalized version where:
 *  1. Each row's keys are sorted alphabetically
 *  2. null values are replaced with the string "NULL"
 *     so JSON serialization treats them consistently
 *  3. Numeric-looking strings are coerced to numbers
 *     so "60000" and 60000 compare equal
 *  4. All rows are sorted by their JSON representation
 *     so row order does not affect the comparison
 *
 * @param {Object[]} rows  Raw rows from db.prepare(...).all()
 * @returns {Object[]}     Normalized, sorted rows
 */
function normalizeOutput(rows) {
  if (!rows || rows.length === 0) return [];

  // Step 1 — normalize each individual row
  const normalizedRows = rows.map((row) => {
    const normalized = {};

    // Sort the column names so { name, id } and { id, name } are equal
    const sortedKeys = Object.keys(row).sort();

    for (const key of sortedKeys) {
      let value = row[key];

      // Replace null with the sentinel string "NULL"
      if (value === null || value === undefined) {
        value = "NULL";
      }

      // Coerce numeric strings to actual numbers
      // e.g. "60000" → 60000  (SQLite sometimes returns numbers as strings)
      if (typeof value === "string" && value.trim() !== "" && !isNaN(value)) {
        value = Number(value);
      }

      normalized[key] = value;
    }

    return normalized;
  });

  // Step 2 — sort the rows themselves so result order doesn't matter
  normalizedRows.sort((a, b) => {
    const aStr = JSON.stringify(a);
    const bStr = JSON.stringify(b);
    if (aStr < bStr) return -1;
    if (aStr > bStr) return 1;
    return 0;
  });

  return normalizedRows;
}

module.exports = { normalizeOutput };
