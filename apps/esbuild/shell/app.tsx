//@ts-nocheck

import React from 'react';
// Remote modules are loaded via Module Federation runtime.
// Since remote exports are unknown at build time, use default import
// and destructure the named exports from it.
import RemoteModule from 'mfe1/component';
const RemoteApp = RemoteModule.App || RemoteModule;

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
        <RemoteApp />
      </React.Suspense>
    </div>
  );
}
