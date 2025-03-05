import React from 'react';
import Card from './Card';

const App: React.FC = () => (
  <div style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
    <h1>Zephyr Rspack Provider</h1>
    <p>This component is exposed via Module Federation and Zephyr:</p>
    <div style={{ marginTop: '1rem' }}>
      <Card />
    </div>
  </div>
);

export default App;
