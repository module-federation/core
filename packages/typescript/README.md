# Federated Types

This plugin enables **Typescript Types** support for Module Federated Components.

## Installation

```
$ npm i @bruno-module-federation/typescript
```

## Usage

Register the plugin in `webpack configuration (webpack.config.js)` file

```typescript
import webpack from 'webpack';
const { FederatedTypesPlugin } = require('@bruno-module-federation/typescript');

const federationConfig = {
  name: 'my-app',
  filename: 'remoteEntry.js',
  exposes: {
    //...exposed components
    './Button': './src/Button',
    './Input': './src/Input',
  },
  remotes: {
    app2: 'app2@http://localhost:3002/remoteEntry.js', // or Just the URL 'http://localhost:3002/remoteEntry.js'
  },
  shared: ['react', 'react-dom'],
};

module.exports = {
  /* ... */
  plugins: [
    // ...
    new FederatedTypesPlugin({
      federationConfig,
      // ...
    }),
  ],
};
```

To enable verbose logging add folowing in webpack config:

```javascript
infrastructureLogging: {
  level: 'log';
}
```

The Module Federation plugin is required to be registered separately from this plugin. The federation configuration provided to the Typescript plugin or Module Federation plugin can be different, as an example - to discern pure javascript remotes from Typescript remotes.

You need to register this plugin in both remote and host apps. The plugin will automatically create a directory named `@mf-types` in the host app - that contains all the types exported by the remote apps.

To have the type definitions automatically found for imports, add `paths` in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "*": ["./@mf-types/*"]
    }
  }
}
```

`baseUrl` must also be set for `paths` to work properly

## Plugin Options

| Setting                       | Type             | Required | Default     | Description                                                                                                                                                                                |
| ----------------------------- | ---------------- | -------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| additionalFilesToCompile      | string[]         | No       | []          | Any additional files to be included (besides `ModuleFederationPluginOptions.remotes`) in the emission of Typescript types. This is useful for `global.d.ts` files not directly referenced. |
| compiler                      | `tsc or vue-tsc` | No       | tsc         | The compiler to use to emit declaration files. Use `vue-tsc` to emit declarations from your Vue Templates                                                                                  |
| disableTypeCompilation        | boolean          | No       | false       | Disable compiling types for exposed components                                                                                                                                             |
| disableDownloadingRemoteTypes | boolean          | No       | false       | Disable downloading types from remote apps                                                                                                                                                 |
| downloadRemoteTypesTimeout    | number           | No       | `2000`      | The maximum time to wait for downloading remote types. This is to prevent blocking compilation or hanging the plugin.                                                                      |
| federationConfig              |                  | Yes      | -           | Configuration for `ModuleFederationPlugin`                                                                                                                                                 |
| typescriptFolderName          | string           | No       | `@mf-types` | The folder name to download remote types and output compiled types                                                                                                                         |
| typescriptCompiledFolderName  | string           | No       | `_types`    | The folder name to output the raw output from the ts compiler                                                                                                                              |

## Usage in Next.js

You need to manually pass the `federationConfig` object to the plugin. The `remotes` value should contain absolute path.

Sample code:

```typescript
// next.config.js
const FederatedTypesPlugin = require('@bruno-module-federation/typescript');

module.exports = {
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.plugins.push(
      new FederatedTypesPlugin({
        federationConfig: {
          ...federationConfig,
          remotes: { app2: 'app2@http://localhost:3000/remoteEntry.js' },
        },
        // ...
      }),
    );
    return config;
  },
};
```

### Support

Drop me a message on twitter for support/feedback, or maybe just say Hi at [@prasannamestha](https://twitter.com/prasannamestha)

### Credits

Shoutout to [@ScriptedAlchemy](https://twitter.com/ScriptedAlchemy) for helping with the development of this plugin.
