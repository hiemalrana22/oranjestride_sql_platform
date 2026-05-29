// ─────────────────────────────────────────────
// utils/sqlQueryPrep.js
// Prepares user SQL for validation and execution:
// strips comments, picks the active statement when several are present.
// ─────────────────────────────────────────────

/**
 * Remove -- line comments and /* block comments *\/ from SQL.
 */
function stripSqlComments(sql) {
  let out = "";
  let i = 0;

  while (i < sql.length) {
    if (sql[i] === "'" || sql[i] === '"') {
      const quote = sql[i];
      out += quote;
      i++;
      while (i < sql.length) {
        out += sql[i];
        if (sql[i] === quote) {
          if (sql[i + 1] === quote) {
            out += sql[i + 1];
            i += 2;
            continue;
          }
          i++;
          break;
        }
        i++;
      }
      continue;
    }

    if (sql[i] === "-" && sql[i + 1] === "-") {
      while (i < sql.length && sql[i] !== "\n") i++;
      continue;
    }

    if (sql[i] === "/" && sql[i + 1] === "*") {
      i += 2;
      while (i < sql.length && !(sql[i] === "*" && sql[i + 1] === "/")) i++;
      i += 2;
      continue;
    }

    out += sql[i];
    i++;
  }

  return out;
}

/**
 * Split on semicolons outside of quoted strings.
 */
function splitStatements(sql) {
  const parts = [];
  let current = "";
  let i = 0;

  while (i < sql.length) {
    if (sql[i] === "'" || sql[i] === '"') {
      const quote = sql[i];
      current += quote;
      i++;
      while (i < sql.length) {
        current += sql[i];
        if (sql[i] === quote) {
          if (sql[i + 1] === quote) {
            current += sql[i + 1];
            i += 2;
            continue;
          }
          i++;
          break;
        }
        i++;
      }
      continue;
    }

    if (sql[i] === ";") {
      const trimmed = current.trim();
      if (trimmed) parts.push(trimmed);
      current = "";
      i++;
      continue;
    }

    current += sql[i];
    i++;
  }

  const tail = current.trim();
  if (tail) parts.push(tail);
  return parts;
}

/**
 * Pick the statement to run: last SELECT/WITH in the buffer (typical sandbox flow).
 */
function pickExecutableStatement(sql) {
  const cleaned = stripSqlComments(sql).trim();
  if (!cleaned) return "";

  const statements = splitStatements(cleaned);
  if (statements.length === 0) return "";

  for (let i = statements.length - 1; i >= 0; i--) {
    const upper = statements[i].trim().toUpperCase();
    if (upper.startsWith("SELECT") || upper.startsWith("WITH")) {
      return statements[i].trim();
    }
  }

  return statements[statements.length - 1].trim();
}

/**
 * Full pipeline: comments → active statement → trimmed SQL.
 */
function prepareSqlForExecution(sql) {
  if (!sql || typeof sql !== "string") return "";
  return pickExecutableStatement(sql);
}

module.exports = {
  stripSqlComments,
  splitStatements,
  pickExecutableStatement,
  prepareSqlForExecution,
};
