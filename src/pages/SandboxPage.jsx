import { useState, useEffect } from 'react';
import { fetchPracticeTables, runPracticeQuery } from '../services/api';
import Navbar from '../components/Navbar';
import SqlEditor from '../components/SqlEditor';
import OutputTable from '../components/OutputTable';
import Loader from '../components/Loader';

/**
 * SandboxPage — pick a dataset, write SQL, see query output.
 */
function SandboxPage({ activePage, onPageChange }) {
  const [tables, setTables] = useState([]);
  const [tablesError, setTablesError] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [expandedTable, setExpandedTable] = useState(null);
  const [sql, setSql] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [hasRun, setHasRun] = useState(false);

  const selectTable = (tableName) => {
    setSelectedTable(tableName);
    setExpandedTable(tableName);
    setSql(`SELECT * FROM ${tableName} LIMIT 10;`);
    setHasRun(false);
    setResult(null);
  };

  useEffect(() => {
    fetchPracticeTables()
      .then((data) => {
        setTables(data);
        setTablesError(null);
        if (data.length > 0) {
          selectTable(data[0].tableName);
        }
      })
      .catch((err) => {
        setTables([]);
        setTablesError(err.message || 'Could not load tables from API.');
      });
  }, []);

  const handleTableClick = (tableName) => {
    selectTable(tableName);
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
    if (selectedTable) {
      setSql(`SELECT * FROM ${selectedTable} LIMIT 10;`);
    }
    setHasRun(false);
    setResult(null);
  };

  const byDay = tables.reduce((acc, t) => {
    const key = `Day ${t.day}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});

  const selectedMeta = tables.find((t) => t.tableName === selectedTable);

  return (
    <div className="app-shell">
      <Navbar activePage={activePage} onPageChange={onPageChange} />
      <Loader visible={isRunning} />

      <div className="sandbox-layout">
        <aside className="sandbox-sidebar">
          <div className="sandbox-sidebar__header">Choose a dataset</div>

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

          <div className="sandbox-hint">
            <div className="sandbox-hint__title">How it works</div>
            <div className="sandbox-hint__text">
              1. Pick a dataset<br />
              2. Write your <code>SELECT</code> query<br />
              3. Run it to see the output
            </div>
          </div>
        </aside>

        <div className="sandbox-main">
          {selectedMeta && (
            <div className="sandbox-dataset-banner">
              <strong>{selectedMeta.tableName}</strong>
              <span>{selectedMeta.description}</span>
            </div>
          )}

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
                  Run a query on <strong>{selectedTable || 'your dataset'}</strong> to see results.
                </span>
              </div>
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
