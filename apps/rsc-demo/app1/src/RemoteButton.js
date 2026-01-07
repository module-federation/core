'use client';

import React, { useState } from 'react';
import RemoteButtonImpl from 'app2/Button';

/**
 * Wrapper component that renders the remote Button from app2.
 * This demonstrates Module Federation cross-app component sharing.
 *
 * This demo expects the remote to be available. If the federated module fails to
 * load, we throw to surface the error rather than silently rendering a fallback.
 */
export default function RemoteButton() {
  const [clickCount, setClickCount] = useState(0);

  const handleClick = () => {
    setClickCount((c) => c + 1);
  };

  return (
    <div
      style={{
        marginTop: '16px',
        padding: '12px',
        border: '1px solid #ddd',
        borderRadius: '8px',
      }}
    >
      <h3 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>
        Federated Button from App2
      </h3>
      <RemoteButtonImpl
        variant="primary"
        onClick={handleClick}
        data-testid="federated-button"
      >
        Remote Click: {clickCount}
      </RemoteButtonImpl>
      <p style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
        This button is loaded from app2 via Module Federation
      </p>
    </div>
  );
}
