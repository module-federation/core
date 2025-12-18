'use client';

import { useState } from 'react';

export default function SharedClientButton({ label, onClick }) {
  const [clicked, setClicked] = useState(false);

  return (
    <button
      onClick={() => {
        setClicked(true);
        onClick?.();
      }}
      style={{
        background: clicked ? 'green' : 'blue',
        color: 'white',
        padding: '8px 16px',
      }}
    >
      {label} {clicked ? '(clicked!)' : ''}
    </button>
  );
}
