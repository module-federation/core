# `@module-federation/runtime`

- Can be combined with the build plug-in to share basic dependencies according to policies to reduce the number of module downloads and improve the loading speed of modules.
- Only consume part of the export of the remote module and will not fully download the remote module
- The runtime calling process can be extended through the module-runtime plug-in mechanism

## API

```javascript
// Can load modules using only the runtime SDK without relying on build plugins
// When not using build plugins, shared dependencies cannot be automatically reused
import { init, loadRemote } from '@module-federation/runtime';

init({
    name: '@demo/app-main',
    remotes: [
        {
            name: "@demo/app2",
            entry: "http://localhost:3006/remoteEntry.js",
            alias: "app2"
        },
    ],
});

// Load by alias
loadRemote<{add: (...args: Array<number>)=> number }>("app2/util").then((md)=>{
    md.add(1,2,3);
});
```

### init

- Type: `init(options: InitOptions): void`
- Create runtime instance , it can dynamically register remotes by re-call , but only one instance will exist.
- InitOptions:

```ts
type InitOptions {
    //The name of the current host
    name: string;
    // The version of the current host will use the host version of the corresponding version online.
    // remoteInfo in remotes will use the online version
    version?: string;
    // In the area where the module is deployed, the consumer will transparently transmit this data to the producer
    //After setting, when the producer data fails to be obtained normally, the backup data will be automatically obtained according to this configuration.
    region?: `EnhancedRegion`;
    // List of dependent remote modules
    // tip: The remotes configured at runtime are not completely consistent with the types and data passed in the build plugin, and the passed in * ^ ~ version rules are not supported at runtime.
    remotes: Array<RemoteInfo>;
    // List of dependencies that need to be shared by the current host
    // When using the build plugin, users can configure the dependencies that need to be shared in the build plugin, and the build plugin will inject the dependencies that need to be shared into the runtime shared configuration.
    // Shared must be manually passed in the version instance reference when it is passed in at runtime, because it cannot be directly passed in at runtime.
    shared?: ShareInfos;
};

type RemoteInfo = (RemotesWithEntry | RemotesWithVersion) & {
   alias?: string;
};

interface RemotesWithVersion {
   name: string;
   version: string;
}

interface RemotesWithEntry {
   name: string;
   entry: string;
}

type ShareInfos = {
   // Dependent package name, dependent basic information, and sharing strategy
   [pkgName: string]: Share;
};

type Share = {
   // Versions of shared dependencies
   version: string;
   //Which modules consume the current shared dependencies?
   useIn?: Array<string>;
   //Which module does the shared dependency come from?
   from?: string;
   // Get the factory function of the shared dependency instance. When the cached shared instance cannot be loaded, its own shared dependency will be loaded.
   lib: () => Module;
   // Sharing strategy, what strategy will be used to determine the reuse of shared dependencies
   shareConfig?: SharedConfig;
   // Dependencies between shares
   deps?: Array<string>;
   // Under what scope the current shared dependencies are placed, the default is default
   scope?: string | Array<string>;
};
```

### loadRemote

- Type: `loadRemote(id: string)`
- Used to load initialized remote modules, when used with build plugins, it can be loaded directly through native `import("remoteName/expose")` syntax, and the build plugin will automatically convert it into `loadRemote` usage.

- Example

```javascript
import { init, loadRemote } from '@module-federation/runtime';

init({
  name: '@demo/main-app',
  remotes: [
    {
      name: '@demo/app2',
      alias: 'app2',
      entry: 'http://localhost:3006/remoteEntry.js',
    },
  ],
});

// remoteName + expose
loadRemote('@demo/app2/util').then((m) => m.add(1, 2, 3));

// alias + expose
loadRemote('app2/util').then((m) => m.add(1, 2, 3));
```

### loadShare

- Type: `loadShare(pkgName: string)`
- Gets the `share` dependency. When there are `share` dependencies that match the current `host` in the global environment, the existing and satisfying `share` dependencies will be reused first. Otherwise, load its own dependencies and store them in the global cache.
- This `API` is generally not called directly by users, but is used by build plugins to convert their own dependencies.

- Example

