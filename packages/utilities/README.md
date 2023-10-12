# utils

This library was generated with [Nx](https://nx.dev).

## Building

Run `nx build utils` to build the library.

## Running unit tests

Run `nx test utils` to execute the unit tests via [Jest](https://jestjs.io).

## React utilities

---

`FederatedBoundary`

A component wrapper that provides a fallback for safe imports if something were to fail when grabbing a module off of a remote host.

This wrapper also exposes an optional property for a custom react error boundary component.

Any extra props will be passed directly to the imported module.

Usage looks something like this:

```js
import { FederationBoundary } from '@module-federation/utilities/src/utils/react';

// defining dynamicImport and fallback outside the Component to keep the component identity
// another alternative would be to use useMemo
const dynamicImport = () => import('some_remote_host_name').then((m) => m.Component);
const fallback = () => import('@npm/backup').then((m) => m.Component);

const MyPage = () => {
  return <FederationBoundary dynamicImporter={dynamicImport} fallback={fallback} customBoundary={CustomErrorBoundary} />;
};
```

---

`ImportRemote`

A function which will enable dynamic imports of remotely exposed modules using the Module Federation plugin. It uses the method described in the official Webpack configuration under <a href="https://webpack.js.org/concepts/module-federation/#dynamic-remote-containers" target="_blank">Dynamic Remote Containers</a>.

This function will allow you to provide a static url or an async method to retrieve a url from a configuration service.

Usage looks something like this:

```js
import { importRemote } from '@module-federation/utilities';

// --
// If it's a regular js module:
// --
importRemote({
  url: 'http://localhost:3001',
  scope: 'Foo',
  module: 'Bar',
}).then(
  (
    {
      /* list of Bar exports */
    },
  ) => {
    // Use Bar exports
  },
);

// --
// If it's a ESM module (this is currently the default for NX):
// --
const Bar = lazy(() => importRemote({ url: 'http://localhost:3001', scope: 'Foo', module: 'Bar', esm: true }));

return (
  <Suspense fallback={<div>Loading Bar...</div>}>
    <Bar />
  </Suspense>
);

// --
// If Bar is a React component you can use it with lazy and Suspense just like a dynamic import:
// --
const Bar = lazy(() => importRemote({ url: 'http://localhost:3001', scope: 'Foo', module: 'Bar' }));

return (
  <Suspense fallback={<div>Loading Bar...</div>}>
    <Bar />
  </Suspense>
);
```

```js
import { importRemote } from '@module-federation/utilities';

// If it's a regular js module:
importRemote({
  url: () => MyAsyncMethod('remote_name'),
  scope: 'Foo',
  module: 'Bar',
}).then(
  (
    {
      /* list of Bar exports */
    },
  ) => {
    // Use Bar exports
  },
);

// If Bar is a React component you can use it with lazy and Suspense just like a dynamic import:
const Bar = lazy(() =>
  importRemote({
    url: () => MyAsyncMethod('remote_name'),
    scope: 'Foo',
    module: 'Bar',
  }),
);

return (
  <Suspense fallback={<div>Loading Bar...</div>}>
    <Bar />
  </Suspense>
);
```

```js
// You can also combine importRemote and FederationBoundary to have a dynamic remote URL and a fallback when there is an error on the remote

const dynamicImporter = () =>
  importRemote({
    url: 'http://localhost:3001',
    scope: 'Foo',
    module: 'Bar',
  });
const fallback = () => import('@npm/backup').then((m) => m.Component);

const Bar = () => {
  return <FederationBoundary dynamicImporter={dynamicImporter} fallback={fallback} />;
};
```

```js
// If Bar is a React component you can use it with lazy
const Bar = lazy(() =>
  importRemote({
    url: () => MyAsyncMethod('remote_name'),
    scope: 'Foo',
    module: 'Bar',
    remoteEvents: {
      beforePreloadRemote: () => Promise.resolve()
      beforeLoadRemote: () => Promise.resolve()
      remoteLoaded: () => Promise.resolve()
    }
  }),
);

return (
  <Suspense fallback={<div>Loading Bar...</div>}>
    <Bar />
  </Suspense>
);
```

## Additional Configuration

Apart from **url**, **scope** and **module** you can also pass additional options to the **importRemote()** function:

- **remoteEntryFileName**: The name of the remote entry file. Defaults to "remoteEntry.js".
- **bustRemoteEntryCache**: Whether to add a cache busting query parameter to the remote entry file URL. Defaults to **true**. You can disable it if cachebusting is handled by the server.
- **esm**: If this module is built as an ESM module in webpack (default NX module type)
- **remoteEvents**: An object allowing you to add handlers for different remote lifecycles.

## Remote Event Lifecycles

These events can be useful for logging or collection metrics around performance of remote loading in the browser.

- **beforePreloadRemote**: Runs before a remoteEntry file is fetched for a particular module scope.
- **beforeLoadRemote**: Runs after a remoteEntry file is fetched, but before modules bundles are fetched.
- **remoteLoaded**: Runs after remote modules are fetched but before the modules are returned.
