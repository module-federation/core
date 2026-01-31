# @module-federation/rstest-plugin

This package contains the `federation()` Rsbuild plugin used by Rstest to enable Module Federation compatibility mode
for Node test environments (JSDOM / Node workers).

It is extracted from `rstest/packages/core/src/core/plugins/federation.ts` to allow shared ownership and versioning
alongside other Module Federation tooling.

## Usage (via @rstest/core)

Most users should continue to import from `@rstest/core`:

```ts
import { defineConfig, federation } from '@rstest/core';

export default defineConfig({
  federation: true,
  plugins: [federation()],
});
```

