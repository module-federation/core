# @module-federation/rspeedy-plugin

A Module Federation wrapper tailored for `@lynx-js/rspeedy`. It layers shared modules (React, `@lynx-js/react`, JSX runtimes) across Lynx's background and main-thread environments so Rspeedy projects can adopt Module Federation without duplicating runtime wiring.

```ts
import { defineConfig } from '@lynx-js/rspeedy';
import { pluginModuleFederationRspeedy } from '@module-federation/rspeedy-plugin';

export default defineConfig({
  plugins: [
    pluginModuleFederationRspeedy({
      name: 'lynx_host',
      remotes: {
        lynx_remote: 'lynx_remote@http://localhost:3001/mf-manifest.json',
      },
    }),
  ],
});
```
