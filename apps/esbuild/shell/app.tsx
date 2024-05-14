//@ts-nocheck

import React from 'react';
import { App as RemoteApp } from 'mfe1/component';

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
