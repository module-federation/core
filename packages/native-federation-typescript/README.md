# native-federation-typescript

Bundler agnostic plugins to share federated types.

## Install

```bash
npm i -D @module-federation/native-federation-typescript
```

This module provides two plugins:

### NativeFederationTypeScriptRemote

This plugin is used to build the federated types.

#### Configuration

```typescript
{
    moduleFederationConfig: any; // the configuration same configuration provided to the module federation plugin, it is MANDATORY
    tsConfigPath?: string; // path where the tsconfig file is located, default is ''./tsconfig.json'
    typesFolder?: string; // folder where all the files will be stored, default is '@mf-types',
    compiledTypesFolder?: string; // folder where the federated modules types will be stored, default is 'compiled-types'
    deleteTypesFolder?: boolean; // indicate if the types folder will be deleted when the job completes, default is 'true'
    additionalFilesToCompile?: string[] // The path of each additional file which should be emitted
    compilerInstance?: 'tsc' | 'vue-tsc' // The compiler to use to emit files, default is 'tsc'
}
```

#### Additional configuration

Note that, for Webpack, the plugin automatically inject the `devServer.static.directory` configuration.  
For the other bundlers, you should configure it by yourself.

### NativeFederationTypeScriptHost

This plugin is used to download the federated types.

### Configuration

```typescript
{
    moduleFederationConfig: any; // the configuration same configuration provided to the module federation plugin, it is MANDATORY
    typesFolder?: string; // folder where all the files will be stored, default is '@mf-types',
    deleteTypesFolder?: boolean; // indicate if the types folder will be deleted before the job starts, default is 'true'
    maxRetries?: number; // The number of times the plugin will try to download the types before failing, default is 3
}
```

## Bundler configuration

<details>
<summary>Vite</summary><br>

```ts
// vite.config.ts
import { NativeFederationTypeScriptHost, NativeFederationTypeScriptRemote } from '@module-federation/native-federation-typescript/vite';

export default defineConfig({
  plugins: [
    NativeFederationTypeScriptRemote({
      /* options */
    }),
    NativeFederationTypeScriptHost({
      /* options */
    }),
  ],
  /* ... */
  server: {
    // This is needed to emulate the devServer.static.directory of WebPack and correctly serve the zip file
    /* ... */
    proxy: {
      '/@mf-types.zip': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: () => `/@fs/${process.cwd()}/dist/@mf-types.zip`,
      },
    },
    fs: {
      /* ... */
      allow: ['./dist'],
      /* ... */
    },
  },
});
```

<br>
</details>
<details>
<summary>Rollup</summary><br>

```ts
// rollup.config.js
import { NativeFederationTypeScriptHost, NativeFederationTypeScriptRemote } from '@module-federation/native-federation-typescript/rollup';

export default {
  plugins: [
    NativeFederationTypeScriptRemote({
      /* options */
    }),
    NativeFederationTypeScriptHost({
      /* options */
    }),
  ],
};
```

<br>
</details>
<details>
<summary>Webpack</summary><br>

```ts
// webpack.config.js
const { NativeFederationTypeScriptHost, NativeFederationTypeScriptRemote } = require('@module-federation/native-federation-typescript/webpack');
module.exports = {
  /* ... */
  plugins: [
    NativeFederationTypeScriptRemote({
      /* options */
    }),
    NativeFederationTypeScriptHost({
      /* options */
    }),
  ],
};
```

<br>
</details>
<details>
<summary>esbuild</summary><br>

```ts
// esbuild.config.js
import { build } from 'esbuild';
import { NativeFederationTypeScriptHost, NativeFederationTypeScriptRemote } from '@module-federation/native-federation-typescript/esbuild';

build({
  plugins: [
    NativeFederationTypeScriptRemote({
      /* options */
    }),
    NativeFederationTypeScriptHost({
      /* options */
    }),
  ],
});
```

<br>
</details>
<details>
<summary>Rspack</summary><br>

```ts
// rspack.config.js
const { NativeFederationTypeScriptHost, NativeFederationTypeScriptRemote } = require('@module-federation/native-federation-typescript/rspack');
module.exports = {
  /* ... */
  plugins: [
    NativeFederationTypeScriptRemote({
      /* options */
    }),
    NativeFederationTypeScriptHost({
      /* options */
    }),
  ],
};
```

<br>
</details>

<details>
<summary>Rolldown</summary><br>

```ts
// rolldown.config.js
import { NativeFederationTypeScriptHost, NativeFederationTypeScriptRemote } from '@module-federation/native-federation-typescript/rolldown';

export default {
  plugins: [
    NativeFederationTypeScriptRemote({
      /* options */
    }),
    NativeFederationTypeScriptHost({
      /* options */
    }),
  ],
};
```

<br>
</details>

<details>
<summary>Farm</summary><br>

```ts
// farm.config.ts
import { NativeFederationTypeScriptHost, NativeFederationTypeScriptRemote } from '@module-federation/native-federation-typescript/farm';

const config: UserConfig = {
  plugins: [
    NativeFederationTypeScriptRemote({
      /* options */
    }),
    NativeFederationTypeScriptHost({
      /* options */
    }),
  ],
};
```

<br>
</details>

## TypeScript configuration

To have the type definitions automatically found for imports, add paths to the `compilerOptions` in the `tsconfig.json`:

```json
{
  "paths": {
    "*": ["./@mf-types/*"]
  }
}
```

## Examples

To use it in a `host` module, refer to [this example](https://github.com/module-federation/module-federation-examples/tree/master/native-federation-tests-typescript-plugins/host).  
To use it in a `remote` module, refer to [this example](https://github.com/module-federation/module-federation-examples/tree/master/native-federation-tests-typescript-plugins/remote).
