import React, { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';

import App from './app/App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Failed to find the root element');
}

const root = ReactDOM.createRoot(rootElement);
root.render(React.createElement(StrictMode, null, React.createElement(App)));
