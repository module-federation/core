import { useState, useEffect } from 'react';

const SimpleButton = () => {
  const [state, setState] = useState('test');
  useEffect(() => {
    setState('test');
  }, []);
  return (
    <button
      style={{
        backgroundColor: 'red',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        border: 'none',
        cursor: 'pointer',
      }}
    >
      A button from home app {state}
    </button>
  );
};

export default SimpleButton;
