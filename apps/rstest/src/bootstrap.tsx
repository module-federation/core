import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

const containerId = 'root';
let container = document.getElementById(containerId);

if (!container) {
  container = document.createElement('div');
  container.id = containerId;
  document.body.appendChild(container);
}

createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
