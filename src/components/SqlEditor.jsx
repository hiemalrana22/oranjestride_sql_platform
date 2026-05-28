import { useRef } from 'react';
import Editor from '@monaco-editor/react';

const SQL_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'ON',
  'GROUP BY', 'ORDER BY', 'HAVING', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX',
  'AS', 'AND', 'OR', 'NOT', 'IN', 'LIKE', 'DISTINCT', 'LIMIT', 'WITH',
];

/**
 * Basic SQL formatter for beginners (uppercase keywords, trim lines).
 */
function formatSql(sql) {
  let formatted = sql.trim();
  SQL_KEYWORDS.forEach((keyword) => {
    const regex = new RegExp(`\\b${keyword.replace(' ', '\\s+')}\\b`, 'gi');
    formatted = formatted.replace(regex, keyword);
  });
  return formatted
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n');
}

/**
 * Monaco SQL editor with run, reset, and format actions.
 */
function SqlEditor({ value, onChange, onRun, onReset, isRunning }) {
  const editorRef = useRef(null);

  const handleEditorMount = (editor) => {
    editorRef.current = editor;
  };

  const handleFormat = () => {
    if (editorRef.current) {
      const formatted = formatSql(editorRef.current.getValue());
      onChange(formatted);
      editorRef.current.setValue(formatted);
    } else {
      onChange(formatSql(value));
    }
  };

  return (
    <div className="sql-editor-wrap">
      <div className="sql-editor-toolbar">
        <span className="sql-editor-toolbar__title">query.sql</span>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={handleFormat}
          disabled={isRunning}
          title="Format SQL keywords"
        >
          Format
        </button>
        <button
          type="button"
          className="btn btn--secondary"
          onClick={onReset}
          disabled={isRunning}
        >
          Reset Query
        </button>
        <button
          type="button"
          className="btn btn--primary"
          onClick={onRun}
          disabled={isRunning}
        >
          {isRunning ? 'Running…' : 'Run Query'}
        </button>
      </div>

      <div className="sql-editor-body">
        <Editor
          height="100%"
          defaultLanguage="sql"
          theme="vs-dark"
          value={value}
          onChange={(newValue) => onChange(newValue ?? '')}
          onMount={handleEditorMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "'Cascadia Code', Consolas, monospace",
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            padding: { top: 12 },
          }}
        />
      </div>
    </div>
  );
}

export default SqlEditor;
