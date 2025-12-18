/**
 * Shared client bootstrap for the RSC notes apps.
 *
 * This is imported by both app1 and app2 via their local
 * src/framework/bootstrap.js wrappers so that the boot logic
 * stays in one place.
 */

import { createRoot, hydrateRoot } from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';
import { Router, callServer, initFromSSR } from './router';

// Set up global callServer for server action references
// This is used by the server-action-client-loader transformation
globalThis.__RSC_CALL_SERVER__ = callServer;

const rootElement = document.getElementById('root');

// Check if we have SSR data embedded in the page
const rscDataElement = document.getElementById('__RSC_DATA__');

if (rscDataElement && rootElement && rootElement.children.length > 0) {
  // Hydration path: SSR'd HTML exists, hydrate from embedded RSC data
  try {
    const rscData = JSON.parse(rscDataElement.textContent);
    initFromSSR(rscData);
    hydrateRoot(rootElement, <Root />);
  } catch (error) {
    console.error('Hydration failed, falling back to client render:', error);
    const root = createRoot(rootElement);
    root.render(<Root />);
  }
} else if (rootElement) {
  // Client-only path: no SSR, render from scratch
  const root = createRoot(rootElement);
  root.render(<Root />);
}

function Root() {
  return (
    <ErrorBoundary FallbackComponent={Error}>
      <Router />
    </ErrorBoundary>
  );
}

function Error({ error }) {
  return (
    <div>
      <h1>Application Error</h1>
      <pre style={{ whiteSpace: 'pre-wrap' }}>{error.stack}</pre>
    </div>
  );
}
