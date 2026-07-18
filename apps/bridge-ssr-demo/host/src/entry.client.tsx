import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { readHostSSRContextFromDocument } from './lib/hostSsrContext';

async function bootstrap() {
  const ssrContext = readHostSSRContextFromDocument();
  hydrateRoot(
    document.getElementById('root')!,
    <BrowserRouter>
      <App ssrContext={ssrContext} />
    </BrowserRouter>,
  );
}

const bootstrapPromise = bootstrap();
(
  window as Window & { __BRIDGE_SSR_BOOTSTRAP__?: Promise<void> }
).__BRIDGE_SSR_BOOTSTRAP__ = bootstrapPromise;

void bootstrapPromise;
