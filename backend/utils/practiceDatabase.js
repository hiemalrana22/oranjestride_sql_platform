// ─────────────────────────────────────────────
// utils/practiceDatabase.js
//
// Singleton in-memory SQLite database loaded with
// ALL course datasets for the free-practice sandbox:
//
//   Day 8  → book1, book2
//   Day 9  → constituency_info, election_results
//   Day 10 → scheme_budget_utilization,
//             district_policy_outcomes,
//             state_year_policy_indicators
//
// Built once on first require(); reused for all
// subsequent practice queries.
// ─────────────────────────────────────────────

const Database = require("better-sqlite3");

let practiceDb = null;

// ── Table metadata (used by GET /api/practice/tables) ──
const TABLE_CATALOG = [
  {
    tableName: "book1",
    day: 8,
    description: "Party contact directory (no spending data)",
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
    description: "Indian electoral constituency names and states",
    columns: [
      { name: "constituency_id", type: "INTEGER" },
      { name: "constituency",    type: "TEXT"    },
      { name: "state",           type: "TEXT"    },
    ],
  },
  {
    tableName: "election_results",
    day: 9,
    description: "Candidate-level election results (100-row sample)",
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
    description: "Govt scheme budgets by state & year (200 rows)",
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
    description: "District-level health/education indices by year (200 rows)",
    columns: [
      { name: "district_id",                  type: "TEXT"    },
      { name: "district_name",               type: "TEXT"    },
      { name: "state_code",                  type: "TEXT"    },
      { name: "year",                        type: "INTEGER" },
      { name: "health_index",               type: "REAL"    },
      { name: "education_index",            type: "REAL"    },
      { name: "nutrition_coverage_pct",     type: "REAL"    },
      { name: "drinking_water_coverage_pct",type: "REAL"    },
      { name: "sanitation_coverage_pct",    type: "REAL"    },
      { name: "crime_rate_per_100k",        type: "INTEGER" },
    ],
  },
  {
    tableName: "state_year_policy_indicators",
    day: 10,
    description: "State-level macro indicators: GDP, literacy, poverty (40 rows)",
    columns: [
      { name: "state_code",        type: "TEXT"    },
      { name: "state_name",        type: "TEXT"    },
      { name: "year",              type: "INTEGER" },
      { name: "population_mn",     type: "REAL"    },
      { name: "gdp_lakh_cr",       type: "REAL"    },
      { name: "per_capita_income", type: "INTEGER" },
      { name: "unemployment_rate", type: "REAL"    },
      { name: "poverty_rate",      type: "REAL"    },
      { name: "literacy_rate",     type: "REAL"    },
      { name: "urbanization_rate", type: "REAL"    },
    ],
  },
];

/**
 * getPracticeDb()
 * Returns the singleton practice database,
 * creating and seeding it on the first call.
 */
