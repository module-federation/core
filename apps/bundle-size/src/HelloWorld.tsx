import React from 'react';
// Runtime core is auto-injected by the federation plugin

const HelloWorld = () => {
  return (
    <div
      style={{
        padding: '20px',
        textAlign: 'center',
        borderRadius: '4px',
        backgroundColor: '#f0f0f0',
        margin: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <h2>Hello World from Module Federation!</h2>
      <p>This is an exposed component from the bundle-size app</p>
    </div>
  );
};

export default HelloWorld;
