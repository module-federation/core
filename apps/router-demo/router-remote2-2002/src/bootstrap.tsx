import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

//@ts-ignore
const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App basename={'/remote2'} />
  </React.StrictMode>,
);
