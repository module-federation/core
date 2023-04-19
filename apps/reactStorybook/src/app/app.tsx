import * as React from 'react';

const ReactRemoteUiButton = React.lazy(() => import('reactRemoteUI/Button'));

export function App() {
  return (
    <React.Suspense fallback={null}>
      Remote button:
      <ReactRemoteUiButton>ReactRemoteUiButton</ReactRemoteUiButton>
    </React.Suspense>
  );
}

export default App;
