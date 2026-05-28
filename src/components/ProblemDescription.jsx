/**
 * Shows problem title, difficulty, description, and expected output.
 */
function ProblemDescription({ question }) {
  if (!question) return null;

  const difficultyClass = question.difficulty.toLowerCase();

  return (
    <div className="problem-description">
      <header className="problem-header">
        <h1 className="problem-header__title">{question.title}</h1>
        <span className={`badge badge--${difficultyClass}`}>{question.difficulty}</span>
      </header>

      <section className="problem-section">
        <h2 className="problem-section__heading">Description</h2>
        <p className="problem-section__text">{question.description}</p>
      </section>

      <section className="problem-section">
        <h2 className="problem-section__heading">Expected output</h2>
        <p className="problem-section__text">{question.expectedOutput}</p>
        <p className="problem-section__hint">
          Tip: Use the sample tables below to understand the data before writing your query.
        </p>
      </section>
    </div>
  );
}

export default ProblemDescription;
