# `module-federation-ai-proxy-remotes`

Use this Runtime Plugin to let AI debug Module Federation remotes in any environment by switching them to local manifests from a URL or a floating browser console, without depending on a Chrome extension environment.

## Use cases

- Ask an AI coding agent to start a remote locally and open the host with the correct proxy rule.
- Debug a host against one or more locally running remotes.
- Save and switch proxy rules from the page without opening DevTools.

## Install

```bash
pnpm add -D module-federation-ai-proxy-remotes
```

## Add the Runtime Plugin

Install and configure this plugin in the **host** application.

Add the package name to `runtimePlugins` in the Module Federation plugin configuration:

```ts title="module-federation.config.ts"
export default {
  name: 'host',
  runtimePlugins: ['module-federation-ai-proxy-remotes'],
};
```

## Enable debugging

Add `__mf_devtools` to the host URL:

```text
https://host.example.com/checkout?__mf_devtools
```

The page refreshes and removes the parameter from the address bar. Debugging remains enabled for the current tab session. Use **Disable debug** in the floating console to turn it off; saved rules are retained until the tab session ends.

## Configure remotes from the URL

```js
const config = {
  overrides: {
    checkout: 'http://localhost:3001/mf-manifest.json',
  },
};

const createDebugUrl = (hostUrl, debugConfig) => {
  const url = new URL(hostUrl);
  url.searchParams.set('__mf_devtools', JSON.stringify(debugConfig));
  return url.href;
};

console.log(createDebugUrl('https://host.example.com/checkout', config));
```

Open the generated URL to enable debugging and save the rule. Remote names and aliases are both supported.

## Proxy domain security

By default, the plugin only accepts manifest URLs hosted on `localhost` or `127.0.0.1`. Every override URL must:

- use the `http:` or `https:` protocol;
- point to a path ending in `.json`;
- not contain a username or password; and
- use a default host or a hostname explicitly listed in `allowedHosts`.

`allowedHosts` contains exact hostnames without a protocol, port, path, or wildcard. For example, `assets.example.com` allows URLs on that hostname, including URLs with an explicit port, but does not allow `sub.assets.example.com`.

Add only trusted hosts that are required for debugging:

```ts
import { aiDebugRuntimePlugin } from 'module-federation-ai-proxy-remotes/core';

export default () =>
  aiDebugRuntimePlugin({
    allowedHosts: ['assets.example.com', 'mf-dev.internal.example.com'],
  });
```

The target server must also allow the host application to request the manifest according to its CORS policy. Remove temporary non-local hosts after debugging.

## Options

| Option          | Type                               | Default           | Usage                                               |
| --------------- | ---------------------------------- | ----------------- | --------------------------------------------------- |
| `allowedHosts`  | `string[]`                         | `[]`              | Allow additional trusted manifest hosts.            |
| `parameterName` | `string`                           | `__mf_devtools`   | Use another activation and configuration parameter. |
| `storageKey`    | `string`                           | `__MF_DEVTOOLS__` | Use another session storage key for saved rules.    |
| `console`       | `boolean \| AIDebugConsoleOptions` | URL-controlled    | Hide or configure the floating console.             |
