import React, { StrictMode } from 'react';
import { init } from '@module-federation/runtime';
import customPlugin from './runtimePlugin';

import * as ReactDOM from 'react-dom/client';

import App from './App';

init({
  name: 'runtime_host',
  remotes: [
    {
      name: 'runtime_remote2',
      alias: 'dynamic-remote',
      entry: 'http://localhost:3007/remoteEntry.js',
    },
  ],
  // shared: {
  //   react: {
  //     version: '18.2.0',
  //     scope: 'default',
  //     lib: () => React,
  //     shareConfig: {
  //       singleton: true,
  //       requiredVersion: '>17',
  //     },
  //   },
  //   'react-dom': {
  //     version: '18.2.0',
  //     scope: 'default',
  //     lib: () => ReactDOM,
  //     shareConfig: {
  //       singleton: true,
  //       requiredVersion: '>17',
  //     },
  //   },
  // },
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
