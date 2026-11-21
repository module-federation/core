import React, { useState } from 'react';
import { MemoryRouter, Routes, Route, Link } from '@modern-js/runtime/router';
import { createBridgeComponent } from '@module-federation/bridge-react/v18';
function App() {
  const [count, setCount] = useState(0);
  return (
    <MemoryRouter>
      <article data-testid="app">
        <h3>Bridge application</h3>
        <nav>
          <Link to="/">App home</Link> · <Link to="/detail">App detail</Link>
        </nav>
        <Routes>
          <Route path="/" element={<p>Application home route</p>} />
          <Route path="/detail" element={<p>Application detail route</p>} />
        </Routes>
        <button onClick={() => setCount((n) => n + 1)}>
          App clicks: {count}
        </button>
      </article>
    </MemoryRouter>
  );
}
export default createBridgeComponent({ rootComponent: App });
