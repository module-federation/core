# `@module-federation/runtime`

- Can be combined with the build plug-in to share basic dependencies according to policies to reduce the number of module downloads and improve the loading speed of modules.
- Only consume part of the export of the remote module and will not fully download the remote module
- The runtime calling process can be extended through the module-runtime plug-in mechanism

## Usage

```javascript
// Can load modules using only the runtime SDK without relying on build plugins
// When not using build plugins, shared dependencies cannot be automatically reused
import { init, loadRemote } from '@module-federation/runtime';

init({
    name: '@demo/app-main',
    remotes: [
        {
            name: "@demo/app2",
            entry: "http://localhost:3006/remoteEntry.js"
        },
        {
            name: "@demo/app3",
            alias: "app3",
            entry: "http://localhost:2001/module-federation-manifest.json"
        },
    ],
});

// Load by alias
loadRemote<{add: (...args: Array<number>)=> number }>("app3/util").then((md)=>{
    md.add(1,2,3);
});
```

### init

- Type: `init(options: InitOptions): void`
- It is used to dynamically register the module at runtime
- InitOptions:

```ts
type InitOptions {
    name: string;
    version?: string;
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
  // Package name and dependency basic information and sharing strategy
  [pkgName: string]: Share;
};

type Share = {
  // Versions of shared dependencies
  version: string;
  // Which modules consume the current shared dependencies?
  useIn?: Array<string>;
  // Which module does the shared dependency come from?
  from?: string;
  // Get the factory function of the shared dependency instance. When the cached shared instance cannot be loaded, its own shared dependency will be loaded.
  lib: () => Module;
  // Sharing strategy, what strategy will be used to determine the reuse of shared dependencies
  shareConfig?: SharedConfig;
  // Dependencies between shares
  deps?: Array<string>;
  // The scope under which the current shared dependencies are placed, the default is default
  scope?: string | Array<string>;
};
```

- Example

```js
import { init, loadRemote } from '@module-federation/runtime';

init({
  name: '@demo/main-app',
  remotes: [
    {
      name: '@demo/app2',
      entry: 'http://localhost:3006/remoteEntry.js',
    },
    {
      name: '@demo/app3',
      alias: 'app3',
      entry: 'http://localhost:2001/module-federation-manifest.json',
    },
  ],
});
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
      name: '@demo/app3',
      alias: 'app3',
      entry: 'http://localhost:2001/module-federation-manifest.json',
    },
  ],
});

// remoteName + expose
loadRemote('@demo/app3/util').then((m) => m.add(1, 2, 3));

// alias + expose
loadRemote('app3/util').then((m) => m.add(1, 2, 3));
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

### usePlugin

Used to extend the internal loading process of `ModuleFederation`, affecting the entire loading process through hook triggers and return values.

- Example

```ts
import { init } from '@module-federation/runtime';

// mock get remote data remotes config
function getDataConfig() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        remotes: [
          {
            name: '@demo/sub',
            alias: 'sub',
            entry: 'http://localhost:2001/module-federation-manifest.json',
          },
        ],
      });
    }, 2000);
  });
}

function RemotesDataPlugin() {
  return {
    name: 'data-config',
    async beforeRequest(args) {
      const remotes = await getDataConfig();
      origin.initOptions({
        remotes,
      });
      return args;
    },
  };
}

init({
  name: '@demo/micro-app',
  remotes: [],
  pluigns: [RemotesDataPlugin()],
});

loadRemote('sub/utils').then((m) => {
  m.add(1, 2, 3, 4);
});
```

- Type

```typescript
type Plugin = {
  name: string;
  core: {
    beforeRequest: AsyncWaterfallHook<{
      id: string;
      options: Options;
      origin: VmokHost;
    }>;
  };
  snapshot: {};
};
type usePlugin = (plugin: Plugin) => void;
```

### preloadRemote

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

Through `preloadRemote`, module resources can be preloaded at an earlier stage to avoid waterfall requests. `preloadRemote` can preload the following content:

- The `remoteEntry` of `remote`
- `expose` of `remote`
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
```
