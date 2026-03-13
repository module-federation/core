'use client';

import { useState } from 'react';

const ClientCounter = () => {
  const [count, setCount] = useState(0);

  return (
    <section style={{ marginTop: 16 }}>
      <h2>Client Component</h2>
      <button type="button" onClick={() => setCount((value) => value + 1)}>
        Count: {count}
      </button>
    </section>
  );
};

export default ClientCounter;
