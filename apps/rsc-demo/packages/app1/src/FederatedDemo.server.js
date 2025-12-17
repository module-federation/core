/**
 * FederatedDemo.server.js - Server Component that imports federated modules from app2
 *
 * This demonstrates SERVER-SIDE Module Federation:
 * - app1's RSC server imports components from app2's MF container (app2-remote.js)
 * - The imported components render server-side in app1's RSC stream
 * - React/RSDW are shared via 'rsc' shareScope (singleton)
 *
 * For 'use client' components from app2:
 * - They serialize to client references ($L) in the RSC payload
 * - The actual component code is loaded by app1's client via client-side federation
 *
 * For server components from app2:
 * - They execute in app1's RSC server and render their output inline
 *
 * TODO (Option 2 - Deep MF Integration for Server Actions):
 * To invoke app2's server actions via MF (not HTTP forwarding):
 * 1. The remote 'use server' module would need to register with app1's serverActionRegistry
 * 2. The action ID would need to be in app1's react-server-actions-manifest.json
 * 3. Changes required in:
 *    - packages/react-server-dom-webpack/cjs/rsc-server-loader.js
 *    - packages/react-server-dom-webpack/cjs/react-server-dom-webpack-plugin.js
 *    - packages/react-server-dom-webpack/server.node.js
 * Currently, cross-app actions use HTTP forwarding (Option 1) instead.
 */

import React from 'react';

/**
 * FederatedDemo.server.js - Server Component demonstrating server-side federation concepts
 *
 * IMPORTANT: Server-side federation of 'use client' components requires additional work:
 * - The RSC server needs to serialize 'use client' components as client references ($L)
 * - The client manifest (react-client-manifest.json) must include the remote component
 * - Currently, app1's manifest only knows about app1's components, not app2's
 *
 * For full server-side federation of 'use client' components, we would need to:
 * 1. Merge app2's client manifest into app1's at build time, OR
 * 2. Have app1's RSC server dynamically load and merge app2's client manifest
 *
 * For now, this component demonstrates the CONCEPT of server-side federation
 * without actually importing 'use client' components from app2.
 *
 * What DOES work for server-side federation:
 * - Pure server components from app2 (no 'use client' directive)
 * - Server actions via HTTP forwarding (Option 1)
 * - The FederatedActionDemo client component handles client-side federation
 *
 * TODO (Option 2 - Deep MF Integration):
 * To fully support server-side federation of 'use client' components:
 * 1. Modify webpack build to merge remote client manifests
 * 2. Ensure action IDs from remotes are included in host manifest
 * 3. Changes needed in packages/react-server-dom-webpack/:
 *    - plugin to merge remote manifests
 *    - loader to handle remote client references
 */
export default function FederatedDemo() {
  return (
    <div
      style={{
        marginTop: '16px',
        padding: '12px',
        border: '2px dashed #4f46e5',
        borderRadius: '8px',
        backgroundColor: '#f5f3ff',
      }}
      data-testid="server-federation-demo"
    >
      <h3 style={{margin: '0 0 12px 0', fontSize: '14px', color: '#4f46e5'}}>
        Server-Side Federation Demo
      </h3>
      <p style={{margin: '0 0 8px 0', fontSize: '12px', color: '#6b7280'}}>
        This server component demonstrates the architecture for server-side MF.
      </p>
      <div
        style={{
          padding: '8px',
          backgroundColor: '#e0e7ff',
          borderRadius: '4px',
          fontSize: '11px',
          color: '#4338ca',
        }}
      >
        <strong>Current Status:</strong>
        <ul style={{margin: '4px 0 0 16px', padding: 0}}>
          <li>Server components: Ready (pure RSC from remotes)</li>
          <li>Client components: Via client-side MF (see RemoteButton)</li>
          <li>Server actions: MF-native (fallback: HTTP)</li>
        </ul>
      </div>
      <p style={{marginTop: '8px', fontSize: '11px', color: '#9ca3af'}}>
        Full 'use client' federation requires manifest merging (TODO)
      </p>
    </div>
  );
}