```js
import { init, loadRemote, loadShare } from '@module-federation/runtime';
import React from 'react';
import ReactDOM from 'react-dom';

init({
  name: '@demo/main-app',
  remotes: [],
  shared: {
    react: {
      version: '17.0.0',
      scope: 'default',
      lib: () => React,
      shareConfig: {
        singleton: true,
        requiredVersion: '^17.0.0',
      },
    },
    'react-dom': {
      version: '17.0.0',
      scope: 'default',
      lib: () => ReactDOM,
      shareConfig: {
        singleton: true,
        requiredVersion: '^17.0.0',
      },
    },
  },
});

loadShare('react').then((reactFactory) => {
  console.log(reactFactory());
});
```

### preloadRemote

- Type: `preloadRemote(preloadOptions: Array<PreloadRemoteArgs>)`
- Used to preload remote assets like remoteEntry.js .

- Type

```typescript
async function preloadRemote(preloadOptions: Array<PreloadRemoteArgs>) {}

type depsPreloadArg = Omit<PreloadRemoteArgs, 'depsRemote'>;
type PreloadRemoteArgs = {
  // Preload the name and alias of the remote
  nameOrAlias: string;
  // Expose to be preloaded
  // Default to preload all exposes
  // Only the required expose will be loaded when an expose is provided
  exposes?: Array<string>; // Default request
  // Default is sync, only load synchronous code referenced in the expose
  // Set to all to load synchronous and asynchronous references
  resourceCategory?: 'all' | 'sync';
  // Load all dependencies when no value is configured
  // Only the resources needed will be loaded after configuring the dependency
  depsRemote?: boolean | Array<depsPreloadArg>;
  // No filtering of resources when not configured
  // Will filter out unwanted resources after configuring
  filter?: (assetUrl: string) => boolean;
};
```

- Details

**Info**: Only if the entry is manifest can more resources be loaded. The manifest plugin will be supported in 2024.Q1

Through `preloadRemote`, module resources can be preloaded at an earlier stage to avoid waterfall requests. `preloadRemote` can preload the following content:

- The `remoteEntry` of `remote`
- `expose` assets of `remote`
- Synchronous resources or asynchronous resources of `remote`
- `remote` resources that `remote` depends on

* Example

```ts
import { init, preloadRemote } from '@module-federation/runtime';

init({
  name: '@demo/preload-remote',
  remotes: [
    {
      name: '@demo/sub1',
      entry: 'http://localhost:2001/vmok-manifest.json',
    },
    {
      name: '@demo/sub2',
      entry: 'http://localhost:2001/vmok-manifest.json',
    },
    {
      name: '@demo/sub3',
      entry: 'http://localhost:2001/vmok-manifest.json',
    },
  ],
});

// Preload @demo/sub1 module
// Filter resource information that contains ignore in the resource name
// Only preload sub-dependent @demo/sub1-button modules
preloadRemote([
  {
    nameOrAlias: '@demo/sub1',
    filter(assetUrl) {
      return assetUrl.indexOf('ignore') === -1;
    },
    depsRemote: [{ nameOrAlias: '@demo/sub1-button' }],
  },
]);

// Preload @demo/sub2 module
// Preload all exposes under @demo/sub2
// Preload the synchronous resources and asynchronous resources of @demo/sub2
preloadRemote([
  {
    nameOrAlias: '@demo/sub2',
    resourceCategory: 'all',
  },
]);

// Preload expose of @demo/sub3 module
preloadRemote([
  {
    nameOrAlias: '@demo/sub3',
    resourceCategory: 'all',
    exposes: ['add'],
  },
]);
```

## hooks

Lifecycle hooks for FederationHost interaction.

- example

```ts
import { init } from '@module-federation/runtime';
import type { FederationRuntimePlugin } from '@module-federation/runtime';

const runtimePlugin: () => FederationRuntimePlugin = function () {
  return {
    name: 'my-runtime-plugin',
    beforeInit(args) {
      console.log('beforeInit: ', args);
      return args;
    },
    beforeRequest(args) {
      console.log('beforeRequest: ', args);
      return args;
    },
    afterResolve(args) {
      console.log('afterResolve', args);
      return args;
    },
    onLoad(args) {
      console.log('onLoad: ', args);
      return args;
    },
    async loadShare(args) {
      console.log('loadShare:', args);
    },
    async beforeLoadShare(args) {
      console.log('beforeloadShare:', args);
      return args;
    },
  };
};

init({
  name: '@demo/app-main',
  remotes: [
    {
      name: '@demo/app2',
      entry: 'http://localhost:3006/remoteEntry.js',
      alias: 'app2',
    },
  ],
  plugins: [runtimePlugin()],
});
```

