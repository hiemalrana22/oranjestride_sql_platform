import { useState, useEffect } from 'react';
import { fetchPracticeTables, runPracticeQuery } from '../services/api';
import Navbar     from '../components/Navbar';
import SqlEditor  from '../components/SqlEditor';
import OutputTable from '../components/OutputTable';
import Loader     from '../components/Loader';

/**
 * SandboxPage — free-form SQL practice environment.
 *
 * Left panel  : available tables + column browser
 * Right panel : Monaco SQL editor + live output table
 *
 * The user can write any SELECT / WITH query against
 * the full course dataset (book1, book2, constituency_info,
 * election_results, scheme_budget_utilization,
 * district_policy_outcomes, state_year_policy_indicators).
 */
function SandboxPage({ activePage, onPageChange }) {
  const [tables, setTables]           = useState([]);
  const [expandedTable, setExpanded]  = useState(null);   // which table is open in the browser
  const [sql, setSql]                 = useState('-- Write any SELECT query below\nSELECT * FROM book1 LIMIT 10;');
  const [isRunning, setIsRunning]     = useState(false);
  const [result, setResult]           = useState(null);   // { rows, rowCount, executionTime, error }
  const [hasRun, setHasRun]           = useState(false);

  // Load table catalog once on mount
  useEffect(() => {
    fetchPracticeTables()
      .then(setTables)
      .catch(() => setTables([]));
  }, []);

  // ── Run the user's query ────────────────
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

  // ── Reset editor to starter query ───────
  const handleReset = () => {
    setSql('-- Write any SELECT query below\nSELECT * FROM book1 LIMIT 10;');
    setHasRun(false);
    setResult(null);
  };

  // ── Click a table name to load it ───────
  const handleTableClick = (tableName) => {
    setExpanded(prev => prev === tableName ? null : tableName);
    // Also populate the editor with a quick preview query
    setSql(`SELECT * FROM ${tableName} LIMIT 10;`);
    setHasRun(false);
    setResult(null);
  };

  // ── Group tables by day ──────────────────
  const byDay = tables.reduce((acc, t) => {
    const key = `Day ${t.day}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});

  return (
    <div className="app-shell">
      <Navbar activePage={activePage} onPageChange={onPageChange} />
      <Loader visible={isRunning} />

      <div className="sandbox-layout">

        {/* ── Left: Table Browser ───────────── */}
        <aside className="sandbox-sidebar">
          <div className="sandbox-sidebar__header">Available Tables</div>

          {Object.entries(byDay).map(([day, dayTables]) => (
            <div key={day} className="sandbox-day-group">
              <div className="sandbox-day-label">{day}</div>

              {dayTables.map((table) => {
                const isOpen = expandedTable === table.tableName;
                return (
                  <div key={table.tableName} className="sandbox-table-entry">
                    <button
                      type="button"
                      className={`sandbox-table-btn ${isOpen ? 'sandbox-table-btn--active' : ''}`}
                      onClick={() => handleTableClick(table.tableName)}
                      title={table.description}
                    >
                      <span className="sandbox-table-icon">⊞</span>
                      <span className="sandbox-table-name">{table.tableName}</span>
                      <span className="sandbox-table-chevron">{isOpen ? '▾' : '▸'}</span>
                    </button>

                    {isOpen && (
                      <ul className="sandbox-columns">
                        {table.columns.map((col) => (
                          <li key={col.name} className="sandbox-column">
                            <span className="sandbox-column__name">{col.name}</span>
                            <span className="sandbox-column__type">{col.type}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {/* Quick reference cheat-sheet */}
          <div className="sandbox-hint">
            <div className="sandbox-hint__title">💡 Tips</div>
            <div className="sandbox-hint__text">
              Click a table name to preview it. Only <code>SELECT</code> and <code>WITH</code> queries are allowed.
              Results are capped at 200 rows.
            </div>
          </div>
        </aside>

        {/* ── Right: Editor + Output ────────── */}
        <div className="sandbox-main">
          <div className="sandbox-editor">
            <SqlEditor
              value={sql}
              onChange={setSql}
              onRun={handleRun}
              onReset={handleReset}
              isRunning={isRunning}
            />
          </div>

          <div className="sandbox-output">
            {/* Status bar */}
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
                <span className="sandbox-statusbar__idle">Run a query to see results here.</span>
              </div>
            )}

            {/* Result table */}
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
