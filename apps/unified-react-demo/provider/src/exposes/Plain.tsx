import React, { useState } from 'react';
export default function Plain({ label = 'plain' }: { label?: string }) {
  const [clicks, setClicks] = useState(0);
  return (
    <article data-testid="plain">
      <h3>SSR plain component</h3>
      <p>{label}</p>
      <button onClick={() => setClicks((n) => n + 1)}>
        Plain clicks: {clicks}
      </button>
    </article>
  );
}
