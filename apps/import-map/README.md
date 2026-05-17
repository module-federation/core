# Import Map Runtime Demo

This example demonstrates using `@module-federation/runtime-core` with an
import map. The host (app1) loads the remote (app2) by using a bare specifier
mapped in the import map.

## Running the demo

Start both apps in separate terminals:

```bash
pnpm --filter import-map-app2 run build
pnpm --filter import-map-app2 run serve

pnpm --filter import-map-app1 run build
pnpm --filter import-map-app1 run serve
```

- Host: http://127.0.0.1:3101
- Remote entry (import map target): http://127.0.0.1:3102/remoteEntry.js

## E2E

```bash
pnpm --filter import-map-app1 run test:e2e
```
