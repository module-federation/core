// import('./bootstrap');
import React, { StrictMode, lazy } from 'react';
import { init } from '@module-federation/runtime';
import * as ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom';
import App from './App';
import Root from './Root';
import customPlugin from './runtimePlugin';

if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
  const originalFetch = window.fetch.bind(window);
  window.fetch = async (...args: Parameters<typeof fetch>) => {
    const requestUrl = String(args[0] ?? '');
    const isManifestRequest =
      requestUrl.includes('localhost:3009') ||
      requestUrl.includes('mf-manifest.json') ||
      requestUrl.includes('@mf-types.zip');
    if (isManifestRequest) {
      // #region agent log
      fetch(
        'http://127.0.0.1:7414/ingest/989a0b49-843c-45a9-b79d-4027ab5a19e4',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Debug-Session-Id': '7e9739',
          },
          body: JSON.stringify({
            sessionId: '7e9739',
            runId: 'manifest-host-runtime',
            hypothesisId: 'H17',
            location: 'apps/manifest-demo/webpack-host/src/index.tsx:24',
            message: 'host fetch start',
            data: { url: requestUrl },
            timestamp: Date.now(),
          }),
        },
      ).catch(() => {});
      // #endregion
    }
    try {
      const response = await originalFetch(...args);
      if (isManifestRequest) {
        // #region agent log
        fetch(
          'http://127.0.0.1:7414/ingest/989a0b49-843c-45a9-b79d-4027ab5a19e4',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Debug-Session-Id': '7e9739',
            },
            body: JSON.stringify({
              sessionId: '7e9739',
              runId: 'manifest-host-runtime',
              hypothesisId: 'H17',
              location: 'apps/manifest-demo/webpack-host/src/index.tsx:34',
              message: 'host fetch response',
              data: {
                url: requestUrl,
                status: response.status,
                ok: response.ok,
                type: response.type,
              },
              timestamp: Date.now(),
            }),
          },
        ).catch(() => {});
        // #endregion
      }
      return response;
    } catch (error) {
      if (isManifestRequest) {
        // #region agent log
        fetch(
          'http://127.0.0.1:7414/ingest/989a0b49-843c-45a9-b79d-4027ab5a19e4',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Debug-Session-Id': '7e9739',
            },
            body: JSON.stringify({
              sessionId: '7e9739',
              runId: 'manifest-host-runtime',
              hypothesisId: 'H17',
              location: 'apps/manifest-demo/webpack-host/src/index.tsx:43',
              message: 'host fetch error',
              data: {
                url: requestUrl,
                errorName: error instanceof Error ? error.name : typeof error,
                errorMessage:
                  error instanceof Error ? error.message : String(error),
              },
              timestamp: Date.now(),
            }),
          },
        ).catch(() => {});
        // #endregion
      }
      throw error;
    }
  };
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      {
        path: 'basic',
        element: <App />,
      },
      {
        path: 'preload',
        Component: lazy(() => import('./Preload')),
      },
    ],
  },
]);

init({
  name: 'manifest_host',
  remotes: [
    {
      name: 'rspack_provider',
      alias: 'dynamic-remote',
      entry: 'http://localhost:3010/mf-manifest.json',
    },
  ],
  plugins: [customPlugin()],
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
