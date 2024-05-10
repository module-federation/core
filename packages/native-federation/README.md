# @module-federation/native-federation

Native Federation is a "browser-native" implementation of the successful mental model behind wepback Module Federation for building Micro Frontends and plugin-based solutions. It can be **used with any framework and build tool** for implementing **Micro Frontends** and plugin-based architectures.

## Features

- ✅ Mental Model of Module Federation
- ✅ Future Proof: Independent of build tools like webpack and frameworks
- ✅ Embraces Import Maps -- an emerging browser technology -- and EcmaScript modules
- ✅ Easy to configure
- ✅ Blazing Fast: The reference implementation not only uses the fast esbuild; it also caches already built shared dependencies (like Angular itself). However, as mentioned above, feel free to use it with any other build tool.

## Stack

This library allows to augment your build process, to configure hosts (Micro Frontend shells) and remotes (Micro Frontends), and to load remotes at runtime.

While this core library can be used with any framework and build tool, there is a higher level API on top of it. It hooks into the Angular CLI and provides a builder and schematics:

![Stack](https://github.com/angular-architects/module-federation-plugin/raw/main/libs/native-federation-core/stack.png)

> Please find the [Angular-based version here](https://www.npmjs.com/package/@angular-architects/native-federation).

> Please find the [vite plugin here](https://www.npmjs.com/package/@gioboa/vite-module-federation).

Also, other higher level abstractions on top of this core library are possible.

## About the Mental Model

The underlying mental model allows for runtime integration: Loading a part of a separately built and deployed application into your's. This is needed for Micro Frontend architectures but also for plugin-based solutions.

For this, the mental model introduces several concepts:

- **Remote:** The remote is a separately built and deployed application. It can **expose EcmaScript** modules that can be loaded into other applications.
- **Host:** The host loads one or several remotes on demand. For your framework's perspective, this looks like traditional lazy loading. The big difference is that the host doesn't know the remotes at compilation time.
- **Shared Dependencies:** If a several remotes and the host use the same library, you might not want to download it several times. Instead, you might want to just download it once and share it at runtime. For this use case, the mental model allows for defining such shared dependencies.
- **Version Mismatch:** If two or more applications use a different version of the same shared library, we need to prevent a version mismatch. To deal with it, the mental model defines several strategies, like falling back to another version that fits the application, using a different compatible one (according to semantic versioning) or throwing an error.

## Example

- [VanillaJS example](https://github.com/manfredsteyer/native-federation-core-microfrontend).
- [React example](https://github.com/manfredsteyer/native-federation-react-example)
  - This example also shows the **watch mode** for compiling a federated application
- [Vite + Svelte example](https://github.com/gioboa/svelte-microfrontend-demo)
- [Vite + Angular example powered by AnalogJS](https://github.com/manfredsteyer/native-federation-vite-angular-demo)
- **Your Example:** If you have an example with aspects not covered here, let us know. We are happy to link it here.

## Credits

Big thanks to:

- [Zack Jackson](https://twitter.com/ScriptedAlchemy) for originally coming up with the great idea of Module Federation and its successful mental model
- [Tobias Koppers](https://twitter.com/wSokra) for helping to make Module Federation a first class citizen of webpack
- [Florian Rappl](https://twitter.com/FlorianRappl) for an good discussion about these topics during a speakers dinner in Nuremberg
- [The Nx Team](https://twitter.com/NxDevTools), esp. [Colum Ferry](https://twitter.com/FerryColum), who seamlessly integrated webpack Module Federation into Nx and hence helped to spread the word about it (Nx + Module Federation === ❤️)
- [Michael Egger-Zikes](https://twitter.com/MikeZks) for contributing to our Module Federation efforts and brining in valuable feedback
- The Angular CLI-Team, esp. [Alan Agius](https://twitter.com/AlanAgius4) and [Charles Lyding](https://twitter.com/charleslyding), for working on the experimental esbuild builder for Angular
- [Giorgio Boa](https://twitter.com/giorgio_boa) for implementing the awesome vite plugin for module federation.

## Using this Library

### Installing the Library

```
npm i @module-federation/native-federation
```

As Native Federation is tooling agnostic, we need an adapter to make it work with specific build tools. The package `@module-federation/native-federation-esbuild` contains a simple adapter that uses esbuild:

```
npm i @module-federation/native-federation-esbuild
```

In some situations, this builder also delegates to rollup. This is necessary b/c esbuild does not provide all features we need (yet). We hope to minimize the usage of rollup in the future.

You can also provide your own adapter by providing a function aligning with the `BuildAdapter` type.

### Augment your Build Process

Just call three helper methods provided by our `federationBuilder` in your build process to adjust it for Native Federation.

```typescript
import * as esbuild from 'esbuild';
import * as path from 'path';
import * as fs from 'fs';
import { esBuildAdapter } from '@module-federation/native-federation-esbuild';
import { federationBuilder } from '@module-federation/native-federation/build';


const projectName = 'shell';
const tsConfig = 'tsconfig.json';
const outputPath = `dist/${projectName}`;

/*
  *  Step 1: Initialize Native Federation
*/
await federationBuilder.init({
    options: {
        workspaceRoot: path.join(__dirname, '..'),
        outputPath,
        tsConfig,
        federationConfig: `${projectName}/federation.config.js`,
        verbose: false,
    },

    /*
        * As this core lib is tooling-agnostic, you
        * need a simple adapter for your bundler.
        * It's just a matter of one function.
    */
    adapter: esBuildAdapter
});

/*
  * Step 2: Trigger your build process
  *
  * You can use any tool for this. Here, we go
  * with a very simple esbuild-based build.
  *
  * Just respect the externals in
  * `federationBuilder.externals`.
*/

[...]

await esbuild.build({
    [...]
    external: federationBuilder.externals,
    [...]
});

[...]

/*
  * Step 3: Let the build method do the additional tasks
  *   for supporting Native Federation
*/

await federationBuilder.build();
```

The method `federationBuilder.build` bundles the shared and exposed parts of your app.

### Configuring Hosts

The `withNativeFederation` function sets up a configuration for your applications. This is an example configuration for a host:

```typescript
// shell/federation.config.js

const {
  withNativeFederation,
  shareAll,
} = require('@module-federation/native-federation/build');

module.exports = withNativeFederation({
  name: 'host',

  shared: {
    ...shareAll({
      singleton: true,
      strictVersion: true,
      requiredVersion: 'auto',
      includeSecondaries: false,
    }),
  },
});
```

The API for configuring and using Native Federation is very similar to the one provided by our Module Federation plugin [@angular-architects/module-federation](https://www.npmjs.com/package/@angular-architects/native-federation). Hence, most the articles on it are also valid for Native Federation.

### Sharing

The `shareAll`-helper used here shares all dependencies found in your `package.json`. Hence, they only need to be loaded once (instead of once per remote and host). If you don't want to share all of them, you can opt-out of sharing by using the `skip` option:

```typescript
module.exports = withNativeFederation({
  [...]

  // Don't share my-lib
  skip: [
    'my-lib'
  ]

  [...]
}
```

### Sharing Mapped Paths (Monorepo-internal Libraries)

Paths mapped in your `tsconfig.json` are shared by default too. While they are part of your (mono) repository, they are treaded like libraries:

```json
{
  "compilerOptions": {
    [...]
    "paths": {
      "shared-lib": [
        "libs/shared-lib/index.ts"
      ]
    }
  }
}
```

If you don't want to share (all of) them, put their names into the skip array (see above).

### Configuring Remotes

When configuring a remote, you can expose files that can be loaded into the shell at runtime:

```javascript
const {
  withNativeFederation,
  shareAll,
} = require('@module-federation/native-federation/build');

module.exports = withNativeFederation({
  name: 'mfe1',

  exposes: {
    './component': './mfe1/component',
  },

  shared: {
    ...shareAll({
      singleton: true,
      strictVersion: true,
      requiredVersion: 'auto',
      includeSecondaries: false,
    }),
  },
});
```

### Initializing a Host

On startup, call the `initFederation` method. It takes a mapping between the names of remotes and their `remoteEntry.json`. This is a file containing meta data generated by the augmented build process (see above).

```typescript
import { initFederation } from '@module-federation/native-federation';

(async () => {
  await initFederation({
    mfe1: 'http://localhost:3001/remoteEntry.json',
  });

  await import('./app');
})();
```

You can also pass the name of a file with the key data about your remotes:

```typescript
import { initFederation } from '@module-federation/native-federation';

(async () => {
  await initFederation('assets/manifest.json');

  await import('./app');
})();
```

Following the ideas of our friends at [Nrwl](https://nrwl.io), we call such a file a manifest:

```json
{
  "mfe1": "http://localhost:3001/remoteEntry.json"
}
```

Manifests allow to adjust your application to different environments without any recompilation.

## Initializing a Remote

For initializing a remote, also call `initFederation`. If you don't plan to load further remotes into your remote, you don't need to pass any parameters:

```typescript
import { initFederation } from '@module-federation/native-federation';

(async () => {
  await initFederation();
  await import('./component');
})();
```

### Loading a Remote

To load a remote, just call the `loadRemoteModule` function:

```typescript
const module = await loadRemoteModule({
  remoteName: 'mfe1',
  exposedModule: './component',
});
```

If you know the type of the loaded module (perhaps you have a shared interface), you can use it as a type parameter:

```typescript
const module = await loadRemoteModule<MyRemoteType>({
  remoteName: 'mfe1',
  exposedModule: './component',
});
```

### Polyfill

This library uses Import Maps. As currently not all browsers support this emerging browser feature, we need a polyfill. We recommend the polyfill `es-module-shims` which has been developed for production use cases:

```html
<script type="esms-options">
  {
      "shimMode": true,
      "mapOverrides": true
  }
</script>

<script src="https://ga.jspm.io/npm:es-module-shims@1.5.17/dist/es-module-shims.js"></script>

<script type="module-shim" src="main.js"></script>
```

The script with the type `esms-options` configures the polyfill. This library was built for shim mode. In this mode, the polyfill provides some additional features beyond the proposal for Import Maps. These features, for instance, allow for dynamically creating an import map after loading a first EcmaScript module. Native Federation uses this possibility.

To make the polyfill to load your EcmaScript modules (bundles) in shim mode, assign the type `module-shim`.

## React and Other CommonJS Libs

Native Federation uses Web Standards like EcmaScript Modules. Most libs and frameworks support them meanwhile. Unfortunately, React still uses CommonJS (und UMD). We do our best to convert these libs to EcmaScript Modules. In the case of React there are some challenges due to the dynamic way the React bundles use the `exports` object.

As the community is moving to EcmaScrpt Modules, we expect that these issues will vanish over time. In between, we provide some solutions for dealing with CommonJS-based libraries using `exports` in a dynamic way.

One of them is `fileReplacemnts`:

```javascript
import { reactReplacements } from '@module-federation/native-federation-esbuild/src/lib/react-replacements';
import { createEsBuildAdapter } from '@module-federation/native-federation-esbuild';

[...]

createEsBuildAdapter({
  plugins: [],
  fileReplacements: reactReplacements.prod
})
```

Please note that the adapter comes with `fileReplacements` settings for React for both, `dev` mode and `prod` mode. For similar libraries you can add your own replacements. Also, using the `compensateExports` property, you can activate some additional logic for such libraries to make sure the exports are not lost

```javascript
createEsBuildAdapter({
  plugins: [],
  fileReplacements: reactReplacements.prod,
  compensateExports: [new RegExp('/my-lib/')],
});
```

The default value for `compensateExports` is `[new RegExp('/react/')]`.

## More: Blog Articles

Find out more about our work including Micro Frontends and Module Federation but also about alternatives to these approaches in our [blog](https://www.angulararchitects.io/en/aktuelles/the-microfrontend-revolution-part-2-module-federation-with-angular/).

## More: Angular Architecture Workshop (100% online, interactive)

In our [Angular Architecture Workshop](https://www.angulararchitects.io/en/angular-workshops/advanced-angular-enterprise-architecture-incl-ivy/), we cover all these topics and far more. We provide different options and alternatives and show up their consequences.

[Details: Angular Architecture Workshop](https://www.angulararchitects.io/en/angular-workshops/advanced-angular-enterprise-architecture-incl-ivy/)
