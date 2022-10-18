## Typescript support for module federated apps

### Installation
```
$ npm i @module-federation/typescript
```

### Usage
Register the plugin in `webpack configuration (webpack.config.js)` file

```typescript
const FederatedTypesPlugin = require('@module-federation/typescript')

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
}

plugins: [
  // ...
  new ModuleFederationPlugin(federationConfig),
  new FederatedTypesPlugin(), // Optional: you can pass federationConfig object here as well
]
```

You need to register this plugin in both remote and host apps. The plugin will automatically create a directory named `@mf-typescript` in the host app - that contains all the types exported by the remote apps.

To have the type definitions automatically found for imports, add `paths` in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "*": ["./@mf-typescript/*"]
    }
  },
}
```

### Usage in Next.js
You need to manually pass the `federationConfig` object to the plugin. The `remotes` value should contain absolute path.

Sample code:
```typescript
// next.config.js
const FederatedTypesPlugin = require('@module-federation/typescript')

module.exports = {
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.plugins.push(
      new ModuleFederationPlugin(federationConfig),
      new FederatedTypesPlugin({
        ...federationConfig,
        remotes: { app2: 'app2@http://localhost:3000/remoteEntry.js' }
      })
    )
    return config
  },
}
```

### Support
Drop me a message on twitter for support/feedback, or maybe just say Hi at [@prasannamestha](https://twitter.com/prasannamestha)

### Credits
Shoutout to [@ScriptedAlchemy](https://twitter.com/ScriptedAlchemy) for helping with the development of this plugin.
