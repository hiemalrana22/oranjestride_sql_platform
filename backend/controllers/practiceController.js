// ─────────────────────────────────────────────
// controllers/practiceController.js
//
// Handles the free-form SQL sandbox:
//
//   GET  /api/practice/tables  — list all available tables + schema
//   POST /api/practice/run     — run any SELECT query against all datasets
// ─────────────────────────────────────────────

const { getPracticeDb, getTableCatalog, getPracticeStatus } = require("../utils/practiceDatabase");
const { validateQuery } = require("../utils/validateQuery");
const { prepareSqlForExecution } = require("../utils/sqlQueryPrep");

// ─────────────────────────────────────────────
// GET /api/practice/tables
// Returns the full table catalog so the frontend
// can render the "Available Tables" panel.
// ─────────────────────────────────────────────
function getTables(req, res) {
  const status = getPracticeStatus();
  return res.status(200).json({
    tables: getTableCatalog(),
    tableCount: status.tableCount,
    tableNames: status.tables,
    message: status.message,
    ready: status.ready,
  });
}

// ─────────────────────────────────────────────
// POST /api/practice/run
// Body: { query: string }
// Runs the user's SQL on the shared practice DB
// and returns up to 200 result rows.
// ─────────────────────────────────────────────
function runPracticeQuery(req, res) {
  const startTime = Date.now();
  const { query } = req.body;

  // ── 1. Require a query ───────────────────
  if (!query || query.trim() === "") {
    return res.status(400).json({
      rows:          [],
      executionTime: "0ms",
      error:         "Query cannot be empty.",
    });
  }

  // ── 2. Validate — only SELECT / WITH ─────
  const validation = validateQuery(query);
  if (!validation.valid) {
    return res.status(400).json({
      rows:          [],
      executionTime: `${Date.now() - startTime}ms`,
      error:         validation.error,
    });
  }

  const executable = prepareSqlForExecution(query);
  if (!executable) {
    return res.status(400).json({
      rows:          [],
      executionTime: `${Date.now() - startTime}ms`,
      error:         "No executable SQL found. Write a SELECT or WITH query.",
    });
  }

  // ── 3. Execute against the practice DB ───
  let rows;
  try {
    const db = getPracticeDb();
    rows = db.prepare(executable).all().slice(0, 500);
  } catch (err) {
    return res.status(200).json({
      rows:          [],
      executionTime: `${Date.now() - startTime}ms`,
      error:         `SQL error: ${err.message}`,
    });
  }

  return res.status(200).json({
    rows,
    rowCount:      rows.length,
    executedQuery: executable,
    executionTime: `${Date.now() - startTime}ms`,
    error:         null,
  });
}

// ─────────────────────────────────────────────
// GET /api/practice/preview/:tableName?limit=10
// Returns sample rows for a table (schema exploration).
// ─────────────────────────────────────────────
function previewTable(req, res) {
  const tableName = String(req.params.tableName || "").trim();
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);

  if (!tableName || !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
    return res.status(400).json({ error: "Invalid table name." });
  }

  const catalog = getTableCatalog();
  const known = catalog.some((t) => t.tableName === tableName);
  if (!known) {
    return res.status(404).json({ error: `Table "${tableName}" not found.` });
  }

  try {
    const db = getPracticeDb();
    const rows = db.prepare(`SELECT * FROM "${tableName}" LIMIT ?`).all(limit);
    return res.status(200).json({ tableName, rows, rowCount: rows.length });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

module.exports = { getTables, runPracticeQuery, previewTable };
