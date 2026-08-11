import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { createBridgeHydrationRegistry } from '@module-federation/bridge-shared';
import { BridgeHydrationProvider } from '@module-federation/bridge-react';
import App from './App';
import { readHostSSRContextFromDocument } from './lib/hostSsrContext';

async function bootstrap() {
  const ssrContext = readHostSSRContextFromDocument();
  const registry = createBridgeHydrationRegistry(document);
  hydrateRoot(
    document.getElementById('root')!,
    <BridgeHydrationProvider registry={registry}>
      <BrowserRouter>
        <App ssrContext={ssrContext} />
      </BrowserRouter>
    </BridgeHydrationProvider>,
  );
}

const bootstrapPromise = bootstrap();
(
  window as Window & { __BRIDGE_SSR_BOOTSTRAP__?: Promise<void> }
).__BRIDGE_SSR_BOOTSTRAP__ = bootstrapPromise;

void bootstrapPromise;
