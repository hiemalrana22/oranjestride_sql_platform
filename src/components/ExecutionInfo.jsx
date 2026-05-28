/**
 * Displays execution time and run status message.
 */
function ExecutionInfo({ executionTime, passed, hasRun, error }) {
  if (!hasRun) {
    return null;
  }

  return (
    <div className="execution-info">
      <span className="execution-info__item">
        Execution time:<strong>{executionTime}</strong>
      </span>
      {!error && (
        <span className="execution-info__item">
          Status:<strong>{passed ? 'Success' : 'Failed'}</strong>
        </span>
      )}
    </div>
  );
}

export default ExecutionInfo;
