'use client';

import { useState } from 'react';

/**
 * A federated Button component from app2.
 * This is exposed via Module Federation and consumed by app1.
 */
export default function Button({ children, onClick, variant = 'primary' }) {
  const [clicked, setClicked] = useState(false);

  const handleClick = (e) => {
    setClicked(true);
    setTimeout(() => setClicked(false), 200);
    onClick?.(e);
  };

  const baseStyle = {
    padding: '8px 16px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'transform 0.1s',
    transform: clicked ? 'scale(0.95)' : 'scale(1)',
  };

  const variants = {
    primary: { backgroundColor: '#3b82f6', color: 'white' },
    secondary: { backgroundColor: '#6b7280', color: 'white' },
    danger: { backgroundColor: '#ef4444', color: 'white' },
  };

  return (
    <button
      style={{ ...baseStyle, ...variants[variant] }}
      onClick={handleClick}
      data-testid="federated-button"
      data-from="app2"
    >
      {children}
    </button>
  );
}
