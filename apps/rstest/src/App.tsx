import React, { Suspense } from 'react';
import { Counter } from './Counter';

const RemoteButton = React.lazy(() => import('rstest_remote/Button'));

export function App() {
  return (
    <main>
      <h1>Rstest Demo App</h1>
      <Counter />
      <Suspense
        fallback={<p data-testid="remote-loading">Loading remote...</p>}
      >
        <RemoteButton />
      </Suspense>
    </main>
  );
}
