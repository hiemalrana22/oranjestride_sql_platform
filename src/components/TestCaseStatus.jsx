/**
 * Shows pass/fail status and test case counts.
 */
function TestCaseStatus({ passed, passedTests, totalTests, hasRun }) {
  if (!hasRun) {
    return null;
  }

  const isSuccess = passed;
  const statusClass = isSuccess ? 'test-status--success' : 'test-status--failure';
  const icon = isSuccess ? '✓' : '✗';
  const label = isSuccess ? 'All test cases passed' : 'Some test cases failed';

  return (
    <div className={`test-status ${statusClass}`} role="status">
      <span className="test-status__icon" aria-hidden="true">
        {icon}
      </span>
      <div>
        <div className="test-status__label">{label}</div>
        <div className="test-status__detail">
          {passedTests} / {totalTests} test cases passed
        </div>
      </div>
    </div>
  );
}

export default TestCaseStatus;
