/**
 * Sidebar listing all available SQL questions.
 * Clicking a question notifies the parent to load its details.
 */
function QuestionSidebar({ questions, activeId, onSelect }) {
  return (
    <aside className="question-sidebar">
      <div className="question-sidebar__header">Problems</div>
      <ul className="question-sidebar__list">
        {questions.map((question) => {
          const isActive = question.id === activeId;
          const difficultyClass = question.difficulty.toLowerCase();

          return (
            <li key={question.id}>
              <button
                type="button"
                className={`question-sidebar__item ${isActive ? 'question-sidebar__item--active' : ''}`}
                onClick={() => onSelect(question.id)}
              >
                <div className="question-sidebar__item-title">{question.title}</div>
                <span className={`badge badge--${difficultyClass}`}>{question.difficulty}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

export default QuestionSidebar;