function getPracticeDb() {
  if (practiceDb) return practiceDb;

  const db = new Database(":memory:");

  // ── Day 8: book1 ──────────────────────────
  db.exec(`CREATE TABLE book1 (
    sno INTEGER, Party_Name TEXT, Contact_Name TEXT, Address TEXT
  )`);
  const b1 = db.prepare("INSERT INTO book1 VALUES (?,?,?,?)");
  [
    [1,'BJP','Ram','New Delhi'],[2,'INC','Shyam','Mumbai'],
    [3,'TMC','Kevin','Chennai'],[4,'SP','Abhishek','Kolkata'],
    [5,'AAP','Rohan','Surat'],[6,'AIADMK','Varunn','Chandigarh'],
    [7,'BJP','Amit','Pune'],[8,'INC','Sumit','Hyderabad'],
    [9,'AIADMK','Sushma','Kanyakumari'],[10,'AAP','Samarjeet','Amritsar'],
  ].forEach(r => b1.run(...r));

  // ── Day 8: book2 ──────────────────────────
  db.exec(`CREATE TABLE book2 (
    sno INTEGER, Party_Name TEXT, Contact_Name TEXT,
    Address TEXT, Campaign_Spending INTEGER
  )`);
  const b2 = db.prepare("INSERT INTO book2 VALUES (?,?,?,?,?)");
  [
    [1,'BJP','Ram','New Delhi',100000],[2,'INC','Shyam','Mumbai',101000],
    [3,'TMC','Kevin','Chennai',102010],[4,'SP','Abhishek','Kolkata',103030],
    [5,'AAP','Rohan','Surat',104060],[6,'AIADMK','Varunn','Chandigarh',105101],
    [7,'BJP','Amit','Pune',106152],[8,'INC','Sumit','Hyderabad',107214],
    [9,'AIADMK','Sushma','Kanyakumari',108286],[10,'AAP','Samarjeet','Amritsar',109369],
  ].forEach(r => b2.run(...r));

  // ── Day 9 & 10: remaining tables ──────────
  db.exec(`CREATE TABLE constituency_info (
    constituency_id INTEGER, constituency TEXT, state TEXT
  )`);
  db.exec(`CREATE TABLE election_results (
    constituency TEXT, constituency_id INTEGER,
    candidate TEXT, party TEXT, total_votes INTEGER, margin INTEGER
  )`);
  db.exec(`CREATE TABLE scheme_budget_utilization (
    scheme_id TEXT, scheme_name TEXT, ministry TEXT, state_code TEXT,
    year INTEGER, allocated_budget_cr REAL, utilized_budget_cr REAL,
    beneficiaries_lakh REAL, scheme_type TEXT
  )`);
  db.exec(`CREATE TABLE district_policy_outcomes (
    district_id TEXT, district_name TEXT, state_code TEXT, year INTEGER,
    health_index REAL, education_index REAL, nutrition_coverage_pct REAL,
    drinking_water_coverage_pct REAL, sanitation_coverage_pct REAL,
    crime_rate_per_100k INTEGER
  )`);
  db.exec(`CREATE TABLE state_year_policy_indicators (
    state_code TEXT, state_name TEXT, year INTEGER,
    population_mn REAL, gdp_lakh_cr REAL, per_capita_income INTEGER,
    unemployment_rate REAL, poverty_rate REAL,
    literacy_rate REAL, urbanization_rate REAL
  )`);

  // ── Bulk INSERT from CSV-derived data ─────
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH01','PM Awas Yojana','Housing','MH',2020,2035.2,1828.7,7.2,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH02','Jal Jeevan Mission','Jal Shakti','MH',2020,1180.6,1096.1,17.4,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH03','National Health Mission','Health','MH',2020,4021.3,3660.5,10.7,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH04','State Skill Program','Skill Development','MH',2020,5289.3,4852.9,13.0,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH05','Old Age Pension','Social Justice','MH',2020,933.3,834.7,10.7,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH01','PM Awas Yojana','Housing','MH',2021,2873.9,2659.6,14.3,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH02','Jal Jeevan Mission','Jal Shakti','MH',2021,3961.1,3760.8,20.7,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH03','National Health Mission','Health','MH',2021,4534.2,4417.3,2.4,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH04','State Skill Program','Skill Development','MH',2021,1818.0,1547.1,16.9,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH05','Old Age Pension','Social Justice','MH',2021,5469.8,4822.4,23.3,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH01','PM Awas Yojana','Housing','MH',2022,1113.4,1081.6,10.1,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH02','Jal Jeevan Mission','Jal Shakti','MH',2022,1327.4,1212.1,7.9,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH03','National Health Mission','Health','MH',2022,2281.3,2030.3,20.5,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH04','State Skill Program','Skill Development','MH',2022,3603.6,3208.9,16.0,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH05','Old Age Pension','Social Justice','MH',2022,4524.0,4005.7,11.5,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH01','PM Awas Yojana','Housing','MH',2023,1433.8,1252.5,17.7,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH02','Jal Jeevan Mission','Jal Shakti','MH',2023,1743.5,1601.0,18.3,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH03','National Health Mission','Health','MH',2023,1355.8,1252.4,7.9,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH04','State Skill Program','Skill Development','MH',2023,5807.2,5301.2,20.5,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH05','Old Age Pension','Social Justice','MH',2023,3661.2,3132.7,16.6,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH01','PM Awas Yojana','Housing','UP',2020,5747.3,5334.7,20.8,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH02','Jal Jeevan Mission','Jal Shakti','UP',2020,5397.9,4748.2,6.9,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH03','National Health Mission','Health','UP',2020,3977.1,3593.0,21.3,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH04','State Skill Program','Skill Development','UP',2020,5480.1,4909.9,7.4,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH05','Old Age Pension','Social Justice','UP',2020,4858.7,4303.5,20.9,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH01','PM Awas Yojana','Housing','UP',2021,3003.4,2813.6,4.2,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH02','Jal Jeevan Mission','Jal Shakti','UP',2021,4044.1,3675.0,15.5,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH03','National Health Mission','Health','UP',2021,1673.7,1583.0,21.8,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH04','State Skill Program','Skill Development','UP',2021,1927.0,1662.0,2.5,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH05','Old Age Pension','Social Justice','UP',2021,4138.3,3844.1,14.6,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH01','PM Awas Yojana','Housing','UP',2022,2006.1,1807.2,15.7,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH02','Jal Jeevan Mission','Jal Shakti','UP',2022,3383.2,3310.2,5.1,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH03','National Health Mission','Health','UP',2022,4414.8,3984.6,11.8,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH04','State Skill Program','Skill Development','UP',2022,4531.5,4259.7,24.8,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH05','Old Age Pension','Social Justice','UP',2022,1467.7,1267.4,18.7,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH01','PM Awas Yojana','Housing','UP',2023,3807.6,3372.2,3.8,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH02','Jal Jeevan Mission','Jal Shakti','UP',2023,1245.4,1203.4,6.4,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH03','National Health Mission','Health','UP',2023,2481.5,2182.4,10.2,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH04','State Skill Program','Skill Development','UP',2023,1161.0,1065.2,3.6,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH05','Old Age Pension','Social Justice','UP',2023,4961.9,4368.3,14.4,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH01','PM Awas Yojana','Housing','TN',2020,5376.4,5024.9,14.3,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH02','Jal Jeevan Mission','Jal Shakti','TN',2020,2486.5,2221.2,17.4,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH03','National Health Mission','Health','TN',2020,5969.5,5587.7,14.8,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH04','State Skill Program','Skill Development','TN',2020,4599.4,4187.6,3.4,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH05','Old Age Pension','Social Justice','TN',2020,3723.9,3629.0,6.0,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH01','PM Awas Yojana','Housing','TN',2021,4388.0,3844.4,14.3,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH02','Jal Jeevan Mission','Jal Shakti','TN',2021,1302.7,1183.6,19.4,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH03','National Health Mission','Health','TN',2021,2607.4,2441.6,20.3,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH04','State Skill Program','Skill Development','TN',2021,5621.3,4949.6,11.2,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH05','Old Age Pension','Social Justice','TN',2021,1592.6,1559.2,23.3,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH01','PM Awas Yojana','Housing','TN',2022,3607.8,3461.5,14.0,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH02','Jal Jeevan Mission','Jal Shakti','TN',2022,4042.6,3483.1,19.4,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH03','National Health Mission','Health','TN',2022,1464.1,1401.7,20.0,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH04','State Skill Program','Skill Development','TN',2022,4485.5,3833.7,9.0,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH05','Old Age Pension','Social Justice','TN',2022,2168.2,1944.5,4.0,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH01','PM Awas Yojana','Housing','TN',2023,5672.2,5229.7,9.0,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH02','Jal Jeevan Mission','Jal Shakti','TN',2023,2864.3,2601.2,15.8,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH03','National Health Mission','Health','TN',2023,3481.5,3375.4,13.4,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH04','State Skill Program','Skill Development','TN',2023,5959.2,5724.9,6.8,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH05','Old Age Pension','Social Justice','TN',2023,5639.1,4878.5,20.8,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH01','PM Awas Yojana','Housing','KA',2020,2779.2,2679.6,22.0,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH02','Jal Jeevan Mission','Jal Shakti','KA',2020,4990.8,4754.8,9.0,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH03','National Health Mission','Health','KA',2020,1220.8,1101.6,6.0,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH04','State Skill Program','Skill Development','KA',2020,4413.7,3950.3,24.4,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH05','Old Age Pension','Social Justice','KA',2020,4133.1,3955.0,5.0,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH01','PM Awas Yojana','Housing','KA',2021,5282.5,5123.8,13.2,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH02','Jal Jeevan Mission','Jal Shakti','KA',2021,3952.5,3752.6,6.0,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH03','National Health Mission','Health','KA',2021,3413.3,3078.2,5.4,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH04','State Skill Program','Skill Development','KA',2021,2711.2,2328.5,2.6,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH05','Old Age Pension','Social Justice','KA',2021,1502.9,1465.6,14.6,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH01','PM Awas Yojana','Housing','KA',2022,5822.3,5276.3,9.2,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH02','Jal Jeevan Mission','Jal Shakti','KA',2022,3431.9,3113.2,4.4,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH03','National Health Mission','Health','KA',2022,4132.3,3628.5,16.3,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH04','State Skill Program','Skill Development','KA',2022,4181.0,3636.5,3.4,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH05','Old Age Pension','Social Justice','KA',2022,4860.0,4421.5,3.3,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH01','PM Awas Yojana','Housing','KA',2023,5973.3,5122.2,18.0,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH02','Jal Jeevan Mission','Jal Shakti','KA',2023,5915.1,5211.8,5.3,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH03','National Health Mission','Health','KA',2023,1431.2,1272.9,4.3,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH04','State Skill Program','Skill Development','KA',2023,4399.2,3775.0,13.7,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH05','Old Age Pension','Social Justice','KA',2023,5982.8,5718.5,16.2,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH01','PM Awas Yojana','Housing','GJ',2020,2392.5,2227.7,14.1,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH02','Jal Jeevan Mission','Jal Shakti','GJ',2020,3015.6,2614.5,22.4,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH03','National Health Mission','Health','GJ',2020,3138.9,2747.5,10.5,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH04','State Skill Program','Skill Development','GJ',2020,2953.5,2828.2,18.9,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH05','Old Age Pension','Social Justice','GJ',2020,4800.4,4087.2,11.6,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH01','PM Awas Yojana','Housing','GJ',2021,3303.0,2815.8,8.0,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH02','Jal Jeevan Mission','Jal Shakti','GJ',2021,4753.5,4125.2,14.3,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH03','National Health Mission','Health','GJ',2021,1919.0,1634.2,7.5,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH04','State Skill Program','Skill Development','GJ',2021,5874.5,5605.5,24.1,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH05','Old Age Pension','Social Justice','GJ',2021,3336.8,2883.9,14.6,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH01','PM Awas Yojana','Housing','GJ',2022,3162.8,3035.5,4.3,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH02','Jal Jeevan Mission','Jal Shakti','GJ',2022,3338.9,2903.2,9.5,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH03','National Health Mission','Health','GJ',2022,4634.3,4225.9,10.6,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH04','State Skill Program','Skill Development','GJ',2022,2851.3,2593.9,20.1,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH05','Old Age Pension','Social Justice','GJ',2022,5438.8,5298.5,20.1,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH01','PM Awas Yojana','Housing','GJ',2023,2440.1,2292.4,12.1,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH02','Jal Jeevan Mission','Jal Shakti','GJ',2023,2124.3,2037.9,2.9,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH03','National Health Mission','Health','GJ',2023,5489.2,4995.1,16.7,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH04','State Skill Program','Skill Development','GJ',2023,4228.6,4086.4,16.6,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH05','Old Age Pension','Social Justice','GJ',2023,3992.5,3428.2,13.9,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH01','PM Awas Yojana','Housing','RJ',2020,1580.9,1495.3,13.8,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH02','Jal Jeevan Mission','Jal Shakti','RJ',2020,4337.2,3710.1,4.0,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH03','National Health Mission','Health','RJ',2020,4524.9,3888.6,3.6,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH04','State Skill Program','Skill Development','RJ',2020,863.0,840.8,19.0,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH05','Old Age Pension','Social Justice','RJ',2020,2636.9,2343.0,10.0,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH01','PM Awas Yojana','Housing','RJ',2021,4828.2,4519.1,6.3,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH02','Jal Jeevan Mission','Jal Shakti','RJ',2021,1705.4,1471.4,17.2,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH03','National Health Mission','Health','RJ',2021,4774.7,4223.0,2.5,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH04','State Skill Program','Skill Development','RJ',2021,1227.3,1197.6,8.8,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH05','Old Age Pension','Social Justice','RJ',2021,4800.0,4469.8,10.8,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH01','PM Awas Yojana','Housing','RJ',2022,1869.6,1618.6,16.1,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH02','Jal Jeevan Mission','Jal Shakti','RJ',2022,4828.1,4508.0,14.2,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH03','National Health Mission','Health','RJ',2022,1018.1,993.6,20.4,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH04','State Skill Program','Skill Development','RJ',2022,2322.7,2270.2,15.8,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH05','Old Age Pension','Social Justice','RJ',2022,3828.6,3626.6,20.7,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH01','PM Awas Yojana','Housing','RJ',2023,4213.7,3651.8,9.8,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH02','Jal Jeevan Mission','Jal Shakti','RJ',2023,5626.0,4946.4,10.6,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH03','National Health Mission','Health','RJ',2023,3046.8,2763.8,16.1,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH04','State Skill Program','Skill Development','RJ',2023,5704.0,5026.9,4.8,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH05','Old Age Pension','Social Justice','RJ',2023,1826.8,1763.5,16.9,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH01','PM Awas Yojana','Housing','WB',2020,2286.7,2186.3,21.8,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH02','Jal Jeevan Mission','Jal Shakti','WB',2020,5201.9,5043.0,7.8,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH03','National Health Mission','Health','WB',2020,4726.2,4300.2,21.4,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH04','State Skill Program','Skill Development','WB',2020,4588.2,4363.0,17.1,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH05','Old Age Pension','Social Justice','WB',2020,1722.6,1586.3,24.6,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH01','PM Awas Yojana','Housing','WB',2021,5674.4,4855.1,5.8,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH02','Jal Jeevan Mission','Jal Shakti','WB',2021,1485.0,1402.4,20.8,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH03','National Health Mission','Health','WB',2021,1910.3,1749.3,21.3,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH04','State Skill Program','Skill Development','WB',2021,4610.6,4244.0,15.6,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH05','Old Age Pension','Social Justice','WB',2021,3443.5,3060.2,15.0,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH01','PM Awas Yojana','Housing','WB',2022,4382.2,4222.4,16.6,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH02','Jal Jeevan Mission','Jal Shakti','WB',2022,4757.8,4143.2,12.6,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH03','National Health Mission','Health','WB',2022,848.5,748.5,18.7,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH04','State Skill Program','Skill Development','WB',2022,5957.4,5140.6,11.2,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH05','Old Age Pension','Social Justice','WB',2022,4960.4,4347.9,14.8,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH01','PM Awas Yojana','Housing','WB',2023,4612.0,4289.5,6.3,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH02','Jal Jeevan Mission','Jal Shakti','WB',2023,2648.0,2520.6,14.7,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH03','National Health Mission','Health','WB',2023,827.2,784.9,2.8,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH04','State Skill Program','Skill Development','WB',2023,4677.8,4099.3,24.0,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH05','Old Age Pension','Social Justice','WB',2023,2713.3,2421.6,5.4,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH01','PM Awas Yojana','Housing','MP',2020,2389.1,2303.0,24.9,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH02','Jal Jeevan Mission','Jal Shakti','MP',2020,2715.2,2466.3,18.6,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH03','National Health Mission','Health','MP',2020,5408.2,5013.9,11.0,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH04','State Skill Program','Skill Development','MP',2020,2945.6,2770.2,2.1,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH05','Old Age Pension','Social Justice','MP',2020,4021.9,3604.5,20.3,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH01','PM Awas Yojana','Housing','MP',2021,1283.6,1189.2,13.1,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH02','Jal Jeevan Mission','Jal Shakti','MP',2021,4140.1,3554.0,15.3,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH03','National Health Mission','Health','MP',2021,3719.7,3432.9,15.9,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH04','State Skill Program','Skill Development','MP',2021,4317.6,4121.8,8.2,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH05','Old Age Pension','Social Justice','MP',2021,5090.3,4656.4,3.8,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH01','PM Awas Yojana','Housing','MP',2022,1104.5,986.8,20.1,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH02','Jal Jeevan Mission','Jal Shakti','MP',2022,4479.9,4267.2,13.9,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH03','National Health Mission','Health','MP',2022,3089.0,2684.9,9.5,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH04','State Skill Program','Skill Development','MP',2022,3056.9,2633.6,7.1,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH05','Old Age Pension','Social Justice','MP',2022,3910.8,3698.2,25.0,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH01','PM Awas Yojana','Housing','MP',2023,5652.2,5276.5,11.7,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH02','Jal Jeevan Mission','Jal Shakti','MP',2023,4108.1,3911.5,4.7,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH03','National Health Mission','Health','MP',2023,2931.5,2811.8,10.8,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH04','State Skill Program','Skill Development','MP',2023,3773.7,3496.0,6.2,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH05','Old Age Pension','Social Justice','MP',2023,2683.6,2397.8,2.6,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH01','PM Awas Yojana','Housing','PB',2020,925.8,887.0,8.3,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH02','Jal Jeevan Mission','Jal Shakti','PB',2020,3494.0,3105.6,23.6,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH03','National Health Mission','Health','PB',2020,2148.3,1946.1,22.1,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH04','State Skill Program','Skill Development','PB',2020,5178.1,4526.6,20.5,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH05','Old Age Pension','Social Justice','PB',2020,3182.6,2905.0,5.1,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH01','PM Awas Yojana','Housing','PB',2021,1219.1,1151.6,13.4,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH02','Jal Jeevan Mission','Jal Shakti','PB',2021,3071.6,2902.2,19.6,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH03','National Health Mission','Health','PB',2021,1626.3,1511.4,5.1,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH04','State Skill Program','Skill Development','PB',2021,4707.2,4403.1,24.0,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH05','Old Age Pension','Social Justice','PB',2021,1158.6,993.4,8.5,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH01','PM Awas Yojana','Housing','PB',2022,2160.9,1906.1,22.8,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH02','Jal Jeevan Mission','Jal Shakti','PB',2022,2097.6,1857.2,19.5,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH03','National Health Mission','Health','PB',2022,3138.6,2984.8,3.5,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH04','State Skill Program','Skill Development','PB',2022,3335.4,2849.6,3.4,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH05','Old Age Pension','Social Justice','PB',2022,5513.5,4786.3,14.2,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH01','PM Awas Yojana','Housing','PB',2023,2937.7,2629.7,22.7,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH02','Jal Jeevan Mission','Jal Shakti','PB',2023,913.5,855.3,24.2,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH03','National Health Mission','Health','PB',2023,3712.9,3608.1,3.2,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH04','State Skill Program','Skill Development','PB',2023,2977.7,2631.8,18.8,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH05','Old Age Pension','Social Justice','PB',2023,5902.7,5214.2,17.0,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH01','PM Awas Yojana','Housing','HR',2020,1830.1,1690.1,12.7,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH02','Jal Jeevan Mission','Jal Shakti','HR',2020,5854.4,5439.4,10.0,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH03','National Health Mission','Health','HR',2020,1393.3,1211.7,7.2,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH04','State Skill Program','Skill Development','HR',2020,2105.0,2022.0,14.9,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH05','Old Age Pension','Social Justice','HR',2020,3521.6,3045.9,21.8,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH01','PM Awas Yojana','Housing','HR',2021,4558.6,3914.9,18.3,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH02','Jal Jeevan Mission','Jal Shakti','HR',2021,3626.4,3121.0,12.5,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH03','National Health Mission','Health','HR',2021,3320.4,2893.9,23.8,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH04','State Skill Program','Skill Development','HR',2021,5219.9,4890.9,12.6,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH05','Old Age Pension','Social Justice','HR',2021,2941.2,2748.9,14.5,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH01','PM Awas Yojana','Housing','HR',2022,1123.8,1030.1,20.5,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH02','Jal Jeevan Mission','Jal Shakti','HR',2022,3188.0,2731.4,20.1,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH03','National Health Mission','Health','HR',2022,1847.1,1632.1,5.8,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH04','State Skill Program','Skill Development','HR',2022,2517.1,2387.2,13.9,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH05','Old Age Pension','Social Justice','HR',2022,1865.4,1798.4,22.2,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH01','PM Awas Yojana','Housing','HR',2023,5327.0,4693.3,12.4,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH02','Jal Jeevan Mission','Jal Shakti','HR',2023,5921.9,5628.0,2.6,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH03','National Health Mission','Health','HR',2023,1139.1,1036.9,22.9,'CSS')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH04','State Skill Program','Skill Development','HR',2023,3601.2,3294.1,4.4,'State')");
  db.exec("INSERT INTO scheme_budget_utilization VALUES ('SCH05','Old Age Pension','Social Justice','HR',2023,4215.3,4033.5,10.7,'State')");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('MH01','District_MH_1','MH',2020,55.9,61.0,93.0,83.6,73.6,305)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('MH01','District_MH_1','MH',2021,78.1,66.0,87.4,77.0,71.4,307)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('MH01','District_MH_1','MH',2022,71.2,77.8,90.3,98.4,84.5,257)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('MH01','District_MH_1','MH',2023,78.9,67.6,82.3,76.9,70.7,411)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('MH02','District_MH_2','MH',2020,80.1,79.5,81.5,79.2,74.4,240)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('MH02','District_MH_2','MH',2021,71.5,80.0,88.5,81.7,96.7,357)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('MH02','District_MH_2','MH',2022,71.6,77.1,81.7,80.9,80.0,361)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('MH02','District_MH_2','MH',2023,55.4,63.3,71.3,76.0,94.0,348)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('MH03','District_MH_3','MH',2020,69.2,62.7,83.8,86.4,74.8,284)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('MH03','District_MH_3','MH',2021,67.0,77.2,87.8,76.1,80.5,330)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('MH03','District_MH_3','MH',2022,70.1,84.0,88.4,78.9,72.0,334)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('MH03','District_MH_3','MH',2023,55.8,76.4,96.3,88.8,80.9,334)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('MH04','District_MH_4','MH',2020,68.7,75.3,96.4,84.3,96.9,397)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('MH04','District_MH_4','MH',2021,60.9,61.9,72.8,75.4,72.6,343)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('MH04','District_MH_4','MH',2022,57.1,68.9,93.7,75.6,92.8,247)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('MH04','District_MH_4','MH',2023,58.5,79.5,87.6,96.1,90.6,372)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('MH05','District_MH_5','MH',2020,63.5,65.0,91.0,94.4,97.7,279)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('MH05','District_MH_5','MH',2021,66.2,81.7,79.5,97.3,94.0,282)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('MH05','District_MH_5','MH',2022,77.5,81.1,72.9,96.7,84.1,378)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('MH05','District_MH_5','MH',2023,64.6,85.1,80.9,75.3,95.4,201)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('UP01','District_UP_1','UP',2020,64.6,86.6,96.6,88.8,87.7,287)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('UP01','District_UP_1','UP',2021,63.8,69.2,88.8,93.1,92.2,369)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('UP01','District_UP_1','UP',2022,57.7,73.8,71.6,88.2,82.4,393)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('UP01','District_UP_1','UP',2023,65.5,63.3,74.0,93.3,87.3,204)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('UP02','District_UP_2','UP',2020,57.5,79.6,72.0,94.7,89.8,199)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('UP02','District_UP_2','UP',2021,57.5,87.6,80.5,83.9,92.8,407)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('UP02','District_UP_2','UP',2022,84.6,81.1,80.5,77.0,91.8,314)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('UP02','District_UP_2','UP',2023,67.7,85.4,73.1,86.8,70.3,292)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('UP03','District_UP_3','UP',2020,56.7,63.3,73.3,90.6,90.9,320)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('UP03','District_UP_3','UP',2021,83.9,70.5,78.0,95.8,76.3,411)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('UP03','District_UP_3','UP',2022,55.4,87.2,71.2,96.4,84.8,418)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('UP03','District_UP_3','UP',2023,57.2,75.5,97.1,87.6,87.6,346)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('UP04','District_UP_4','UP',2020,68.6,77.6,86.4,96.6,71.3,247)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('UP04','District_UP_4','UP',2021,83.5,84.9,82.8,89.9,77.8,225)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('UP04','District_UP_4','UP',2022,68.9,69.9,86.3,76.9,97.3,416)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('UP04','District_UP_4','UP',2023,75.9,75.0,78.7,94.5,89.2,219)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('UP05','District_UP_5','UP',2020,82.3,83.0,96.6,92.4,87.2,280)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('UP05','District_UP_5','UP',2021,83.0,84.2,71.3,75.6,80.5,374)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('UP05','District_UP_5','UP',2022,84.6,64.2,86.6,84.1,97.2,382)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('UP05','District_UP_5','UP',2023,80.1,73.1,81.6,81.6,71.6,387)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('TN01','District_TN_1','TN',2020,79.4,88.0,97.9,88.3,91.5,406)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('TN01','District_TN_1','TN',2021,80.5,66.9,82.6,78.1,96.7,325)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('TN01','District_TN_1','TN',2022,61.9,78.8,87.3,83.6,73.2,341)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('TN01','District_TN_1','TN',2023,70.6,81.6,84.6,95.5,85.5,314)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('TN02','District_TN_2','TN',2020,81.3,71.3,73.8,75.7,91.1,328)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('TN02','District_TN_2','TN',2021,76.1,66.0,73.8,75.3,79.8,321)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('TN02','District_TN_2','TN',2022,66.8,72.2,95.3,83.4,84.4,368)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('TN02','District_TN_2','TN',2023,66.9,77.4,94.1,97.8,74.1,402)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('TN03','District_TN_3','TN',2020,69.8,67.2,82.9,98.5,83.8,258)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('TN03','District_TN_3','TN',2021,74.0,66.7,72.1,78.1,73.6,216)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('TN03','District_TN_3','TN',2022,59.2,77.9,75.1,83.3,95.1,293)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('TN03','District_TN_3','TN',2023,75.0,64.8,75.4,76.0,74.7,246)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('TN04','District_TN_4','TN',2020,60.3,62.5,73.4,86.1,75.8,267)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('TN04','District_TN_4','TN',2021,70.1,79.3,71.1,94.2,87.6,199)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('TN04','District_TN_4','TN',2022,81.2,85.8,71.7,81.6,92.6,359)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('TN04','District_TN_4','TN',2023,60.5,65.9,80.4,86.6,87.3,268)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('TN05','District_TN_5','TN',2020,68.9,80.9,71.0,81.1,90.0,394)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('TN05','District_TN_5','TN',2021,70.4,74.9,73.0,85.7,84.9,238)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('TN05','District_TN_5','TN',2022,63.1,70.6,70.6,82.7,75.9,258)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('TN05','District_TN_5','TN',2023,58.6,84.9,86.6,91.3,92.1,299)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('KA01','District_KA_1','KA',2020,57.6,75.0,86.4,92.9,82.1,210)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('KA01','District_KA_1','KA',2021,63.5,70.2,88.1,88.7,80.0,416)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('KA01','District_KA_1','KA',2022,73.2,66.6,72.8,78.7,76.9,218)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('KA01','District_KA_1','KA',2023,60.6,68.0,74.9,96.5,72.2,305)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('KA02','District_KA_2','KA',2020,67.3,87.5,73.1,84.5,97.1,387)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('KA02','District_KA_2','KA',2021,79.5,67.2,74.8,91.0,96.0,313)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('KA02','District_KA_2','KA',2022,72.1,67.8,91.5,79.5,79.1,282)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('KA02','District_KA_2','KA',2023,70.2,66.8,73.2,89.7,78.1,319)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('KA03','District_KA_3','KA',2020,59.6,73.5,84.9,76.2,79.4,212)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('KA03','District_KA_3','KA',2021,56.9,87.7,79.0,94.4,77.1,343)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('KA03','District_KA_3','KA',2022,77.8,76.7,83.2,84.9,79.8,403)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('KA03','District_KA_3','KA',2023,79.9,87.0,73.5,92.5,96.3,223)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('KA04','District_KA_4','KA',2020,57.0,80.8,86.1,95.2,73.9,370)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('KA04','District_KA_4','KA',2021,61.0,64.6,74.6,94.5,88.6,305)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('KA04','District_KA_4','KA',2022,65.8,84.6,81.0,94.6,82.3,270)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('KA04','District_KA_4','KA',2023,68.9,68.4,90.9,87.1,76.5,395)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('KA05','District_KA_5','KA',2020,66.5,75.2,95.4,90.0,73.3,405)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('KA05','District_KA_5','KA',2021,73.8,69.4,73.9,94.1,87.4,308)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('KA05','District_KA_5','KA',2022,81.8,82.1,74.2,82.5,77.0,358)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('KA05','District_KA_5','KA',2023,56.0,76.0,91.3,96.0,79.6,377)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('GJ01','District_GJ_1','GJ',2020,58.3,83.7,73.6,84.5,92.3,215)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('GJ01','District_GJ_1','GJ',2021,61.9,80.2,90.2,90.4,89.4,310)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('GJ01','District_GJ_1','GJ',2022,62.6,69.7,75.1,96.8,86.3,276)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('GJ01','District_GJ_1','GJ',2023,68.9,86.5,74.3,89.1,84.2,326)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('GJ02','District_GJ_2','GJ',2020,55.5,84.4,96.1,88.6,89.5,401)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('GJ02','District_GJ_2','GJ',2021,76.2,64.3,86.1,89.6,81.9,356)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('GJ02','District_GJ_2','GJ',2022,83.0,85.9,82.6,77.7,97.6,381)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('GJ02','District_GJ_2','GJ',2023,58.7,85.8,94.4,87.5,86.6,275)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('GJ03','District_GJ_3','GJ',2020,56.6,69.4,92.5,75.1,79.3,275)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('GJ03','District_GJ_3','GJ',2021,71.1,85.8,79.7,83.3,90.7,288)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('GJ03','District_GJ_3','GJ',2022,61.7,72.7,73.9,79.2,84.0,280)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('GJ03','District_GJ_3','GJ',2023,82.4,70.1,86.3,90.2,70.4,339)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('GJ04','District_GJ_4','GJ',2020,60.3,86.9,74.2,85.0,72.4,419)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('GJ04','District_GJ_4','GJ',2021,70.1,76.7,71.9,93.0,75.9,395)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('GJ04','District_GJ_4','GJ',2022,61.2,65.3,71.0,86.3,85.8,195)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('GJ04','District_GJ_4','GJ',2023,78.3,72.7,84.7,85.6,81.2,314)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('GJ05','District_GJ_5','GJ',2020,59.7,65.1,94.1,97.7,80.5,244)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('GJ05','District_GJ_5','GJ',2021,74.3,71.4,70.7,78.7,90.0,338)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('GJ05','District_GJ_5','GJ',2022,55.8,66.2,76.5,91.1,70.6,204)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('GJ05','District_GJ_5','GJ',2023,79.0,65.0,88.3,80.7,72.8,238)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('RJ01','District_RJ_1','RJ',2020,76.7,84.0,93.2,84.5,88.7,229)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('RJ01','District_RJ_1','RJ',2021,63.8,85.1,70.4,77.1,75.8,186)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('RJ01','District_RJ_1','RJ',2022,60.4,76.3,81.8,96.4,92.9,262)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('RJ01','District_RJ_1','RJ',2023,62.8,70.6,86.5,81.4,87.5,278)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('RJ02','District_RJ_2','RJ',2020,71.6,72.2,78.2,97.8,91.4,213)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('RJ02','District_RJ_2','RJ',2021,81.1,73.6,95.0,94.2,81.9,185)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('RJ02','District_RJ_2','RJ',2022,63.1,75.2,87.7,81.2,73.9,380)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('RJ02','District_RJ_2','RJ',2023,84.5,74.7,74.8,81.5,70.5,399)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('RJ03','District_RJ_3','RJ',2020,58.5,76.1,77.7,88.3,88.2,379)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('RJ03','District_RJ_3','RJ',2021,61.2,60.3,73.8,96.6,94.5,323)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('RJ03','District_RJ_3','RJ',2022,73.0,78.6,74.9,96.9,81.7,271)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('RJ03','District_RJ_3','RJ',2023,70.6,61.3,74.7,92.7,72.3,324)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('RJ04','District_RJ_4','RJ',2020,62.4,70.9,78.1,83.5,90.1,251)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('RJ04','District_RJ_4','RJ',2021,72.0,73.3,88.6,97.5,90.5,231)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('RJ04','District_RJ_4','RJ',2022,55.9,67.3,86.7,76.2,83.9,323)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('RJ04','District_RJ_4','RJ',2023,65.0,81.6,73.0,76.8,90.4,298)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('RJ05','District_RJ_5','RJ',2020,75.7,72.2,76.9,94.7,92.4,346)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('RJ05','District_RJ_5','RJ',2021,63.2,76.5,80.1,77.2,95.7,212)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('RJ05','District_RJ_5','RJ',2022,83.5,72.5,75.2,88.0,94.4,355)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('RJ05','District_RJ_5','RJ',2023,79.2,78.4,89.4,95.4,77.0,297)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('WB01','District_WB_1','WB',2020,61.6,87.7,96.4,75.9,89.8,402)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('WB01','District_WB_1','WB',2021,60.4,75.9,95.6,75.8,89.5,251)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('WB01','District_WB_1','WB',2022,82.7,87.2,96.4,86.4,94.1,382)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('WB01','District_WB_1','WB',2023,64.6,83.2,71.0,89.3,76.4,208)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('WB02','District_WB_2','WB',2020,57.3,79.5,79.5,92.4,71.8,255)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('WB02','District_WB_2','WB',2021,71.2,82.1,78.9,90.0,94.8,327)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('WB02','District_WB_2','WB',2022,62.0,60.7,94.4,75.5,94.5,306)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('WB02','District_WB_2','WB',2023,83.2,82.4,97.9,83.4,91.5,276)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('WB03','District_WB_3','WB',2020,69.4,77.6,94.5,98.6,91.5,280)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('WB03','District_WB_3','WB',2021,67.6,80.7,76.7,77.7,79.9,248)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('WB03','District_WB_3','WB',2022,63.9,66.5,71.2,75.4,97.7,282)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('WB03','District_WB_3','WB',2023,66.5,79.0,76.1,97.8,92.0,201)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('WB04','District_WB_4','WB',2020,67.5,84.6,96.5,86.2,87.2,220)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('WB04','District_WB_4','WB',2021,84.7,66.5,96.4,90.6,87.0,303)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('WB04','District_WB_4','WB',2022,61.9,64.9,76.2,79.5,91.8,264)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('WB04','District_WB_4','WB',2023,56.7,87.1,94.7,97.3,97.9,221)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('WB05','District_WB_5','WB',2020,66.9,81.2,89.5,78.7,92.8,233)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('WB05','District_WB_5','WB',2021,61.7,75.0,86.6,88.9,72.6,390)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('WB05','District_WB_5','WB',2022,63.0,63.6,94.9,97.9,94.1,374)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('WB05','District_WB_5','WB',2023,74.7,75.4,72.4,84.8,80.4,242)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('MP01','District_MP_1','MP',2020,76.7,73.9,72.3,80.3,89.1,198)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('MP01','District_MP_1','MP',2021,80.5,73.9,83.5,89.2,93.1,263)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('MP01','District_MP_1','MP',2022,75.3,75.8,77.5,96.1,92.3,338)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('MP01','District_MP_1','MP',2023,80.5,84.3,89.8,95.1,89.5,343)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('MP02','District_MP_2','MP',2020,73.6,81.1,74.4,96.1,94.4,187)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('MP02','District_MP_2','MP',2021,79.8,63.6,79.4,92.8,74.5,376)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('MP02','District_MP_2','MP',2022,80.0,74.2,70.2,81.9,87.3,415)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('MP02','District_MP_2','MP',2023,74.0,67.3,87.8,88.0,91.8,205)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('MP03','District_MP_3','MP',2020,77.8,75.2,97.0,83.2,87.7,403)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('MP03','District_MP_3','MP',2021,58.1,86.2,89.3,76.6,78.4,349)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('MP03','District_MP_3','MP',2022,57.0,76.3,79.7,89.9,71.3,389)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('MP03','District_MP_3','MP',2023,84.2,87.1,91.0,78.1,91.2,185)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('MP04','District_MP_4','MP',2020,55.7,69.1,83.7,93.5,89.1,287)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('MP04','District_MP_4','MP',2021,63.2,87.9,81.9,85.8,74.6,370)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('MP04','District_MP_4','MP',2022,75.8,66.2,72.3,91.3,88.3,245)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('MP04','District_MP_4','MP',2023,83.5,64.2,82.1,97.6,81.8,333)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('MP05','District_MP_5','MP',2020,66.9,67.7,97.6,84.8,95.0,235)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('MP05','District_MP_5','MP',2021,61.4,60.9,88.2,83.8,94.2,293)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('MP05','District_MP_5','MP',2022,84.0,65.2,94.3,93.6,91.6,382)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('MP05','District_MP_5','MP',2023,77.8,77.5,73.7,75.8,95.8,327)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('PB01','District_PB_1','PB',2020,78.9,73.5,73.3,78.0,89.2,283)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('PB01','District_PB_1','PB',2021,61.0,73.8,71.8,89.0,77.5,371)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('PB01','District_PB_1','PB',2022,64.3,72.7,70.3,76.7,81.0,295)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('PB01','District_PB_1','PB',2023,73.0,68.2,89.5,95.6,91.8,189)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('PB02','District_PB_2','PB',2020,69.4,62.9,76.8,98.7,74.0,299)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('PB02','District_PB_2','PB',2021,73.5,79.7,85.7,75.2,79.1,304)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('PB02','District_PB_2','PB',2022,57.6,69.8,70.9,76.9,81.1,211)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('PB02','District_PB_2','PB',2023,72.0,79.3,92.4,79.8,74.7,205)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('PB03','District_PB_3','PB',2020,74.1,79.8,70.9,97.5,71.5,309)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('PB03','District_PB_3','PB',2021,76.3,84.4,90.0,94.2,79.5,375)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('PB03','District_PB_3','PB',2022,57.4,85.1,85.3,94.6,82.7,334)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('PB03','District_PB_3','PB',2023,70.8,80.5,72.3,76.4,76.9,218)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('PB04','District_PB_4','PB',2020,81.2,66.1,97.3,83.1,75.1,369)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('PB04','District_PB_4','PB',2021,74.8,73.9,85.6,92.3,76.4,419)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('PB04','District_PB_4','PB',2022,84.2,78.2,75.6,91.3,72.0,187)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('PB04','District_PB_4','PB',2023,62.7,73.0,94.3,92.5,90.8,282)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('PB05','District_PB_5','PB',2020,65.4,70.4,97.7,76.0,94.3,318)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('PB05','District_PB_5','PB',2021,68.2,80.3,83.6,96.0,95.2,281)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('PB05','District_PB_5','PB',2022,63.3,76.6,95.5,80.1,87.4,331)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('PB05','District_PB_5','PB',2023,77.0,63.7,90.0,96.8,75.0,237)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('HR01','District_HR_1','HR',2020,84.1,65.1,93.9,86.8,76.9,388)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('HR01','District_HR_1','HR',2021,68.4,74.4,80.1,89.2,74.6,273)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('HR01','District_HR_1','HR',2022,84.1,67.2,88.4,82.8,91.7,211)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('HR01','District_HR_1','HR',2023,84.1,72.7,76.6,76.8,74.8,304)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('HR02','District_HR_2','HR',2020,65.1,83.2,82.1,81.0,87.3,349)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('HR02','District_HR_2','HR',2021,60.0,64.7,71.0,92.7,88.6,293)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('HR02','District_HR_2','HR',2022,80.3,82.6,86.4,95.8,75.8,206)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('HR02','District_HR_2','HR',2023,63.1,61.6,84.9,97.5,71.1,209)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('HR03','District_HR_3','HR',2020,68.6,86.1,78.9,87.2,71.2,215)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('HR03','District_HR_3','HR',2021,84.6,87.0,70.1,97.8,87.9,388)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('HR03','District_HR_3','HR',2022,68.6,74.4,83.7,91.0,73.9,187)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('HR03','District_HR_3','HR',2023,64.2,79.7,75.7,91.2,97.2,202)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('HR04','District_HR_4','HR',2020,75.2,72.4,94.3,79.3,89.4,381)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('HR04','District_HR_4','HR',2021,83.3,79.1,83.9,89.8,94.3,316)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('HR04','District_HR_4','HR',2022,55.9,86.1,89.3,91.2,76.0,338)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('HR04','District_HR_4','HR',2023,66.8,78.2,73.0,90.8,98.0,191)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('HR05','District_HR_5','HR',2020,84.3,71.4,94.4,93.8,85.9,357)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('HR05','District_HR_5','HR',2021,81.4,71.3,79.2,91.0,92.6,362)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('HR05','District_HR_5','HR',2022,78.9,72.2,92.9,77.9,85.2,181)");
  db.exec("INSERT INTO district_policy_outcomes VALUES ('HR05','District_HR_5','HR',2023,64.7,70.3,81.1,91.7,80.9,287)");
  db.exec("INSERT INTO state_year_policy_indicators VALUES ('MH','Maharashtra',2020,63.0,31.42,195718,3.8,13.9,66.5,50.3)");
  db.exec("INSERT INTO state_year_policy_indicators VALUES ('MH','Maharashtra',2021,61.6,30.66,74322,7.8,30.8,70.3,26.4)");
  db.exec("INSERT INTO state_year_policy_indicators VALUES ('MH','Maharashtra',2022,59.9,17.74,180198,5.2,17.3,80.3,24.9)");
  db.exec("INSERT INTO state_year_policy_indicators VALUES ('MH','Maharashtra',2023,60.4,19.72,165774,6.9,15.0,77.9,40.7)");
  db.exec("INSERT INTO state_year_policy_indicators VALUES ('UP','Uttar Pradesh',2020,25.5,13.46,83660,7.7,34.1,85.2,30.7)");
  db.exec("INSERT INTO state_year_policy_indicators VALUES ('UP','Uttar Pradesh',2021,23.5,29.9,162432,3.6,22.4,65.9,51.8)");
  db.exec("INSERT INTO state_year_policy_indicators VALUES ('UP','Uttar Pradesh',2022,24.1,29.2,135459,5.6,23.7,69.6,53.9)");
  db.exec("INSERT INTO state_year_policy_indicators VALUES ('UP','Uttar Pradesh',2023,26.2,38.06,257913,6.0,33.0,67.2,26.9)");
  db.exec("INSERT INTO state_year_policy_indicators VALUES ('TN','Tamil Nadu',2020,24.3,20.44,126983,7.1,18.9,72.0,39.0)");
  db.exec("INSERT INTO state_year_policy_indicators VALUES ('TN','Tamil Nadu',2021,23.5,33.67,85655,7.9,29.3,70.0,20.2)");
  db.exec("INSERT INTO state_year_policy_indicators VALUES ('TN','Tamil Nadu',2022,26.2,30.62,223091,6.9,11.9,74.0,24.1)");
  db.exec("INSERT INTO state_year_policy_indicators VALUES ('TN','Tamil Nadu',2023,26.4,27.95,139488,3.3,17.8,73.1,45.5)");
  db.exec("INSERT INTO state_year_policy_indicators VALUES ('KA','Karnataka',2020,91.7,23.11,95114,6.6,29.0,79.0,47.0)");
  db.exec("INSERT INTO state_year_policy_indicators VALUES ('KA','Karnataka',2021,90.1,24.73,159783,3.1,12.7,65.8,42.3)");
  db.exec("INSERT INTO state_year_policy_indicators VALUES ('KA','Karnataka',2022,89.4,24.27,260588,4.2,20.3,83.9,28.0)");
  db.exec("INSERT INTO state_year_policy_indicators VALUES ('KA','Karnataka',2023,88.4,17.27,103856,7.6,30.2,80.8,50.5)");
  db.exec("INSERT INTO state_year_policy_indicators VALUES ('GJ','Gujarat',2020,107.2,36.56,183261,7.0,32.4,73.0,23.9)");
  db.exec("INSERT INTO state_year_policy_indicators VALUES ('GJ','Gujarat',2021,107.3,21.67,241783,7.3,10.2,77.8,34.6)");
  db.exec("INSERT INTO state_year_policy_indicators VALUES ('GJ','Gujarat',2022,107.3,11.84,140899,7.7,18.1,78.0,44.6)");
  db.exec("INSERT INTO state_year_policy_indicators VALUES ('GJ','Gujarat',2023,107.9,39.1,272113,4.3,22.4,72.5,30.0)");
  db.exec("INSERT INTO state_year_policy_indicators VALUES ('RJ','Rajasthan',2020,24.5,24.09,80810,4.4,32.7,71.0,25.1)");
  db.exec("INSERT INTO state_year_policy_indicators VALUES ('RJ','Rajasthan',2021,24.0,39.54,120831,6.4,29.0,70.9,45.5)");
  db.exec("INSERT INTO state_year_policy_indicators VALUES ('RJ','Rajasthan',2022,23.5,28.23,203041,5.7,12.3,85.9,31.2)");
  db.exec("INSERT INTO state_year_policy_indicators VALUES ('RJ','Rajasthan',2023,22.8,9.3,194087,6.4,10.4,77.8,27.9)");
  db.exec("INSERT INTO state_year_policy_indicators VALUES ('WB','West Bengal',2020,89.7,30.11,151214,7.7,13.4,73.5,24.0)");
  db.exec("INSERT INTO state_year_policy_indicators VALUES ('WB','West Bengal',2021,92.7,36.07,124167,6.3,30.4,78.9,38.5)");
  db.exec("INSERT INTO state_year_policy_indicators VALUES ('WB','West Bengal',2022,89.9,10.98,258415,7.5,25.8,73.5,32.2)");
  db.exec("INSERT INTO state_year_policy_indicators VALUES ('WB','West Bengal',2023,91.9,36.71,256288,6.9,26.1,67.1,25.7)");
  db.exec("INSERT INTO state_year_policy_indicators VALUES ('MP','Madhya Pradesh',2020,119.3,8.29,91309,6.3,10.1,69.0,39.2)");
  db.exec("INSERT INTO state_year_policy_indicators VALUES ('MP','Madhya Pradesh',2021,119.6,28.86,117096,6.6,15.9,73.1,46.1)");
  db.exec("INSERT INTO state_year_policy_indicators VALUES ('MP','Madhya Pradesh',2022,119.4,35.18,208098,5.8,12.3,74.2,29.3)");
  db.exec("INSERT INTO state_year_policy_indicators VALUES ('MP','Madhya Pradesh',2023,117.8,39.14,152550,7.5,25.8,84.9,37.6)");
  db.exec("INSERT INTO state_year_policy_indicators VALUES ('PB','Punjab',2020,83.4,14.25,221714,4.4,10.6,81.1,26.2)");
  db.exec("INSERT INTO state_year_policy_indicators VALUES ('PB','Punjab',2021,85.2,38.53,262121,4.9,10.4,88.2,35.0)");
  db.exec("INSERT INTO state_year_policy_indicators VALUES ('PB','Punjab',2022,85.3,38.84,249131,4.5,19.6,86.3,31.1)");
  db.exec("INSERT INTO state_year_policy_indicators VALUES ('PB','Punjab',2023,82.1,25.82,266592,6.5,24.3,67.4,41.5)");
  db.exec("INSERT INTO state_year_policy_indicators VALUES ('HR','Haryana',2020,127.5,24.59,254248,6.7,27.4,82.6,32.6)");
  db.exec("INSERT INTO state_year_policy_indicators VALUES ('HR','Haryana',2021,128.1,33.9,240123,7.3,32.8,77.8,37.6)");
  db.exec("INSERT INTO state_year_policy_indicators VALUES ('HR','Haryana',2022,130.1,28.8,217413,7.0,32.3,73.4,33.1)");
  db.exec("INSERT INTO state_year_policy_indicators VALUES ('HR','Haryana',2023,127.3,26.5,77547,5.3,23.6,72.2,40.7)");
  db.exec("INSERT INTO election_results VALUES ('constituency_id',constituency,'candidate','party',0,0)");
  db.exec("INSERT INTO election_results VALUES ('Ichapuram',1,'Manabala Ramarao','Independent',83247,813)");
  db.exec("INSERT INTO election_results VALUES ('Ichapuram',1,'Appadu Sahu','Independent',83247,1743)");
  db.exec("INSERT INTO election_results VALUES ('Ichapuram',1,'Uppada Rangababu','Indian National Congress',83247,4427)");
  db.exec("INSERT INTO election_results VALUES ('Ichapuram',1,'Kalla Balarama Swamy','Indian National Congress (I)',83247,19805)");
  db.exec("INSERT INTO election_results VALUES ('Ichapuram',1,'Bendalam Venkatesam Sarma','Janata Party',83247,34251)");
  db.exec("INSERT INTO election_results VALUES ('Sompeta',2,'Ganni Padmanabharao','Indian National Congress',91272,2694)");
  db.exec("INSERT INTO election_results VALUES ('Sompeta',2,'Tulasidas Majji','Indian National Congress (I)',91272,28251)");
  db.exec("INSERT INTO election_results VALUES ('Sompeta',2,'Gouthu Latchanna','Janata Party',91272,42251)");
  db.exec("INSERT INTO election_results VALUES ('Tekkali',3,'Hussana Begam','Indian National Congress (I)',90959,7998)");
  db.exec("INSERT INTO election_results VALUES ('Tekkali',3,'Satharu Lakanadham Naidu','Indian National Congress',90959,22502)");
  db.exec("INSERT INTO election_results VALUES ('Tekkali',3,'Bammaidi Narayanaswami','Janata Party',90959,36206)");
  db.exec("INSERT INTO election_results VALUES ('Harishchandra',4,'Goddu Latchunnaidu Alias G. L. Naidu','Indian National Congress (I)',89545,10809)");
  db.exec("INSERT INTO election_results VALUES ('Harishchandra',4,'Krishna Murti- Kinjarapu','Janata Party',89545,24070)");
  db.exec("INSERT INTO election_results VALUES ('Harishchandra',4,'Appalanarasimha Bugata Kennapalli','Indian National Congress',89545,26381)");
  db.exec("INSERT INTO election_results VALUES ('Narasannapeta',5,'Gudiya Ramulu','Independent',84082,1194)");
  db.exec("INSERT INTO election_results VALUES ('Narasannapeta',5,'Baggu Sarojinamma','Indian National Congress',84082,12844)");
  db.exec("INSERT INTO election_results VALUES ('Narasannapeta',5,'Simma Jagannadham','Janata Party',84082,22397)");
  db.exec("INSERT INTO election_results VALUES ('Narasannapeta',5,'Dola Seetaramulu','Indian National Congress (I)',84082,28123)");
  db.exec("INSERT INTO election_results VALUES ('Patapatnam',6,'Lingala Janardhanarao','Independent',85052,565)");
  db.exec("INSERT INTO election_results VALUES ('Patapatnam',6,'Killamsetty Trinadu Kumar','Independent',85052,1152)");
  db.exec("INSERT INTO election_results VALUES ('Patapatnam',6,'Varanasi Narayanarao','Independent',85052,2071)");
  db.exec("INSERT INTO election_results VALUES ('Patapatnam',6,'Darapu Govinda Rajulu','Communist Party Of India',85052,6639)");
  db.exec("INSERT INTO election_results VALUES ('Patapatnam',6,'Kamakshi Prasad Brahma','Indian National Congress (I)',85052,12141)");
  db.exec("INSERT INTO election_results VALUES ('Patapatnam',6,'Lukulapu Lakshmanadas','Janata Party',85052,19111)");
  db.exec("INSERT INTO election_results VALUES ('Patapatnam',6,'Kalamata Mohanarao','Independent',85052,19935)");
  db.exec("INSERT INTO election_results VALUES ('Kothuru',7,'Palaka Narasaiah','Indian National Congress',91401,9639)");
  db.exec("INSERT INTO election_results VALUES ('Kothuru',7,'Nimmaka Gopala Rao','Indian National Congress (I)',91401,21724)");
  db.exec("INSERT INTO election_results VALUES ('Kothuru',7,'Viswasarai Narasimharao','Janata Party',91401,25317)");
  db.exec("INSERT INTO election_results VALUES ('Naguru',8,'Thotapalli Lakshmana Murthy','Independent',84166,3312)");
  db.exec("INSERT INTO election_results VALUES ('Naguru',8,'Sreerama Chiranjeevi','Indian National Congress (I)',84166,9336)");
  db.exec("INSERT INTO election_results VALUES ('Naguru',8,'Chandra Chudanami Dev Vyricherla','Indian National Congress',84166,18248)");
  db.exec("INSERT INTO election_results VALUES ('Naguru',8,'Satrucharala Vijaya Rama Raju','Janata Party',84166,19781)");
  db.exec("INSERT INTO election_results VALUES ('Parvathipuram',9,'Venugopala Rao Pakki','Independent',82282,1801)");
  db.exec("INSERT INTO election_results VALUES ('Parvathipuram',9,'Paruvada Jagannadha Rao','Indian National Congress (I)',82282,12025)");
  db.exec("INSERT INTO election_results VALUES ('Parvathipuram',9,'Krishnamurthy Naidu Vasireddi','Indian National Congress',82282,17671)");
  db.exec("INSERT INTO election_results VALUES ('Parvathipuram',9,'Parasuramnaidu Chikati','Janata Party',82282,32494)");
  db.exec("INSERT INTO election_results VALUES ('Salur',10,'Lakshmi Narasimha Sahyasi Raju','Janata Party',78094,24477)");
  db.exec("INSERT INTO election_results VALUES ('Salur',10,'S. R. T. P. S. Veerapa Raju','Communist Party Of India',78094,29126)");
  db.exec("INSERT INTO election_results VALUES ('Bobbili',11,'Reddy Krishnamurthy','Independent',84650,1515)");
  db.exec("INSERT INTO election_results VALUES ('Bobbili',11,'Sala Kondala Rao','Independent',84650,4703)");
  db.exec("INSERT INTO election_results VALUES ('Bobbili',11,'Marrapu Satynarayana','Indian National Congress',84650,6915)");
  db.exec("INSERT INTO election_results VALUES ('Bobbili',11,'Chappa Krishnamurthy Naidu','Indian National Congress (I)',84650,11226)");
  db.exec("INSERT INTO election_results VALUES ('Bobbili',11,'Reddy Satya Rao','Independent',84650,15707)");
  db.exec("INSERT INTO election_results VALUES ('Bobbili',11,'Kolli Venkata Kurmi Naidu','Janata Party',84650,29184)");
  db.exec("INSERT INTO election_results VALUES ('Therlam',12,'Tadde Ramarao','Indian National Congress (I)',97045,20491)");
  db.exec("INSERT INTO election_results VALUES ('Therlam',12,'Tentu Lakshunnaidu','Janata Party',97045,26735)");
  db.exec("INSERT INTO election_results VALUES ('Therlam',12,'Vasireddi Varada Ramarao','Indian National Congress',97045,29024)");
  db.exec("INSERT INTO election_results VALUES ('Vunukuru',13,'Setti Subbi Naidu','Independent',95850,1553)");
  db.exec("INSERT INTO election_results VALUES ('Vunukuru',13,'Gullipalli Shivaramunaidu','Independent',95850,10622)");
  db.exec("INSERT INTO election_results VALUES ('Vunukuru',13,'Krri Narayanarao','Indian National Congress (I)',95850,14544)");
  db.exec("INSERT INTO election_results VALUES ('Vunukuru',13,'Palavalasa Rimkinamma','Indian National Congress',95850,20030)");
  db.exec("INSERT INTO election_results VALUES ('Vunukuru',13,'Babu Parankusam Mudili','Janata Party',95850,26617)");
  db.exec("INSERT INTO election_results VALUES ('Palakonda',14,'Samala Madhavarao','Independent',79350,802)");
  db.exec("INSERT INTO election_results VALUES ('Palakonda',14,'Nuthulapati Bala Padmavati','Republican Party Of India (Khobragade)',79350,2668)");
  db.exec("INSERT INTO election_results VALUES ('Palakonda',14,'Dunga Subhashiniraju','Independent',79350,3278)");
  db.exec("INSERT INTO election_results VALUES ('Palakonda',14,'Pagadalamma Sukka','Indian National Congress',79350,10319)");
  db.exec("INSERT INTO election_results VALUES ('Palakonda',14,'Daramana Adinarayana','Indian National Congress (I)',79350,12387)");
  db.exec("INSERT INTO election_results VALUES ('Palakonda',14,'Kambala Rajaratnam','Janata Party',79350,24145)");
  db.exec("INSERT INTO election_results VALUES ('Amadalavalasa',15,'Banna Karunakararao','Independent',83276,848)");
  db.exec("INSERT INTO election_results VALUES ('Amadalavalasa',15,'Metta Jaggubhatlu','Independent',83276,4317)");
  db.exec("INSERT INTO election_results VALUES ('Amadalavalasa',15,'Thammineni Paparao','Janata Party',83276,17559)");
  db.exec("INSERT INTO election_results VALUES ('Amadalavalasa',15,'Venkatappalanaidu Peerukatla','Indian National Congress (I)',83276,18375)");
  db.exec("INSERT INTO election_results VALUES ('Amadalavalasa',15,'Srinamamurthy Pydi','Indian National Congress',83276,21750)");
  db.exec("INSERT INTO election_results VALUES ('Srikakulam',16,'Gerimella Ramakrishna','Independent',96721,928)");
  db.exec("INSERT INTO election_results VALUES ('Srikakulam',16,'Niddapu Sannibabu','Independent',96721,2286)");
  db.exec("INSERT INTO election_results VALUES ('Srikakulam',16,'Ippilli Venkatrao','Independent',96721,5270)");
  db.exec("INSERT INTO election_results VALUES ('Srikakulam',16,'Mylapilli Satyarajula','Independent',96721,7509)");
  db.exec("INSERT INTO election_results VALUES ('Srikakulam',16,'Tangi Satyanarayana','Indian National Congress',96721,14766)");
  db.exec("INSERT INTO election_results VALUES ('Srikakulam',16,'Raghavadas Tripurna','Indian National Congress (I)',96721,16556)");
  db.exec("INSERT INTO election_results VALUES ('Srikakulam',16,'Challa Lakshminarayana','Janata Party',96721,23643)");
  db.exec("INSERT INTO election_results VALUES ('Etcherla',17,'Makayya Koppala','Independent',86150,557)");
  db.exec("INSERT INTO election_results VALUES ('Etcherla',17,'Manda Venkatrao','Independent',86150,4017)");
  db.exec("INSERT INTO election_results VALUES ('Etcherla',17,'Kanchayya Potnuru','Indian National Congress',86150,8651)");
  db.exec("INSERT INTO election_results VALUES ('Etcherla',17,'Boddepalli Narasimhulu','Indian National Congress (I)',86150,15481)");
  db.exec("INSERT INTO election_results VALUES ('Etcherla',17,'Kothapalli Narasayya','Janata Party',86150,25272)");
  db.exec("INSERT INTO election_results VALUES ('Cheepurupalli',18,'Bevara Venugopalanaidu','Independent',95041,1867)");
  db.exec("INSERT INTO election_results VALUES ('Cheepurupalli',18,'Kutcherlapati Laxmipathi Raju','Indian National Congress',95041,7465)");
  db.exec("INSERT INTO election_results VALUES ('Cheepurupalli',18,'Ravuthu Paidapunaidu','Janata Party',95041,13083)");
  db.exec("INSERT INTO election_results VALUES ('Cheepurupalli',18,'Akkalanaidu Tankala','Independent',95041,17034)");
  db.exec("INSERT INTO election_results VALUES ('Cheepurupalli',18,'Chigilipalli Syamalarao','Indian National Congress (I)',95041,27943)");
  db.exec("INSERT INTO election_results VALUES ('Gajapathinagaram',19,'Samantula Adinarayana','Independent',90161,567)");
  db.exec("INSERT INTO election_results VALUES ('Gajapathinagaram',19,'Madhuri Vijayarama Gajapatiraju Pusapati','Indian National Congress (I)',90161,3700)");
  db.exec("INSERT INTO election_results VALUES ('Gajapathinagaram',19,'Taddi Sanyasi Naidu','Indian National Congress',90161,17693)");
  db.exec("INSERT INTO election_results VALUES ('Gajapathinagaram',19,'Venkata Gangaraju Narkedamilli','Independent',90161,23945)");
  db.exec("INSERT INTO election_results VALUES ('Gajapathinagaram',19,'Vangapandu Narayanappala Naidu','Janata Party',90161,27091)");
  db.exec("INSERT INTO election_results VALUES ('Vizianagaram',20,'Patchipilli Dasu','Independent',88805,1393)");
  db.exec("INSERT INTO election_results VALUES ('Vizianagaram',20,'Modili Satyam','Indian National Congress (I)',88805,11760)");
  db.exec("INSERT INTO election_results VALUES ('Vizianagaram',20,'Appanadora Appasani','Indian National Congress',88805,13829)");
  db.exec("INSERT INTO election_results VALUES ('Vizianagaram',20,'Shree Ashok Gajapathi Raju Poosapati','Janata Party',88805,39914)");
  db.exec("INSERT INTO election_results VALUES ('Sathivada',21,'Sriramulu Naidu Shunkari','Indian National Congress (I)',87812,7022)");
  db.exec("INSERT INTO election_results VALUES ('Sathivada',21,'Gullipalli Venkat Rao','Independent',87812,12617)");
  db.exec("INSERT INTO election_results VALUES ('Sathivada',21,'Baireddy Suryanarayana','Janata Party',87812,13853)");
  db.exec("INSERT INTO election_results VALUES ('Sathivada',21,'Sambiasivaraju Penumatcha','Indian National Congress',87812,35935)");
  db.exec("INSERT INTO election_results VALUES ('Bhogapuram',22,'Pulapa Appala Suryaprakasarao','Indian National Congress (I)',82036,9208)");
  db.exec("INSERT INTO election_results VALUES ('Bhogapuram',22,'Pativada Narayanaswamynaidu','Janata Party',82036,19275)");
  db.exec("INSERT INTO election_results VALUES ('Bhogapuram',22,'Appadudora Kommuru','Indian National Congress',82036,30716)");
  db.exec("INSERT INTO election_results VALUES ('Bheemunipatnam',23,'Kilari Potham Naidu','Independent',96472,2421)");
  db.exec("INSERT INTO election_results VALUES ('Bheemunipatnam',23,'Mokara Narayana Rao','Independent',96472,6936)");
  db.exec("INSERT INTO election_results VALUES ('Bheemunipatnam',23,'Appala Narasimha Raju K. S.','Janata Party',96472,8385)");
  db.exec("INSERT INTO constituency_info VALUES (1,'Ichapuram','Andhra Pradesh')");
  db.exec("INSERT INTO constituency_info VALUES (2,'Sompeta','Andhra Pradesh')");
  db.exec("INSERT INTO constituency_info VALUES (3,'Tekkali','Andhra Pradesh')");
  db.exec("INSERT INTO constituency_info VALUES (4,'Harishchandra','Andhra Pradesh')");
  db.exec("INSERT INTO constituency_info VALUES (5,'Narasannapeta','Andhra Pradesh')");
  db.exec("INSERT INTO constituency_info VALUES (6,'Patapatnam','Andhra Pradesh')");
  db.exec("INSERT INTO constituency_info VALUES (7,'Kothuru','Andhra Pradesh')");
  db.exec("INSERT INTO constituency_info VALUES (8,'Naguru','Andhra Pradesh')");
  db.exec("INSERT INTO constituency_info VALUES (9,'Parvathipuram','Andhra Pradesh')");
  db.exec("INSERT INTO constituency_info VALUES (10,'Salur','Andhra Pradesh')");
  db.exec("INSERT INTO constituency_info VALUES (11,'Bobbili','Andhra Pradesh')");
  db.exec("INSERT INTO constituency_info VALUES (12,'Therlam','Andhra Pradesh')");
  db.exec("INSERT INTO constituency_info VALUES (13,'Vunukuru','Andhra Pradesh')");
  db.exec("INSERT INTO constituency_info VALUES (14,'Palakonda','Andhra Pradesh')");
  db.exec("INSERT INTO constituency_info VALUES (15,'Amadalavalasa','Andhra Pradesh')");
  db.exec("INSERT INTO constituency_info VALUES (16,'Srikakulam','Andhra Pradesh')");
  db.exec("INSERT INTO constituency_info VALUES (17,'Etcherla','Andhra Pradesh')");
  db.exec("INSERT INTO constituency_info VALUES (18,'Cheepurupalli','Andhra Pradesh')");
  db.exec("INSERT INTO constituency_info VALUES (19,'Gajapathinagaram','Andhra Pradesh')");
  db.exec("INSERT INTO constituency_info VALUES (20,'Vizianagaram','Andhra Pradesh')");
  db.exec("INSERT INTO constituency_info VALUES (21,'Sathivada','Andhra Pradesh')");
  db.exec("INSERT INTO constituency_info VALUES (22,'Bhogapuram','Andhra Pradesh')");
  db.exec("INSERT INTO constituency_info VALUES (23,'Bheemunipatnam','Andhra Pradesh')");

  practiceDb = db;
  return db;
}

module.exports = { getPracticeDb, TABLE_CATALOG };
