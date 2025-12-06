'use client';

import React, {useState, useTransition, useEffect} from 'react';

/**
 * FederatedActionDemo - Client component demonstrating cross-app server action forwarding
 *
 * This component shows Option 1 (HTTP forwarding) for federated server actions:
 * 1. Imports action reference from app2 via Module Federation
 * 2. Calls the action through app1's server (host)
 * 3. app1's server detects the action belongs to app2 and forwards via HTTP
 * 4. app2's server executes the action and returns the result
 * 5. app1 proxies the response back to the client
 *
 * Architecture flow:
 * [Client] --callServer--> [app1 /react] --HTTP forward--> [app2 /react] --execute--> [action]
 *                                        <--proxy response--              <--result--
 *
 * TODO (Option 2 - Deep MF Integration):
 * With native MF action federation, the flow would be:
 * [Client] --callServer--> [app1 /react] --MF require--> [app2 action in memory]
 * No HTTP hop needed, action executes directly in app1's process.
 * Requires changes to rsc-server-loader.js, react-server-dom-webpack-plugin.js, server.node.js
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
        Federated Action Demo (Option 1: HTTP Forwarding)
      </h3>
      <p style={{margin: '0 0 8px 0', fontSize: '12px', color: '#6b7280'}}>
        Calls app2's incrementCount action via HTTP forwarding through app1
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
        Action flows: Client → app1 server → HTTP forward → app2 server →
        execute
      </p>
    </div>
  );
}
