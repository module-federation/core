import React, { StrictMode } from 'react';
import {
  init,
  registerGlobalPlugins,
} from '@module-federation/enhanced/runtime';
import * as ReactDOM from 'react-dom';
import App from './App';

init({
  name: 'runtime_host',
  remotes: [
    {
      name: 'runtime_remote2',
      alias: 'dynamic-remote',
      entry: 'http://127.0.0.1:3007/mf-manifest.json',
    },
  ],
});

ReactDOM.render(
  <StrictMode>
    <App />
  </StrictMode>,
  document.getElementById('root') as HTMLElement,
);
