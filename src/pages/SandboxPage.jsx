import { useState, useEffect, useCallback } from 'react';
import { fetchPracticeTables, runPracticeQuery, fetchTablePreview } from '../services/api';
import Navbar from '../components/Navbar';
import SqlEditor from '../components/SqlEditor';
import OutputTable from '../components/OutputTable';
import Loader from '../components/Loader';

const STARTER_SQL = `-- All 8 datasets share one database — use JOINs freely.
-- Run the last SELECT in the editor (comments are OK).

SELECT * FROM book1 LIMIT 10;

-- Multi-table example (Day 9 election data):
-- SELECT ci.constituency_id, ci.constituency, ci.state,
--        er.candidate, er.party, er.total_votes, er.margin
-- FROM constituency_info ci
-- INNER JOIN election_result er ON ci.constituency_id = er.constituency_id
-- LIMIT 20;
`;

const JOIN_HINTS = [
  {
    day: 8,
    label: 'book1 ↔ book2',
    sql: `SELECT b1.Party_Name, b1.Contact_Name, b2.Campaign_Spending
FROM book1 b1
INNER JOIN book2 b2 ON b1.Party_Name = b2.Party_Name;`,
  },
  {
    day: 9,
    label: 'constituency_info ↔ election_result',
    sql: `SELECT ci.constituency_id, ci.constituency, ci.state,
       er.candidate, er.party, er.total_votes, er.margin
FROM constituency_info ci
INNER JOIN election_result er ON ci.constituency_id = er.constituency_id
LIMIT 25;`,
  },
  {
    day: 9,
    label: 'election_result ↔ indian_state_level_election',
    sql: `SELECT er.constituency_id, er.candidate, er.party,
       ise.st_name, ise.year, ise.ac_name
FROM election_result er
INNER JOIN indian_state_level_election ise
  ON er.constituency_id = ise.ac_no AND er.constituency = ise.ac_name
LIMIT 25;`,
  },
  {
    day: 10,
    label: 'district_policy ↔ scheme_budget',
    sql: `SELECT d.district_name, d.state_code, d.year, d.health_index,
       s.scheme_name, s.allocated_budget_cr, s.utilized_budget_cr
FROM district_policy_outcomes d
INNER JOIN scheme_budget_utilization s
  ON d.state_code = s.state_code AND d.year = s.year
LIMIT 25;`,
  },
];

/**
 * SQL Practice — all tables loaded; run any SELECT, JOIN, CTE, or subquery.
 */
