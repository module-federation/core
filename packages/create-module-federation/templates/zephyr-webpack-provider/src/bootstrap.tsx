import React from 'react';
import { createRoot } from 'react-dom/client';
import Button from './Button';

const App: React.FC = () => (
  <div style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
    <h1>Zephyr Webpack Provider - {{ mfName }}</h1>
    <p>This component is exposed via Module Federation and Zephyr:</p>
    <div style={{ marginTop: '1rem' }}>
      <Button />
    </div>
  </div>
);

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');
const root = createRoot(rootElement);
root.render(<App />);
