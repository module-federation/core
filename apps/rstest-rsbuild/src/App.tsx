import React, { Suspense } from 'react';
import { Counter } from './Counter';

const RemoteButton = React.lazy(() => import('rstest_remote/Button'));

export function App() {
  return (
    <main>
      <h1>Rstest Rsbuild Adapter Demo</h1>
      <Counter />
      <Suspense fallback={<p>Loading remote...</p>}>
        <RemoteButton />
      </Suspense>
    </main>
  );
}
