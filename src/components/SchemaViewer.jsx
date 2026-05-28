/**
 * Renders database table schemas (single or multiple tables).
 */
function SchemaTable({ table }) {
  return (
    <div className="schema-block">
      <div className="schema-block__table-name">{table.tableName}</div>
      <ul className="schema-block__columns">
        {table.columns.map((col) => (
          <li key={col.name} className="schema-block__column">
            <strong>{col.name}</strong>
            <span> — {col.type}</span>
            {col.key && <span className="schema-block__key">{col.key}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SchemaViewer({ schema }) {
  if (!schema) return null;

  // Multiple tables (e.g. JOIN problems)
  if (schema.tables) {
    return (
      <section className="problem-section">
        <h2 className="problem-section__heading">Database schema</h2>
        {schema.tables.map((table) => (
          <SchemaTable key={table.tableName} table={table} />
        ))}
      </section>
    );
  }

  // Single table
  return (
    <section className="problem-section">
      <h2 className="problem-section__heading">Database schema</h2>
      <SchemaTable table={schema} />
    </section>
  );
}

export default SchemaViewer;
