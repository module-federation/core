# Shared Bridge routing

`createBridgeRouterConnector` from `@module-federation/bridge-shared/router`
coordinates one framework Router with browser history through an adapter. The
router subpath has no React type dependencies. The adapter supplies current and
pending locations, history entry keys, subscriptions, and operations that refresh
or notify Routers without writing history twice. The writing Router must be
excluded from its own peer notification, even while its next navigation loads.
The shared package does not import a framework Router or require a runtime plugin.

The connector consumes the existing Bridge navigation adapter when available.
It reconciles redirects completed before subscription, avoids restarting loaders
already processing the same history entry, and drops queued work on disposal.
Frameworks remain responsible for Browser/Hash URL interpretation and disposing
their Router. The React Bridge package re-exports the connector from its default,
`/base`, `/v18`, and `/v19` entries.

## Debug mode

> open debug mode

```js
// browser
localStorage.setItem('debug', 'true');
localStorage.setItem('debug:stack', 'true');

// node
process.env.DEBUG = 'true';
```
