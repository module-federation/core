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
