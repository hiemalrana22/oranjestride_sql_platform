/**
 * Converts raw question JSON (SQL strings) into UI-friendly schema + sample data.
 */

function parseCreateTable(statement) {
  const match = statement.match(/CREATE\s+TABLE\s+(\w+)\s*\(([\s\S]+)\)/i);
  if (!match) return null;

  const tableName = match[1];
  const body = match[2];
  const columns = body.split(',').map((part) => {
    const trimmed = part.trim();
    const pieces = trimmed.split(/\s+/);
    const name = pieces[0];
    const type = pieces.slice(1).join(' ') || 'TEXT';
    const key = /primary\s+key/i.test(trimmed)
      ? 'PRIMARY KEY'
      : /foreign\s+key/i.test(trimmed)
        ? 'FOREIGN KEY'
        : null;
    return { name, type, ...(key ? { key } : {}) };
  });

  return { tableName, columns };
}

function parseInsertRow(statement) {
  const valuesMatch = statement.match(/VALUES\s*\(([\s\S]+)\)\s*;?$/i);
  if (!valuesMatch) return [];

  const raw = valuesMatch[1];
  const values = [];
  let current = '';
  let inQuote = false;

  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (ch === "'" && raw[i - 1] !== '\\') {
      inQuote = !inQuote;
      current += ch;
    } else if (ch === ',' && !inQuote) {
      values.push(parseValue(current.trim()));
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) values.push(parseValue(current.trim()));
  return values;
}

function parseValue(token) {
  if (token.startsWith("'") && token.endsWith("'")) {
    return token.slice(1, -1);
  }
  const num = Number(token);
  return Number.isNaN(num) ? token : num;
}

function buildSampleFromTestCase(testCase) {
  if (!testCase?.schema?.length) return null;

  const tables = testCase.schema.map(parseCreateTable).filter(Boolean);

  if (tables.length === 0) return null;

  if (tables.length === 1) {
    const table = tables[0];
    const columns = table.columns.map((c) => c.name);
    const rows = (testCase.seed || [])
      .map(parseInsertRow)
      .filter((row) => row.length > 0);

    return {
      schema: table,
      sampleData: { columns, rows },
    };
  }

  const tableNames = tables.map((t) => t.tableName);
  const rowsByTable = Object.fromEntries(tableNames.map((n) => [n, []]));

  for (const insert of testCase.seed || []) {
    const tableMatch = insert.match(/INSERT\s+INTO\s+(\w+)/i);
    if (!tableMatch) continue;
    const name = tableMatch[1];
    if (rowsByTable[name]) {
      rowsByTable[name].push(parseInsertRow(insert));
    }
  }

  return {
    schema: { tables },
    sampleData: tables.map((t) => ({
      tableName: t.tableName,
      columns: t.columns.map((c) => c.name),
      rows: rowsByTable[t.tableName] || [],
    })),
  };
}

function difficultyFromDay(day) {
  if (day <= 8) return 'Easy';
  if (day <= 12) return 'Medium';
  return 'Hard';
}

function formatQuestionForDisplay(question) {
  const firstCase = question.testCases?.[0];
  const built = firstCase ? buildSampleFromTestCase(firstCase) : null;

  return {
    id: question.id,
    day: question.day,
    title: question.title,
    topic: question.topic,
    difficulty: difficultyFromDay(question.day ?? 1),
    description: question.description,
    expectedOutput:
      question.expectedOutput ||
      `Run your query and pass all ${question.testCases?.length ?? 0} hidden test cases.`,
    starterSql: question.starterQuery,
    starterQuery: question.starterQuery,
    totalTests: question.testCases?.length ?? 0,
    schema: built?.schema ?? null,
    sampleData: built?.sampleData ?? null,
  };
}

module.exports = { formatQuestionForDisplay, buildSampleFromTestCase };
