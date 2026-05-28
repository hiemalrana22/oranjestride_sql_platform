// ─────────────────────────────────────────────
// server.js  –  Entry point for the backend
// ─────────────────────────────────────────────

// Load environment variables from .env
require("dotenv").config();

const express = require("express");
const cors = require("cors");

// Import the route that handles query execution
const runQueryRoute = require("./routes/runQuery");

const app = express();

// ── Middleware ──────────────────────────────
// Allow requests from the frontend (any origin in dev)
app.use(cors());

// Parse incoming JSON request bodies
app.use(express.json());

// ── Routes ──────────────────────────────────
// All query-related endpoints live under /api
app.use("/api", runQueryRoute);

// Simple health-check route so you can confirm the server is running
app.get("/", (req, res) => {
  res.json({ message: "SQL Learning Platform API is running ✅" });
});

// ── Start Server ────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
