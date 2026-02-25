import React, { StrictMode } from 'react';
import { init } from '@module-federation/enhanced/runtime';
import * as ReactDOM from 'react-dom/client';
import HelloWorld from './HelloWorld';

init({
  name: 'bundle_size',
  remotes: [], // No remote references needed
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Failed to find the root element');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  React.createElement(StrictMode, null, React.createElement(HelloWorld)),
);
