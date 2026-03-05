'use client';

import React, { useEffect, useState } from 'react';

/**
 * Wrapper component that renders the remote Button from app2.
 * This demonstrates Module Federation cross-app component sharing.
 *
 * This demo expects the remote to be available. If the federated module fails to
 * load, we throw to surface the error rather than silently rendering a fallback.
 */
export default function RemoteButton() {
  const [RemoteButtonImpl, setRemoteButtonImpl] = useState(null);
  const [clickCount, setClickCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    import('app2/Button').then((mod) => {
      if (cancelled) return;
      const Component = mod?.default || mod;
      setRemoteButtonImpl(() => Component);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleClick = () => {
    setClickCount((c) => c + 1);
  };

  if (!RemoteButtonImpl) {
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
        <button
          style={{
            padding: '8px 16px',
            borderRadius: '4px',
            border: 'none',
            fontWeight: 'bold',
            backgroundColor: '#e5e7eb',
            color: '#6b7280',
          }}
          disabled
        >
          Loading remote button…
        </button>
      </div>
    );
  }

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
