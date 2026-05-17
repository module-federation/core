import React, { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';

import Button from './Button';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Failed to find the root element');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  React.createElement(
    StrictMode,
    null,
    React.createElement(
      'div',
      null,
      'UI Library Button:',
      React.createElement(Button, null, 'Test Button'),
    ),
  ),
);
