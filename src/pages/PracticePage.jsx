import { useState, useEffect } from 'react';
import { fetchQuestions, fetchQuestion, runQuery } from '../services/api';
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
 * Main practice page — loads questions from Render API.
 */
function PracticePage({ activePage, onPageChange }) {
  const [questions, setQuestions] = useState([]);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [activeQuestionId, setActiveQuestionId] = useState(null);
  const [sql, setSql] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [hasRun, setHasRun] = useState(false);
  const [response, setResponse] = useState(null);

  // Load question list on mount
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setLoadError(null);
      try {
        const list = await fetchQuestions();
        if (cancelled) return;
        if (list.length === 0) {
          setLoadError('No questions found on the server.');
          return;
        }
        setQuestions(list);
        setActiveQuestionId(list[0].id);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err.message || 'Could not load questions.');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Load full question details when selection changes
  useEffect(() => {
    if (!activeQuestionId) return;

    let cancelled = false;

    async function loadDetail() {
      try {
        const detail = await fetchQuestion(activeQuestionId);
        if (cancelled) return;
        setActiveQuestion(detail);
        setSql(detail.starterSql || '');
        setHasRun(false);
        setResponse(null);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err.message || `Could not load question ${activeQuestionId}.`);
        }
      }
    }

    loadDetail();
    return () => {
      cancelled = true;
    };
  }, [activeQuestionId]);

  const handleSelectQuestion = (id) => {
    setActiveQuestionId(id);
  };

  const handleReset = () => {
    if (activeQuestion) {
      setSql(activeQuestion.starterSql || '');
    }
    setHasRun(false);
    setResponse(null);
  };

  const handleRun = async () => {
    if (!activeQuestionId) return;

    setIsRunning(true);
    setHasRun(false);
    setResponse(null);

    try {
      const result = await runQuery(activeQuestionId, sql);
      setResponse(result);
      setHasRun(true);
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.message ||
        'Network error: could not reach the server.';
      setResponse({
        passed: false,
        passedTests: 0,
        totalTests: activeQuestion?.totalTests ?? 0,
        executionTime: '0ms',
        result: [],
        error: message,
      });
      setHasRun(true);
    } finally {
      setIsRunning(false);
    }
  };

  const showSuccessMessage = hasRun && response && !response.error && response.passed;

  if (isLoading) {
    return (
      <div className="app-shell">
        <Navbar activePage={activePage} onPageChange={onPageChange} />
        <Loader visible />
        <p style={{ textAlign: 'center', padding: '2rem', color: '#858585' }}>
          Loading questions…
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="app-shell">
        <Navbar activePage={activePage} onPageChange={onPageChange} />
        <div className="alert alert--error" style={{ margin: '2rem' }} role="alert">
          {loadError}
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Navbar activePage={activePage} onPageChange={onPageChange} />
      <Loader visible={isRunning} />

      <div className="practice-layout">
        <div className="left-panel">
          <div className="left-panel__sidebar">
            <QuestionSidebar
              questions={questions}
              activeId={activeQuestionId}
              onSelect={handleSelectQuestion}
            />
          </div>
          <div className="left-panel__content">
            {activeQuestion ? (
              <>
                <ProblemDescription question={activeQuestion} />
                <SchemaViewer schema={activeQuestion.schema} />
                <SampleDataTable question={activeQuestion} />
              </>
            ) : (
              <p className="problem-section__text">Loading problem…</p>
            )}
          </div>
        </div>

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
                Query executed successfully. All test cases passed.
              </div>
            )}

            <TestCaseStatus
              passed={response?.passed}
              passedTests={response?.passedTests ?? 0}
              totalTests={response?.totalTests ?? 0}
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
