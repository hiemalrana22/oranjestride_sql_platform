/**
 * Displays sample dataset rows for the current problem.
 */
function DataTable({ label, columns, rows }) {
  return (
    <div className="data-table-wrap">
      {label && <div className="data-table-wrap__label">{label}</div>}
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
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{String(cell)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SampleDataTable({ question }) {
  if (!question) return null;

  // Multiple sample tables
  if (Array.isArray(question.sampleData)) {
    return (
      <section className="problem-section">
        <h2 className="problem-section__heading">Sample data</h2>
        {question.sampleData.map((table) => (
          <DataTable
            key={table.tableName}
            label={table.tableName}
            columns={table.columns}
            rows={table.rows}
          />
        ))}
      </section>
    );
  }

  const tableName = question.schema?.tableName ?? 'data';

  return (
    <section className="problem-section">
      <h2 className="problem-section__heading">Sample data</h2>
      <DataTable
        label={tableName}
        columns={question.sampleData.columns}
        rows={question.sampleData.rows}
      />
    </section>
  );
}

export default SampleDataTable;
