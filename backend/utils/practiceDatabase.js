// ─────────────────────────────────────────────
// utils/practiceDatabase.js
//
// Singleton in-memory SQLite database loaded with
// ALL course datasets, parsed directly from the
// CSV files bundled in backend/db/datasets/.
//
//   Day 8  → book1, book2
//   Day 9  → constituency_info, election_results
//   Day 10 → scheme_budget_utilization,
//             district_policy_outcomes,
//             state_year_policy_indicators
// ─────────────────────────────────────────────

const Database = require("better-sqlite3");
const fs       = require("fs");
const path     = require("path");

const DATASETS_DIR = path.join(__dirname, "..", "db", "datasets");

let practiceDb = null;

// ── Table metadata exposed to the frontend ───
const TABLE_CATALOG = [
  {
    tableName: "book1",
    day: 8,
    description: "Party contact directory — names and addresses",
    columns: [
      { name: "sno",          type: "INTEGER" },
      { name: "Party_Name",   type: "TEXT"    },
      { name: "Contact_Name", type: "TEXT"    },
      { name: "Address",      type: "TEXT"    },
    ],
  },
  {
    tableName: "book2",
    day: 8,
    description: "Party contacts with campaign spending figures",
    columns: [
      { name: "sno",               type: "INTEGER" },
      { name: "Party_Name",        type: "TEXT"    },
      { name: "Contact_Name",      type: "TEXT"    },
      { name: "Address",           type: "TEXT"    },
      { name: "Campaign_Spending", type: "INTEGER" },
    ],
  },
  {
    tableName: "constituency_info",
    day: 9,
    description: "Indian electoral constituency names and states (100 unique)",
    columns: [
      { name: "constituency_id", type: "INTEGER" },
      { name: "constituency",    type: "TEXT"    },
      { name: "state",           type: "TEXT"    },
    ],
  },
  {
    tableName: "election_results",
    day: 9,
    description: "Candidate-level election results — 500 rows",
    columns: [
      { name: "constituency",    type: "TEXT"    },
      { name: "constituency_id", type: "INTEGER" },
      { name: "candidate",       type: "TEXT"    },
      { name: "party",           type: "TEXT"    },
      { name: "total_votes",     type: "INTEGER" },
      { name: "margin",          type: "INTEGER" },
    ],
  },
  {
    tableName: "scheme_budget_utilization",
    day: 10,
    description: "Govt scheme budgets by state & year — 200 rows",
    columns: [
      { name: "scheme_id",           type: "TEXT"    },
      { name: "scheme_name",         type: "TEXT"    },
      { name: "ministry",            type: "TEXT"    },
      { name: "state_code",          type: "TEXT"    },
      { name: "year",                type: "INTEGER" },
      { name: "allocated_budget_cr", type: "REAL"    },
      { name: "utilized_budget_cr",  type: "REAL"    },
      { name: "beneficiaries_lakh",  type: "REAL"    },
      { name: "scheme_type",         type: "TEXT"    },
    ],
  },
  {
    tableName: "district_policy_outcomes",
    day: 10,
    description: "District health/education indices by year — 200 rows",
    columns: [
      { name: "district_id",                   type: "TEXT"    },
      { name: "district_name",                 type: "TEXT"    },
      { name: "state_code",                    type: "TEXT"    },
      { name: "year",                          type: "INTEGER" },
      { name: "health_index",                  type: "REAL"    },
      { name: "education_index",               type: "REAL"    },
      { name: "nutrition_coverage_pct",        type: "REAL"    },
      { name: "drinking_water_coverage_pct",   type: "REAL"    },
      { name: "sanitation_coverage_pct",       type: "REAL"    },
      { name: "crime_rate_per_100k",           type: "INTEGER" },
    ],
  },
  {
    tableName: "state_year_policy_indicators",
    day: 10,
    description: "State-level macro indicators — GDP, literacy, poverty — 40 rows",
    columns: [
      { name: "state_code",         type: "TEXT"    },
      { name: "state_name",         type: "TEXT"    },
      { name: "year",               type: "INTEGER" },
      { name: "population_mn",      type: "REAL"    },
      { name: "gdp_lakh_cr",        type: "REAL"    },
      { name: "per_capita_income",  type: "INTEGER" },
      { name: "unemployment_rate",  type: "REAL"    },
      { name: "poverty_rate",       type: "REAL"    },
      { name: "literacy_rate",      type: "REAL"    },
      { name: "urbanization_rate",  type: "REAL"    },
    ],
  },
];

