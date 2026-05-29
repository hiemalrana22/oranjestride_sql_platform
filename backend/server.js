// ─────────────────────────────────────────────
// server.js  –  Entry point for the backend
// ─────────────────────────────────────────────

require("dotenv").config();

const express = require("express");
const cors = require("cors");

const runQueryRoute = require("./routes/runQuery");

const app = express();
const PORT = process.env.PORT || 5000;

// Allow Vercel frontends + local dev
const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    const allowed =
      origin.includes("vercel.app") ||
      origin.includes("localhost") ||
      origin.includes("127.0.0.1");
    callback(null, allowed || true);
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
};

app.use(cors(corsOptions));
app.use(express.json());

// Health check (used by Render)
app.get("/", (req, res) => {
  res.json({ message: "SQL Learning Platform API is running ✅" });
});

app.get("/health", (req, res) => {
  res.json({ ok: true, service: "datastride-sql-api" });
});

app.use("/api", runQueryRoute);

app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
  console.log("Routes: GET /, GET /health, GET /api/questions, POST /api/run-query, GET /api/practice/tables");
});
