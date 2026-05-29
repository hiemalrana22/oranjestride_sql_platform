import { useState } from 'react';
import PracticePage from './pages/PracticePage';
import SandboxPage  from './pages/SandboxPage';

/**
 * Root app — switches between the guided Learn page
 * and the free-form Sandbox page.
 * The active page is passed down to Navbar for tab highlighting.
 */
function App() {
  const [activePage, setActivePage] = useState('sandbox');

  return activePage === 'learn'
    ? <PracticePage activePage={activePage} onPageChange={setActivePage} />
    : <SandboxPage  activePage={activePage} onPageChange={setActivePage} />;
}

export default App;
