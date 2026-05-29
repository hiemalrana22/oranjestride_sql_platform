/**
 * Top navigation bar — includes tab switching between
 * the guided "Learn" mode and the free "Sandbox" mode.
 */
function Navbar({ activePage, onPageChange }) {
  return (
    <header className="navbar">
      <div className="navbar__brand">
        <div className="navbar__logo" aria-hidden="true">
          SQL
        </div>
        <div>
          <div className="navbar__title">DataStride SQL</div>
          <div className="navbar__subtitle">Practice · Learn · Master</div>
        </div>
      </div>

      <nav className="navbar__tabs" aria-label="Platform sections">
        <button
          type="button"
          className={`navbar__tab ${activePage === 'learn' ? 'navbar__tab--active' : ''}`}
          onClick={() => onPageChange('learn')}
        >
          📚 Learn
        </button>
        <button
          type="button"
          className={`navbar__tab ${activePage === 'sandbox' ? 'navbar__tab--active' : ''}`}
          onClick={() => onPageChange('sandbox')}
        >
          🧪 Sandbox
        </button>
      </nav>
    </header>
  );
}

export default Navbar;
