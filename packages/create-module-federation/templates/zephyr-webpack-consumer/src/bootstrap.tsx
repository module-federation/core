import React, { lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';

// Import federated component
const RemoteButton = lazy(() => import('provider/Button'));

const App = () => (
  <div style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
    <h1>Zephyr Webpack Consumer</h1>
    <p>This application consumes a federated component:</p>
    <div style={{ marginTop: '1rem' }}>
      <Suspense fallback={<div>Loading Button from Provider...</div>}>
        <RemoteButton />
      </Suspense>
    </div>
  </div>
);

const rootElement = document.getElementById('root')!;
const root = createRoot(rootElement);
root.render(<App />);
