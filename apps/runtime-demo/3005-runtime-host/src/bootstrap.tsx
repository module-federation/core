import React, { StrictMode } from 'react';
import { init } from '@module-federation/enhanced/runtime';
import * as ReactDOM from 'react-dom/client';
import App from './App';
import { diagnostics } from './diagnostics';

init({
  name: 'runtime_host',
  security: {
    diagnostics: {
      enabled: true,
      maxEvents: 100,
      console: true,
      browserGlobal: true,
    },
  },
  plugins: [diagnostics.plugin],
  remotes: [
    {
      name: 'runtime_remote2',
      alias: 'dynamic-remote',
      entry: 'http://127.0.0.1:3007/mf-manifest.json',
    },
  ],
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
