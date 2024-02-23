import React, { StrictMode } from 'react';
import { init } from '@module-federation/runtime';
import customPlugin from './runtimePlugin';

import * as ReactDOM from 'react-dom/client';

import App from './App';
init({
  name: 'manifest_host',
  remotes: [
    {
      name: 'rspack_provider',
      alias: 'dynamic-remote',
      entry: 'http://localhost:3010/mf-manifest.json',
    },
  ],
  plugins: [customPlugin()],
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
