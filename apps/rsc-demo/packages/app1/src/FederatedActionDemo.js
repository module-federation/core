'use client';

import React, {useState, useTransition, useEffect} from 'react';

/**
 * FederatedActionDemo - Client component demonstrating cross-app server actions
 *
 * Default behavior (Option 2 - MF-native, in-process):
 * 1. Imports action reference from app2 via Module Federation
 * 2. Calls the action through app1's server (host)
 * 3. app1 resolves the action from the shared serverActionRegistry (registered
 *    when app2's server-actions module is loaded via MF)
 * 4. The action executes in app1's process (no HTTP hop to app2)
 *
 * Fallback (Option 1 - HTTP forwarding):
 * If app1 can't resolve the action locally, it forwards to app2's /react and
 * proxies the response back.
 */
export default function FederatedActionDemo() {
  const [count, setCount] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState(null);
  const [actionModule, setActionModule] = useState(null);

  // Dynamically import the action module from app2 via Module Federation
  // This happens client-side after hydration
  useEffect(() => {
    import('app2/server-actions')
      .then((mod) => {
        setActionModule(mod);
      })
      .catch((err) => {
        console.error('Failed to load federated actions:', err);
        setError('Failed to load federated actions');
      });
  }, []);

  const handleClick = async () => {
    if (!actionModule?.incrementCount) {
      setError('Action not available');
      return;
    }

    startTransition(async () => {
      try {
        // Call the federated action
        // The action reference from app2 will have an action ID that includes 'app2'
        // app1's server will detect this and forward to app2
        const result = await actionModule.incrementCount();
        setCount(result);
        setError(null);
      } catch (err) {
        console.error('Federated action failed:', err);
        setError(err.message || 'Action failed');
      }
    });
  };

  return (
    <div
      style={{
        marginTop: '16px',
        padding: '12px',
        border: '2px solid #10b981',
        borderRadius: '8px',
        backgroundColor: '#ecfdf5',
      }}
      data-testid="federated-action-demo"
    >
      <h3 style={{margin: '0 0 12px 0', fontSize: '14px', color: '#059669'}}>
        Federated Action Demo (MF-native by default)
      </h3>
      <p style={{margin: '0 0 8px 0', fontSize: '12px', color: '#6b7280'}}>
        Calls app2&apos;s incrementCount action through app1 (in-process; HTTP
        fallback)
      </p>

      <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
        <button
          onClick={handleClick}
          disabled={isPending || !actionModule}
          style={{
            padding: '8px 16px',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: isPending ? '#9ca3af' : '#10b981',
            color: 'white',
            cursor: isPending || !actionModule ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
          }}
          data-testid="federated-action-button"
        >
          {isPending
            ? 'Calling...'
            : actionModule
              ? 'Call Remote Action'
              : 'Loading...'}
        </button>

        <span style={{fontSize: '14px', fontWeight: 'bold', color: '#059669'}}>
          Count: <span data-testid="federated-action-count">{count}</span>
        </span>
      </div>

      {error && (
        <p style={{margin: '8px 0 0 0', fontSize: '12px', color: '#dc2626'}}>
          Error: {error}
        </p>
      )}

      <p style={{marginTop: '8px', fontSize: '11px', color: '#9ca3af'}}>
        Action flows: Client → app1 server → MF-native execute (fallback: HTTP
        forward)
      </p>
    </div>
  );
}
