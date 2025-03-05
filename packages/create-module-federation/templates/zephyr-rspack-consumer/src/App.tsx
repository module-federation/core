import React, { lazy, Suspense } from 'react';

// Import federated component
const RemoteCard = lazy(() => import('provider/Card'));

const App: React.FC = () => (
  <div style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
    <h1>Zephyr Rspack Consumer</h1>
    <p>This application consumes a federated component:</p>
    <div style={{ marginTop: '1rem' }}>
      <Suspense fallback={<div>Loading Card from Provider...</div>}>
        <RemoteCard />
      </Suspense>
    </div>
  </div>
);

export default App;
