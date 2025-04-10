import React, { StrictMode } from 'react';
import { init } from '@module-federation/enhanced/runtime';
import * as ReactDOM from 'react-dom/client';
import HelloWorld from './HelloWorld';

init({
  name: 'bundle_size',
  remotes: [], // No remote references needed
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(
  <StrictMode>
    <HelloWorld />
  </StrictMode>,
);
