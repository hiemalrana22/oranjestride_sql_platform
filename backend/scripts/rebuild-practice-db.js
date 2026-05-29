#!/usr/bin/env node
/**
 * Rebuild practice.sqlite from backend/datasets/*.csv
 * Usage: node scripts/rebuild-practice-db.js
 */
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "db", "practice.sqlite");
const MANIFEST_PATH = path.join(__dirname, "..", "db", "practice-manifest.json");

if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
if (fs.existsSync(MANIFEST_PATH)) fs.unlinkSync(MANIFEST_PATH);

delete require.cache[require.resolve("../utils/practiceDatabase")];

const { initPracticeDb, getPracticeDb, getTableCatalog } = require("../utils/practiceDatabase");

initPracticeDb()
  .then(() => {
    const db = getPracticeDb();
    const catalog = getTableCatalog();
    console.log(`\nRebuilt ${catalog.length} tables:`);
    for (const t of catalog) {
      const count = db.prepare(`SELECT COUNT(*) AS c FROM "${t.tableName}"`).get().c;
      console.log(`  ${t.tableName}: ${count} rows`);
    }
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
