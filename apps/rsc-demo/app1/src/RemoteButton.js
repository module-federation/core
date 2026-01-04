'use client';

import React, { useState, useEffect } from 'react';

/**
 * Wrapper component that renders the remote Button from app2.
 * This demonstrates Module Federation cross-app component sharing.
 *
 * This demo expects the remote to be available. If the federated module fails to
 * load, we throw to surface the error rather than silently rendering a fallback.
 */
export default function RemoteButton() {
  const [clickCount, setClickCount] = useState(0);
  const [RemoteButtonImpl, setRemoteButtonImpl] = useState(null);
  const [loadError, setLoadError] = useState(null);

  // Only import the federated module on the client after mount.
  // Module Federation Enhanced resolves 'app2/Button' as a remote.
  useEffect(() => {
    let cancelled = false;

    const loadRemote = async () => {
      try {
        const mod = await import('app2/Button');
        if (cancelled) {
          return;
        }
        const Comp = mod && (mod.default || mod);
        if (typeof Comp === 'function') {
          setRemoteButtonImpl(() => Comp);
        } else {
          setLoadError(
            new Error('Remote button module did not export a component'),
          );
        }
      } catch (err) {
        if (!cancelled) setLoadError(err);
      }
    };

    loadRemote();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleClick = () => {
    setClickCount((c) => c + 1);
  };

  if (loadError) {
    throw loadError;
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
      {RemoteButtonImpl ? (
        <RemoteButtonImpl
          variant="primary"
          onClick={handleClick}
          data-testid="federated-button"
        >
          Remote Click: {clickCount}
        </RemoteButtonImpl>
      ) : (
        <span>Loading remote button...</span>
      )}
      <p style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
        This button is loaded from app2 via Module Federation
      </p>
    </div>
  );
}
