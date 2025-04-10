import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const rootNode = document.getElementById('root');
if (!rootNode) throw new Error('Root element not found');

const root = createRoot(rootNode);
root.render(
  <React.StrictMode>
    <App basename={'/'} />
  </React.StrictMode>,
);
