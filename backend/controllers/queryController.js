// ─────────────────────────────────────────────
// controllers/queryController.js
// Handles:
//   POST /api/run-query   — validate + run user SQL
//   GET  /api/questions   — list all available questions
// ─────────────────────────────────────────────

const path = require("path");
const fs   = require("fs");

const { validateQuery } = require("../utils/validateQuery");
const { prepareSqlForExecution } = require("../utils/sqlQueryPrep");
const { runTestCase }   = require("../utils/runTestCase");
const { formatQuestionForDisplay } = require("../utils/parseQuestionForDisplay");

// Path to the questions folder
const QUESTIONS_DIR = path.join(__dirname, "..", "questions");

// ── Helper: load a question JSON by numeric id ──
function loadQuestion(questionId) {
  const filePath = path.join(QUESTIONS_DIR, `q${questionId}.json`);
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────
// GET /api/questions
// Returns metadata for every question so the
// frontend can render the question list.
// ─────────────────────────────────────────────
function listQuestions(req, res) {
  const files = fs.readdirSync(QUESTIONS_DIR).filter((f) => f.endsWith(".json"));

  const questions = files
    .map((file) => {
      try {
        const q = JSON.parse(fs.readFileSync(path.join(QUESTIONS_DIR, file), "utf8"));
        return {
          id:           q.id,
          day:          q.day,
          title:        q.title,
          topic:        q.topic,
          difficulty:   q.day <= 8 ? "Easy" : q.day <= 12 ? "Medium" : "Hard",
          description:  q.description,
          starterQuery: q.starterQuery,
          totalTests:   q.testCases.length,
        };
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    // Sort by question id so they appear in order
    .sort((a, b) => a.id - b.id);

  return res.status(200).json({ questions });
}

// ─────────────────────────────────────────────
// GET /api/questions/:id
// Full question for the problem panel (schema, sample data)
// ─────────────────────────────────────────────
function getQuestion(req, res) {
  const questionId = Number(req.params.id);
  const question = loadQuestion(questionId);

  if (!question) {
    return res.status(404).json({ error: `Question ${questionId} not found.` });
  }

  return res.status(200).json({ question: formatQuestionForDisplay(question) });
}

// ─────────────────────────────────────────────
// POST /api/run-query
// Body: { questionId: number, query: string }
// ─────────────────────────────────────────────
function runQuery(req, res) {
  const startTime = Date.now();

  const { questionId, query } = req.body;

  // ── 1. Basic input check ─────────────────
  if (!questionId || !query) {
    return res.status(400).json({
      passed:        false,
      passedTests:   0,
      totalTests:    0,
      executionTime: "0ms",
      result:        [],
      error:         "Both questionId and query are required.",
    });
  }

  // ── 2. Validate the SQL query ─────────────
  const validation = validateQuery(query);
  if (!validation.valid) {
    return res.status(400).json({
      passed:        false,
      passedTests:   0,
      totalTests:    0,
      executionTime: `${Date.now() - startTime}ms`,
      result:        [],
      error:         validation.error,
    });
  }

  // ── 3. Load the question JSON ─────────────
  const question = loadQuestion(questionId);
  if (!question) {
    return res.status(404).json({
      passed:        false,
      passedTests:   0,
      totalTests:    0,
      executionTime: `${Date.now() - startTime}ms`,
      result:        [],
      error:         `Question ${questionId} not found.`,
    });
  }

  const testCases  = question.testCases;
  const totalTests = testCases.length;

  // ── 4. Run each test case ─────────────────
  let passedTests = 0;
  let lastResult  = [];
  let firstError  = null;

  const executable = prepareSqlForExecution(query);
  if (!executable) {
    return res.status(400).json({
      passed:        false,
      passedTests:   0,
      totalTests,
      executionTime: `${Date.now() - startTime}ms`,
      result:        [],
      error:         "No executable SQL found. Write a SELECT or WITH query.",
    });
  }

  for (const testCase of testCases) {
    const outcome = runTestCase(testCase, executable);

    lastResult = outcome.result;

    if (outcome.passed) {
      passedTests++;
    } else {
      if (!firstError) firstError = outcome.error;
    }
  }

  // ── 5. Return final response ──────────────
  const allPassed     = passedTests === totalTests;
  const executionTime = `${Date.now() - startTime}ms`;

  return res.status(200).json({
    passed:        allPassed,
    passedTests,
    totalTests,
    executionTime,
    result:        lastResult,
    error:         allPassed ? null : (firstError || "Wrong Answer"),
  });
}

module.exports = { runQuery, listQuestions, getQuestion };
