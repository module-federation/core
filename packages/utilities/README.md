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
import { FederationBoundary } from "@module-federation/utilities/react";

const MyPage = () => {
  return (
    <FederationBoundary
      dynamicImport={() => import("some_remote_host_name").then((m) => m.Component)}
      fallback={() => import("@npm/backup").then((m) => m.Component)}
      customBoundary={CustomErrorBoundary}
    />
  )
}
```