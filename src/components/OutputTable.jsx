/**
 * Renders query result rows with dynamic columns.
 */
function OutputTable({ rows }) {
  if (!rows || rows.length === 0) {
    return (
      <div className="output-empty">
        No rows returned. Run a query to see results here.
      </div>
    );
  }

  // Build column list from first row keys
  const columns = Object.keys(rows[0]);

  return (
    <div className="data-table-wrap">
      <div className="data-table-wrap__label">Query output</div>
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((col) => (
                <td key={col}>{row[col] != null ? String(row[col]) : ''}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default OutputTable;