// ─────────────────────────────────────────────
// Lightweight CSV parser
// Handles quoted fields and embedded commas.
// Returns array of row-arrays (no header logic here).
// ─────────────────────────────────────────────
function parseCSV(filePath, { skipHeader = true, limit = Infinity } = {}) {
  const content = fs.readFileSync(filePath, "utf8");
  const lines   = content.split(/\r?\n/).filter((l) => l.trim() !== "");
  const start   = skipHeader ? 1 : 0;
  const rows    = [];

  for (let i = start; i < lines.length && rows.length < limit; i++) {
    const line = lines[i];
    const row  = [];
    let field  = "";
    let inQuote = false;

    for (let j = 0; j < line.length; j++) {
      const ch = line[j];
      if (ch === '"') {
        inQuote = !inQuote;
      } else if (ch === "," && !inQuote) {
        row.push(field.trim());
        field = "";
      } else {
        field += ch;
      }
    }
    row.push(field.trim()); // last field
    rows.push(row);
  }
  return rows;
}

// Cast a string value to number if it looks numeric
function maybeNum(val) {
  if (val === "" || val === null || val === undefined) return null;
  const n = Number(val);
  return Number.isNaN(n) ? val : n;
}

// ─────────────────────────────────────────────
// Build the singleton database
// ─────────────────────────────────────────────
function csvPath(fileName) {
  const filePath = path.join(DATASETS_DIR, fileName);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Dataset file missing: ${fileName}. Ensure backend/db/datasets is deployed.`);
  }
  return filePath;
}

function getPracticeDb() {
  if (practiceDb) return practiceDb;

  const db = new Database(":memory:");

  // ── book1 ──────────────────────────────────
  db.exec(`CREATE TABLE book1 (
    sno INTEGER, Party_Name TEXT, Contact_Name TEXT, Address TEXT
  )`);
  {
    const ins = db.prepare("INSERT INTO book1 VALUES (?,?,?,?)");
    // CSV header: S.No, Party Name, Contact Name, Address
    parseCSV(csvPath("book1.csv")).forEach(([sno, party, contact, address]) => {
      ins.run(maybeNum(sno), party, contact, address);
    });
  }

  // ── book2 ──────────────────────────────────
  db.exec(`CREATE TABLE book2 (
    sno INTEGER, Party_Name TEXT, Contact_Name TEXT,
    Address TEXT, Campaign_Spending INTEGER
  )`);
  {
    const ins = db.prepare("INSERT INTO book2 VALUES (?,?,?,?,?)");
    // CSV header: S.No, Party Name, Contact Name, Address, Campaign_Spending
    parseCSV(csvPath("book2.csv")).forEach(([sno, party, contact, address, spending]) => {
      ins.run(maybeNum(sno), party, contact, address, maybeNum(spending));
    });
  }

  // ── constituency_info ──────────────────────
  db.exec(`CREATE TABLE constituency_info (
    constituency_id INTEGER, constituency TEXT, state TEXT
  )`);
  {
    const ins = db.prepare("INSERT INTO constituency_info VALUES (?,?,?)");
    // CSV header: constituency_id, constituency, state
    parseCSV(csvPath("constituency_info.csv")).forEach(([cid, constituency, state]) => {
      ins.run(maybeNum(cid), constituency, state);
    });
  }

  // ── election_results ───────────────────────
  db.exec(`CREATE TABLE election_results (
    constituency TEXT, constituency_id INTEGER,
    candidate TEXT, party TEXT,
    total_votes INTEGER, margin INTEGER
  )`);
  {
    const ins = db.prepare("INSERT INTO election_results VALUES (?,?,?,?,?,?)");
    // CSV: NO meaningful header — first col=constituency(text), second=constituency_id(int)
    // We skip line 1 (mis-labelled header) and read actual data
    parseCSV(csvPath("election_results.csv"), { skipHeader: true, limit: 500 })
      .forEach(([constituency, cid, candidate, party, totalVotes, margin]) => {
        ins.run(constituency, maybeNum(cid), candidate, party, maybeNum(totalVotes), maybeNum(margin));
      });
  }

  // ── scheme_budget_utilization ──────────────
  db.exec(`CREATE TABLE scheme_budget_utilization (
    scheme_id TEXT, scheme_name TEXT, ministry TEXT, state_code TEXT,
    year INTEGER, allocated_budget_cr REAL, utilized_budget_cr REAL,
    beneficiaries_lakh REAL, scheme_type TEXT
  )`);
  {
    const ins = db.prepare("INSERT INTO scheme_budget_utilization VALUES (?,?,?,?,?,?,?,?,?)");
    parseCSV(csvPath("scheme_budget_utilization.csv"))
      .forEach(([sid, sname, ministry, sc, yr, ab, ub, bl, st]) => {
        ins.run(sid, sname, ministry, sc, maybeNum(yr), maybeNum(ab), maybeNum(ub), maybeNum(bl), st);
      });
  }

  // ── district_policy_outcomes ───────────────
  db.exec(`CREATE TABLE district_policy_outcomes (
    district_id TEXT, district_name TEXT, state_code TEXT, year INTEGER,
    health_index REAL, education_index REAL,
    nutrition_coverage_pct REAL, drinking_water_coverage_pct REAL,
    sanitation_coverage_pct REAL, crime_rate_per_100k INTEGER
  )`);
  {
    const ins = db.prepare("INSERT INTO district_policy_outcomes VALUES (?,?,?,?,?,?,?,?,?,?)");
    parseCSV(csvPath("district_policy_outcomes.csv"))
      .forEach(([did, dname, sc, yr, hi, ei, nc, dw, san, cr]) => {
        ins.run(did, dname, sc, maybeNum(yr), maybeNum(hi), maybeNum(ei),
                maybeNum(nc), maybeNum(dw), maybeNum(san), maybeNum(cr));
      });
  }

  // ── state_year_policy_indicators ───────────
  db.exec(`CREATE TABLE state_year_policy_indicators (
    state_code TEXT, state_name TEXT, year INTEGER,
    population_mn REAL, gdp_lakh_cr REAL, per_capita_income INTEGER,
    unemployment_rate REAL, poverty_rate REAL,
    literacy_rate REAL, urbanization_rate REAL
  )`);
  {
    const ins = db.prepare("INSERT INTO state_year_policy_indicators VALUES (?,?,?,?,?,?,?,?,?,?)");
    parseCSV(csvPath("state_year_policy_indicators.csv"))
      .forEach(([sc, sn, yr, pop, gdp, pci, unemp, pov, lit, urb]) => {
        ins.run(sc, sn, maybeNum(yr), maybeNum(pop), maybeNum(gdp),
                maybeNum(pci), maybeNum(unemp), maybeNum(pov), maybeNum(lit), maybeNum(urb));
      });
  }

  practiceDb = db;
  console.log("Practice database built successfully.");
  return db;
}

function getTableMeta(tableName) {
  return TABLE_CATALOG.find((t) => t.tableName === tableName) || null;
}

function getTablePreview(tableName, limit = 10) {
  const meta = getTableMeta(tableName);
  if (!meta) {
    throw new Error(`Unknown table: ${tableName}`);
  }
  const db = getPracticeDb();
  const rows = db.prepare(`SELECT * FROM ${tableName} LIMIT ${limit}`).all();
  return { tableName, columns: meta.columns, rows };
}

module.exports = { getPracticeDb, TABLE_CATALOG, getTableMeta, getTablePreview };
