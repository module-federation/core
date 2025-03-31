import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// React 19 syntax for creating root
const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
