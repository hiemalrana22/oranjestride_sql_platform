/**
 * Full-screen loading overlay while a query is running.
 */
function Loader({ visible }) {
  if (!visible) return null;

  return (
    <div className="loader-overlay" role="alert" aria-busy="true" aria-label="Running query">
      <div className="loader-spinner" />
    </div>
  );
}

export default Loader;
