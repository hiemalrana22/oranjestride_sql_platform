import { useState, useEffect } from 'react';
import { mockQuestions, getQuestionById } from '../data/mockQuestions';
import { runQuery } from '../services/api';
import Navbar from '../components/Navbar';
import QuestionSidebar from '../components/QuestionSidebar';
import ProblemDescription from '../components/ProblemDescription';
import SchemaViewer from '../components/SchemaViewer';
import SampleDataTable from '../components/SampleDataTable';
import SqlEditor from '../components/SqlEditor';
import OutputTable from '../components/OutputTable';
import TestCaseStatus from '../components/TestCaseStatus';
import ExecutionInfo from '../components/ExecutionInfo';
import Loader from '../components/Loader';

/**
 * Main practice page — split view with problems on the left and editor on the right.
 */
function PracticePage() {
  const [activeQuestionId, setActiveQuestionId] = useState(mockQuestions[0].id);
  const [sql, setSql] = useState(mockQuestions[0].starterSql);
  const [isRunning, setIsRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [response, setResponse] = useState(null);

  const activeQuestion = getQuestionById(activeQuestionId);

  // When user picks a new question, load its starter SQL and clear results
  useEffect(() => {
    const question = getQuestionById(activeQuestionId);
    setSql(question.starterSql);
    setHasRun(false);
    setResponse(null);
  }, [activeQuestionId]);

  const handleSelectQuestion = (id) => {
    setActiveQuestionId(id);
  };

  const handleReset = () => {
    setSql(activeQuestion.starterSql);
    setHasRun(false);
    setResponse(null);
  };

  const handleRun = async () => {
    setIsRunning(true);
    setHasRun(false);
    setResponse(null);

    try {
      const result = await runQuery(activeQuestionId, sql);
      setResponse(result);
      setHasRun(true);
    } catch {
      setResponse({
        passed: false,
        passedTests: 0,
        totalTests: 4,
        executionTime: '0ms',
        result: [],
        error: 'Network error: could not reach the server. Using mock mode — try again.',
      });
      setHasRun(true);
    } finally {
      setIsRunning(false);
    }
  };

  const showSuccessMessage = hasRun && response && !response.error && response.passed;

  return (
    <div className="app-shell">
      <Navbar />
      <Loader visible={isRunning} />

      <div className="practice-layout">
        {/* Left panel: questions + problem details */}
        <div className="left-panel">
          <div className="left-panel__sidebar">
            <QuestionSidebar
              questions={mockQuestions}
              activeId={activeQuestionId}
              onSelect={handleSelectQuestion}
            />
          </div>
          <div className="left-panel__content">
            <ProblemDescription question={activeQuestion} />
            <SchemaViewer schema={activeQuestion.schema} />
            <SampleDataTable question={activeQuestion} />
          </div>
        </div>

        {/* Right panel: editor + output */}
        <div className="right-panel">
          <div className="right-panel__editor">
            <SqlEditor
              value={sql}
              onChange={setSql}
              onRun={handleRun}
              onReset={handleReset}
              isRunning={isRunning}
            />
          </div>

          <div className="right-panel__results">
            <h2 className="output-section__heading">Results</h2>

            {response?.error && (
              <div className="alert alert--error" role="alert">
                {response.error}
              </div>
            )}

            {showSuccessMessage && (
              <div className="alert alert--success" role="status">
                Query executed successfully. Output matches expected results.
              </div>
            )}

            <TestCaseStatus
              passed={response?.passed}
              passedTests={response?.passedTests ?? 0}
              totalTests={response?.totalTests ?? 4}
              hasRun={hasRun}
            />

            <ExecutionInfo
              executionTime={response?.executionTime}
              passed={response?.passed}
              hasRun={hasRun}
              error={response?.error}
            />

            <div className="results-grid">
              {hasRun && !response?.error && (
                <OutputTable rows={response?.result ?? []} />
              )}
              {hasRun && response?.error && <OutputTable rows={[]} />}
              {!hasRun && <OutputTable rows={[]} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PracticePage;
