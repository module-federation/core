import React from 'react';

const Index = (): JSX.Element => (
  <div className="container-box">
    host user
    <button
      style={{ marginBottom: '1rem' }}
      onClick={() => alert('Client side Javascript works!')}
    >
      Click me to test host interactive!
    </button>
  </div>
);

export default Index;
