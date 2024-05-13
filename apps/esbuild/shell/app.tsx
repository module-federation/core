//@ts-nocheck

import React from 'react';
import { loadRemote } from '@module-federation/runtime';
// const { loadRemoteModule } = require('@module-federation/esbuild');

const RemoteComponent = React.lazy(() =>
  loadRemote('mfe1/component').then((c) => {
    console.log('lazyh', c);
    return { default: c.App };
  }),
);

export function App() {
  return (
    <div className="App">
      <ul>
        <li>
          <a>Home</a>
        </li>
        <li>
          <a>Flights</a>
        </li>
      </ul>

      <React.Suspense fallback="...">
        <RemoteComponent />
      </React.Suspense>
    </div>
  );
}
