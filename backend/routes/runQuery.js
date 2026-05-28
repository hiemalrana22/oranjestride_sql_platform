// ─────────────────────────────────────────────
// routes/runQuery.js
// All query-related routes — mounted under /api
// ─────────────────────────────────────────────

const express      = require("express");
const router       = express.Router();
const { runQuery, listQuestions, getQuestion } = require("../controllers/queryController");

/**
 * GET /api/questions
 * Returns metadata for all questions (id, day, title, topic, description, starterQuery)
 * Used by the frontend to render the question list.
 */
router.get("/questions", listQuestions);

/**
 * GET /api/questions/:id
 * Full question details for the problem panel.
 */
router.get("/questions/:id", getQuestion);

/**
 * POST /api/run-query
 * Body: { questionId: number, query: string }
 * Validates and runs the user's SQL against all test cases.
 */
router.post("/run-query", runQuery);

module.exports = router;
