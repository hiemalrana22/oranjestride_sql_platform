import axios from 'axios';

// Production API on Render — override with VITE_API_URL on Vercel
const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'https://oranjestride-sql-platform.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Fetch all questions for the sidebar.
 */
export async function fetchQuestions() {
  const { data } = await api.get('/api/questions');
  return data.questions.map((q) => ({
    ...q,
    difficulty: q.difficulty || 'Easy',
    starterSql: q.starterQuery,
  }));
}

/**
 * Fetch one question with schema and sample data for the problem panel.
 */
export async function fetchQuestion(questionId) {
  const { data } = await api.get(`/api/questions/${questionId}`);
  const q = data.question;
  return {
    ...q,
    starterSql: q.starterSql || q.starterQuery,
  };
}

/**
 * Run user SQL against the backend test cases.
 */
export async function runQuery(questionId, sql) {
  const { data } = await api.post('/api/run-query', {
    questionId,
    query: sql,
  });
  return data;
}

export default api;