function SandboxPage({ activePage, onPageChange }) {
  const [tables, setTables] = useState([]);
  const [dbMessage, setDbMessage] = useState('');
  const [tablesError, setTablesError] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [expandedTable, setExpandedTable] = useState(null);
  const [sql, setSql] = useState(STARTER_SQL);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [hasRun, setHasRun] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    fetchPracticeTables()
      .then((data) => {
        const list = data.tables || data;
        setTables(list);
        setDbMessage(data.message || '');
        setTablesError(null);
        if (list.length > 0) {
          setSelectedTable(list[0].tableName);
        }
      })
      .catch((err) => {
        setTables([]);
        setTablesError(err.message || 'Could not load tables from API.');
      });
  }, []);

  const handleTableClick = (tableName) => {
    setSelectedTable(tableName);
    setExpandedTable((prev) => (prev === tableName ? null : tableName));
  };

  const insertTableQuery = useCallback((tableName, limit = 15) => {
    const snippet = `SELECT * FROM ${tableName} LIMIT ${limit};`;
    setSql((prev) => (prev.trim() ? `${prev.trim()}\n\n${snippet}` : snippet));
  }, []);

  const handlePreviewTable = async (tableName) => {
    setPreviewLoading(true);
    setHasRun(true);
    setResult(null);
    try {
      const data = await fetchTablePreview(tableName, 15);
      setResult({
        rows: data.rows,
        rowCount: data.rowCount,
        executionTime: 'preview',
        error: null,
        executedQuery: `SELECT * FROM ${tableName} LIMIT 15`,
      });
    } catch (err) {
      setResult({
        rows: [],
        rowCount: 0,
        executionTime: '0ms',
        error: err.message,
      });
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleRun = async () => {
    setIsRunning(true);
    setHasRun(false);
    setResult(null);
    try {
      const data = await runPracticeQuery(sql);
      setResult(data);
    } catch (err) {
      setResult({
        rows: [],
        rowCount: 0,
        executionTime: '0ms',
        error: err.response?.data?.error || err.message || 'Network error',
      });
    } finally {
      setIsRunning(false);
      setHasRun(true);
    }
  };

  const handleReset = () => {
    setSql(STARTER_SQL);
    setHasRun(false);
    setResult(null);
  };

  const loadJoinExample = (exampleSql) => {
    setSql(exampleSql);
    setHasRun(false);
    setResult(null);
  };

  const byDay = tables.reduce((acc, t) => {
    const key = `Day ${t.day}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});

  const busy = isRunning || previewLoading;

  return (
    <div className="app-shell">
      <Navbar activePage={activePage} onPageChange={onPageChange} />
      <Loader visible={busy} />

      <div className="sandbox-layout">
        <aside className="sandbox-sidebar">
          <div className="sandbox-sidebar__header">
            Datasets ({tables.length})
          </div>

          {dbMessage && (
            <p className="sandbox-db-note">{dbMessage}</p>
          )}

          {tablesError && (
            <div className="alert alert--error" style={{ margin: '0.75rem' }} role="alert">
              {tablesError}
            </div>
          )}

          {Object.entries(byDay).map(([day, dayTables]) => (
            <div key={day} className="sandbox-day-group">
              <div className="sandbox-day-label">{day}</div>
              {dayTables.map((table) => {
                const isSelected = selectedTable === table.tableName;
                const isOpen = expandedTable === table.tableName;
                return (
                  <div key={table.tableName} className="sandbox-table-entry">
                    <button
                      type="button"
                      className={`sandbox-table-btn ${isSelected ? 'sandbox-table-btn--active' : ''}`}
                      onClick={() => handleTableClick(table.tableName)}
                      title={table.description}
                    >
                      <span className="sandbox-table-icon">⊞</span>
                      <span className="sandbox-table-name">{table.tableName}</span>
                      <span className="sandbox-table-rows">{table.rowCount} rows</span>
                      <span className="sandbox-table-chevron">{isOpen ? '▾' : '▸'}</span>
                    </button>
                    {isOpen && (
                      <>
                        <ul className="sandbox-columns">
                          {table.columns.map((col) => (
                            <li key={col.name} className="sandbox-column">
                              <span className="sandbox-column__name">{col.name}</span>
                              <span className="sandbox-column__type">{col.type}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="sandbox-table-actions">
                          <button
                            type="button"
                            className="btn btn--ghost btn--xs"
                            onClick={() => insertTableQuery(table.tableName)}
                          >
                            Add query
                          </button>
                          <button
                            type="button"
                            className="btn btn--ghost btn--xs"
                            onClick={() => handlePreviewTable(table.tableName)}
                            disabled={busy}
                          >
                            Preview
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          <div className="sandbox-hint">
            <div className="sandbox-hint__title">Example JOINs</div>
            <div className="sandbox-hint__text">
              Click to load a working multi-table query:
            </div>
            <ul className="sandbox-join-list">
              {JOIN_HINTS.map((hint) => (
                <li key={hint.label}>
                  <button
                    type="button"
                    className="sandbox-join-btn"
                    onClick={() => loadJoinExample(hint.sql)}
                    title={hint.sql}
                  >
                    Day {hint.day}: {hint.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="sandbox-main">
          <div className="sandbox-editor">
            <SqlEditor
              value={sql}
              onChange={setSql}
              onRun={handleRun}
              onReset={handleReset}
              isRunning={busy}
            />
          </div>

          <div className="sandbox-output">
            {hasRun && (
              <div className="sandbox-statusbar">
                {result?.error ? (
                  <span className="sandbox-statusbar__error">✗ {result.error}</span>
                ) : (
                  <>
                    <span className="sandbox-statusbar__ok">
                      ✓ {result?.rowCount ?? 0} row{result?.rowCount !== 1 ? 's' : ''} returned
                    </span>
                    <span className="sandbox-statusbar__time">{result?.executionTime}</span>
                  </>
                )}
              </div>
            )}

            {!hasRun && (
              <div className="sandbox-statusbar">
                <span className="sandbox-statusbar__idle">
                  Run any <code>SELECT</code> or <code>WITH</code> — single table, JOINs, subqueries, aggregates.
                </span>
              </div>
            )}

            {hasRun && result?.executedQuery && !result?.error && (
              <p className="sandbox-executed-query" title="Statement that was run">
                Executed: <code>{result.executedQuery.length > 120
                  ? `${result.executedQuery.slice(0, 120)}…`
                  : result.executedQuery}</code>
              </p>
            )}

            <div className="sandbox-table-wrap">
              <OutputTable rows={hasRun && !result?.error ? (result?.rows ?? []) : []} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SandboxPage;
