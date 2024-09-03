# `@module-federation/enhanced`

This package provides enhanced features for module federation.

The following items are exported:

- ModuleFederationPlugin
- ContainerPlugin
- ContainerReferencePlugin
- SharePlugin
- ConsumeSharedPlugin
- ProvideSharedPlugin
- FederationRuntimePlugin
- AsyncBoundaryPlugin
- HoistContainerReferencesPlugin

## Documentation

See [https://module-federation.io/guide/basic/webpack.html](https://module-federation.io/guide/basic/webpack.html) for details.

## ModuleFederationPlugin

### Configuration

### name

- Type: `string`
- Required: No

The name of the container.

### exposes

- Type: `Exposes`
- Required: No
- Default: `undefined`

Used to specify the modules and file entry points that are exposed via Module Federation. After configuration, the exposed modules will be extracted into a separate chunk, and if there are async chunks, they will also be extracted into a separate chunk (the specific splitting behavior depends on the chunk splitting rules).

The `Exposes` type is defined as follows:

```tsx
type Exposes = (ExposesItem | ExposesObject)[] | ExposesObject;

type ExposesItem = string;

type ExposesItems = ExposesItem[];

interface ExposesObject {
  [exposeKey: string]: ExposesConfig | ExposesItem | ExposesItems;
}
```

Here, `exposeKey` is essentially the same as the [Package Entry Points](https://nodejs.org/api/packages.html#package-entry-points) specification (except that regular expression matching is not supported).

For example:

```jsx
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'mfButton',
      exposes: {
        // Note: "./" is not supported
        '.': './src/index.tsx',
        './add': './src/utils/add.ts',
        './Button': './src/components/Button.tsx',
      },
    }),
  ],
};
```

### remotes

> This is a consumer-specific parameter. If remotes is set, it can be considered as a consumer.

- Type: `Remotes`
- Required: No
- Default: `undefined`

This is used to specify how Module Federation consumes remote modules.

The `Remotes` type is defined as follows:

```tsx
type Remotes = (RemotesItem | RemotesObject)[] | RemotesObject;

type RemotesItem = string;
type RemotesItems = RemotesItem[];

interface RemotesObject {
  [remoteAlias: string]: RemotesConfig | RemotesItem | RemotesItems;
}
```

Here, `remoteAlias` is the name actually used by the user and can be configured arbitrarily. For example, if `remoteAlias` is set to `demo`, the consumption method is `import xx from 'demo'`.

### shared

- Type: `Shared`
- Required: No
- Default: `undefined`

`shared` is used to share common dependencies between consumers and producers, reducing runtime download size and thus improving performance.

The `Shared` type is defined as follows:

```tsx
type Shared = (SharedItem | SharedObject)[] | SharedObject;

type SharedItem = string;

interface SharedObject {
  [k: string]: SharedConfig | SharedItem;
}
```

#### singleton

- Type: `boolean`
- Required: No
- Default: `false`

Determines whether only one version of the shared module is allowed in the shared scope (singleton mode).

- If the value is true, singleton mode is enabled; if the value is false, singleton mode is not enabled.
- If singleton mode is enabled, the shared dependencies of the remote application components and host application are loaded only once, and a higher version is loaded when the versions are not consistent. At this time, a warning will be given to the lower version side:
- If singleton mode is not enabled, if the versions of shared dependencies between the remote application and host application are not consistent, the remote application and host application load their own dependencies

#### requiredVersion

- Type: `string`
- Required: False
- Default: `require('project/package.json')[devDeps | dep]['depName']`

The required version can be a version range. The default value is the dependency version of the current application.

- When using shared dependencies, it will be judged whether the dependency version meets requiredVersion. If it does, it will be used normally. If it is less than requiredVersion, a warning will be issued in the console, and the smallest version in the current shared dependency will be used.
- When one side sets requiredVersion and the other side sets singleton, the dependency of requiredVersion will be loaded, and the singleton side will directly use the dependency of requiredVersion, regardless of the version.

#### eager

:::warning
When `eager` is set to true, the shared dependencies will be packaged into the entry file, which will cause the entry file to be too large. Please open with caution.
`eager: true` is rarely recommended
:::

- Type: `boolean`
- Required: False
- Default: `false`

Determines whether to load shared modules immediately.

Under normal circumstances, you need to open the asynchronous entry, and then load shared asynchronously on demand. If you want to use shared but don't want to enable asynchronous entry, you can set `eager` to true .

### runtimePlugins

- Type: `string[]`
- Required: False
- Default: `undefined`

Used to add additional plug-ins required at runtime. The value is the path of the specific plug-in. It supports absolute/relative paths and package names.

Once set, the runtime plugin is automatically injected and used at build time.

### implementation

- Type: `string`
- Required: False
- Default: `undefined`

Used to modify the actual bundler runtime version. Path with value `@module-federation/runtime-tools`.