### beforeInit

`SyncWaterfallHook`

Updates Federation Host configurations before the initialization process of remote containers.

- type

```ts
function beforeInit(args: BeforeInitOptions): BeforeInitOptions;

type BeforeInitOptions = {
  userOptions: UserOptions;
  options: FederationRuntimeOptions;
  origin: FederationHost;
  shareInfo: ShareInfos;
};

interface FederationRuntimeOptions {
  id?: string;
  name: string;
  version?: string;
  remotes: Array<Remote>;
  shared: ShareInfos;
  plugins: Array<FederationRuntimePlugin>;
  inBrowser: boolean;
}
```

### init

`SyncHook`

Called during the initialization of remote containers.

- type

```ts
function init(args: InitOptions): void;

type InitOptions = {
  options: FederationRuntimeOptions;
  origin: FederationHost;
};
```

### beforeRequest

`AsyncWaterfallHook`

Invoked before resolving a remote container, useful for injecting the container or updating something ahead of the lookup.

- type

```ts
async function beforeRequest(args: BeforeRequestOptions): Promise<BeforeRequestOptions>;

type BeforeRequestOptions = {
  id: string;
  options: FederationRuntimeOptions;
  origin: FederationHost;
};
```

### afterResolve

`AsyncWaterfallHook`

Called after resolving a container, allowing redirection or modification of resolved information.

- type

```ts
async function afterResolve(args: AfterResolveOptions): Promise<AfterResolveOptions>;

type AfterResolveOptions = {
  id: string;
  pkgNameOrAlias: string;
  expose: string;
  remote: Remote;
  options: FederationRuntimeOptions;
  origin: FederationHost;
  remoteInfo: RemoteInfo;
  remoteSnapshot?: ModuleInfo;
};
```

### onLoad

`AsyncHook`

Triggered once a federated module is loaded, allowing access and modification to the exports of the loaded file.

- type

```ts
async function onLoad(args: OnLoadOptions): Promise<void>;

type OnLoadOptions = {
  id: string;
  expose: string;
  pkgNameOrAlias: string;
  remote: Remote;
  options: ModuleOptions;
  origin: FederationHost;
  exposeModule: any;
  exposeModuleFactory: any;
  moduleInstance: Module;
};

type ModuleOptions = {
  remoteInfo: RemoteInfo;
  host: FederationHost;
};

interface RemoteInfo {
  name: string;
  version?: string;
  buildVersion?: string;
  entry: string;
  type: RemoteEntryType;
  entryGlobalName: string;
  shareScope: string;
}
```

### handlePreloadModule

`SyncHook`

Handles preloading logic for federated modules.

- type

```ts
function handlePreloadModule(args: HandlePreloadModuleOptions): void;

type HandlePreloadModuleOptions = {
  id: string;
  name: string;
  remoteSnapshot: ModuleInfo;
  preloadConfig: PreloadRemoteArgs;
};
```

### errorLoadRemote

`AsyncHook`

Invoked if loading a federated module fails, enabling custom error handling.

- type

```ts
async function errorLoadRemote(args: ErrorLoadRemoteOptions): Promise<void | unknown>;

type ErrorLoadRemoteOptions = {
  id: string;
  error: unknown;
  from: 'build' | 'runtime';
  origin: FederationHost;
};
```

- example

```ts
import { init, loadRemote } from '@module-federation/runtime';

import type { FederationRuntimePlugin } from '@module-federation/runtime';

const fallbackPlugin: () => FederationRuntimePlugin = function () {
  return {
    name: 'fallback-plugin',
    errorLoadRemote(args) {
      const fallback = 'fallback';
      return fallback;
    },
  };
};

init({
  name: '@demo/app-main',
  remotes: [
    {
      name: '@demo/app2',
      entry: 'http://localhost:3006/remoteEntry.js',
      alias: 'app2',
    },
  ],
  plugins: [fallbackPlugin()],
});

loadRemote('app2/un-existed-module').then((mod) => {
  expect(mod).toEqual('fallback');
});
```

