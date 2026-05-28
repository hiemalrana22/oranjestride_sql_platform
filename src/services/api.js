import axios from 'axios';
import { getQuestionById } from '../data/mockQuestions';

// Axios instance — point baseURL at your backend when ready
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

const MOCK_DELAY_MS = 900;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Successful mock response (all tests passed) */
export function buildSuccessResponse(question, resultOverride) {
  const resultsByQuestion = {
    1: [
      { id: 1, name: 'John', salary: 60000, department: 'IT' },
      { id: 3, name: 'Lisa', salary: 55000, department: 'Finance' },
    ],
    2: [
      { department: 'Finance', employee_count: 1 },
      { department: 'HR', employee_count: 1 },
      { department: 'IT', employee_count: 2 },
    ],
    3: [
      { id: 101, name: 'Alice', product: 'Laptop', amount: 1200.0 },
      { id: 103, name: 'Alice', product: 'Keyboard', amount: 89.99 },
      { id: 102, name: 'Bob', product: 'Mouse', amount: 25.5 },
    ],
  };

  return {
    passed: true,
    passedTests: 4,
    totalTests: 4,
    executionTime: '8ms',
    result: resultOverride ?? resultsByQuestion[question.id] ?? [],
    error: null,
  };
}

/** Failed mock response (tests did not pass) */
export function buildFailureResponse(question, message) {
  return {
    passed: false,
    passedTests: 1,
    totalTests: 4,
    executionTime: '12ms',
    result: [],
    error: message ?? 'Output does not match expected results. Review your WHERE, JOIN, or GROUP BY clause.',
  };
}

/** Error-only response (syntax, empty query, runtime) */
export function buildErrorResponse(message) {
  return {
    passed: false,
    passedTests: 0,
    totalTests: 4,
    executionTime: '0ms',
    result: [],
    error: message,
  };
}

function normalizeSql(sql) {
  return sql.trim().toLowerCase().replace(/\s+/g, ' ');
}

function hasSyntaxIssue(sql) {
  const normalized = normalizeSql(sql);
  // Obvious typos / invalid starters for demo purposes
  if (/^selct\b/.test(normalized)) return true;
  if (/^selet\b/.test(normalized)) return true;
  if (normalized.includes('selct ')) return true;
  if (!normalized.startsWith('select') && !normalized.startsWith('with')) return true;
  return false;
}

function queryPassesGrader(question, sql) {
  const normalized = normalizeSql(sql);
  return question.passPatterns.every((pattern) =>
    normalized.includes(pattern.toLowerCase())
  );
}

/**
 * Run a SQL query against the mock backend.
 * Later: replace body with api.post('/execute', { questionId, sql })
 */
export async function runQuery(questionId, sql) {
  await delay(MOCK_DELAY_MS);

  const trimmed = sql.trim();

  if (!trimmed) {
    return buildErrorResponse('Empty query: please write a SELECT statement before running.');
  }

  if (hasSyntaxIssue(trimmed)) {
    return buildErrorResponse(
      'SQL syntax error near line 1: unrecognized keyword or invalid statement. Check spelling (e.g. SELECT).'
    );
  }

  const question = getQuestionById(questionId);

  if (queryPassesGrader(question, trimmed)) {
    return buildSuccessResponse(question);
  }

  return buildFailureResponse(
    question,
    'Your query ran but did not pass all test cases. Compare your output with the expected result.'
  );
}

export default api;
