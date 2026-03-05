import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <section>
      <p data-testid="count">Count: {count}</p>
      <button type="button" onClick={() => setCount((v) => v + 1)}>
        Increment
      </button>
    </section>
  );
}