### beforeLoadShare

`AsyncWaterfallHook`

Called before attempting to load or negotiate shared modules between federated apps.

- type

```ts
async function beforeLoadShare(args: BeforeLoadShareOptions): Promise<BeforeLoadShareOptions>;

type BeforeLoadShareOptions = {
  pkgName: string;
  shareInfo?: Shared;
  shared: Options['shared'];
  origin: FederationHost;
};
```

### resolveShare

`SyncWaterfallHook`

Allows manual resolution of shared module requests.

- type

```ts
function resolveShare(args: ResolveShareOptions): ResolveShareOptions;

type ResolveShareOptions = {
  shareScopeMap: ShareScopeMap;
  scope: string;
  pkgName: string;
  version: string;
  GlobalFederation: Federation;
  resolver: () => Shared | undefined;
};
```

- example

```ts
import { init, loadRemote } from '@module-federation/runtime';

import type { FederationRuntimePlugin } from '@module-federation/runtime';

const customSharedPlugin: () => FederationRuntimePlugin = function () {
  return {
    name: 'custom-shared-plugin',
    resolveShare(args) {
      const { shareScopeMap, scope, pkgName, version, GlobalFederation } = args;

      if (pkgName !== 'react') {
        return args;
      }

      args.resolver = function () {
        shareScopeMap[scope][pkgName][version] = window.React; // replace local share scope manually with desired module
        return shareScopeMap[scope][pkgName][version];
      };
      return args;
    },
  };
};

init({
  name: '@demo/app-main',
  shared: {
    react: {
      version: '17.0.0',
      scope: 'default',
      lib: () => React,
      shareConfig: {
        singleton: true,
        requiredVersion: '^17.0.0',
      },
    },
  },
  plugins: [customSharedPlugin()],
});

window.React = () => 'Desired Shared';

loadShare('react').then((reactFactory) => {
  expect(reactFactory()).toEqual(window.React());
});
```

### beforePreloadRemote

`AsyncHook`

Invoked before any preload logic is executed by the preload handler.

- type

```ts
async function beforePreloadRemote(args: BeforePreloadRemoteOptions): BeforePreloadRemoteOptions;

type BeforePreloadRemoteOptions = {
  preloadOps: Array<PreloadRemoteArgs>;
  options: Options;
  origin: FederationHost;
};
```

### generatePreloadAssets

`AsyncHook`

Called for generating preload assets based on configurations.

- type

```ts
async function generatePreloadAssets(args: GeneratePreloadAssetsOptions): Promise<PreloadAssets>;

type GeneratePreloadAssetsOptions = {
  origin: FederationHost;
  preloadOptions: PreloadOptions[number];
  remote: Remote;
  remoteInfo: RemoteInfo;
  remoteSnapshot: ModuleInfo;
  globalSnapshot: GlobalModuleInfo;
};

interface PreloadAssets {
  cssAssets: Array<string>;
  jsAssetsWithoutEntry: Array<string>;
  entryAssets: Array<EntryAssets>;
}
```

## loaderHook

Plugin system for module loading operations.

### createScript

`SyncHook`

- type

```ts
function createScript(args: CreateScriptOptions): HTMLScriptElement | void;

type CreateScriptOptions = {
  url: string;
};
```

- example

```ts
import { init } from '@module-federation/runtime';
import type { FederationRuntimePlugin } from '@module-federation/runtime';

const changeScriptAttributePlugin: () => FederationRuntimePlugin = function () {
  return {
    name: 'change-script-attribute',
    createScript({ url }) {
      if (url === testRemoteEntry) {
        let script = document.createElement('script');
        script.src = testRemoteEntry;
        script.setAttribute('loader-hooks', 'isTrue');
        script.setAttribute('crossorigin', 'anonymous');
        return script;
      }
    },
  };
};
```
