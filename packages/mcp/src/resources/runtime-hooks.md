
## Hooks

Lifecycle hooks for FederationHost interaction.

* example

```ts
import { init } from '@vmok/runtime'
import type { FederationRuntimePlugin } from '@vmok/runtime';

const runtimePlugin: () => FederationRuntimePlugin =
  function () {
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
            name: "@demo/app2",
            entry: "http://localhost:3006/remoteEntry.js",
            alias: "app2"
        },
    ],
    plugins: [runtimePlugin()]
});
```

### beforeInit

`SyncWaterfallHook`

Updates Federation Host configurations before the initialization process of remote containers.

* type

```ts
function beforeInit(args: BeforeInitOptions): BeforeInitOptions

type BeforeInitOptions ={
    userOptions: UserOptions;
    options: FederationRuntimeOptions;
    origin: FederationHost;
    shareInfo: ShareInfos;
}

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

* type

```ts
function init(args: InitOptions): void

type InitOptions ={
  options: FederationRuntimeOptions;
  origin: FederationHost;
}
```

### beforeRequest

`AsyncWaterfallHook`

Invoked before resolving a remote container, useful for injecting the container or updating something ahead of the lookup.

* type

```ts
async function beforeRequest(args: BeforeRequestOptions): Promise<BeforeRequestOptions>

type BeforeRequestOptions ={
  id: string;
  options: FederationRuntimeOptions;
  origin: FederationHost;
}
```

### afterResolve

`AsyncWaterfallHook`

Called after resolving a container, allowing redirection or modification of resolved information.

* type

```ts
async function afterResolve(args: AfterResolveOptions): Promise<AfterResolveOptions>

type AfterResolveOptions ={
  id: string;
  pkgNameOrAlias: string;
  expose: string;
  remote: Remote;
  options: FederationRuntimeOptions;
  origin: FederationHost;
  remoteInfo: RemoteInfo;
  remoteSnapshot?: ModuleInfo;
}
```

### onLoad

`AsyncHook`

Triggered once a federated module is loaded, allowing access and modification to the exports of the loaded file.

* type

```ts
async function onLoad(args: OnLoadOptions): Promise<void>

type OnLoadOptions ={
  id: string;
  expose: string;
  pkgNameOrAlias: string;
  remote: Remote;
  options: ModuleOptions;
  origin: FederationHost;
  exposeModule: any;
  exposeModuleFactory: any;
  moduleInstance: Module;
}

type ModuleOptions = {
    remoteInfo: RemoteInfo;
    host: FederationHost;
}

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

* type

```ts
function handlePreloadModule(args: HandlePreloadModuleOptions): void

type HandlePreloadModuleOptions ={
  id: string;
  name: string;
  remoteSnapshot: ModuleInfo;
  preloadConfig: PreloadRemoteArgs;
}
```

### errorLoadRemote

`AsyncHook`

Invoked if loading a federated module fails, enabling custom error handling.

* type

```ts
async function errorLoadRemote(args: ErrorLoadRemoteOptions): Promise<void | unknown>

type ErrorLoadRemoteOptions ={
  id: string;
  error: unknown;
  from: 'build' | 'runtime';
  origin: FederationHost;
}
```
* example

```ts
import { init, loadRemote } from '@vmok/runtime'

import type { FederationRuntimePlugin } from '@vmok/runtime';

const fallbackPlugin: () => FederationRuntimePlugin =
  function () {
    return {
      name: 'fallback-plugin',
      errorLoadRemote(args) {
        const fallback = 'fallback'
        return fallback;
      },
    };
  };


init({
    name: '@demo/app-main',
    remotes: [
        {
            name: "@demo/app2",
            entry: "http://localhost:3006/remoteEntry.js",
            alias: "app2"
        },
    ],
    plugins: [fallbackPlugin()]
});

loadRemote('app2/un-existed-module').then(mod=>{
  expect(mod).toEqual('fallback');
})
```

### beforeLoadShare

`AsyncWaterfallHook`

Called before attempting to load or negotiate shared modules between federated apps.

* type

```ts
async function beforeLoadShare(args: BeforeLoadShareOptions): Promise<BeforeLoadShareOptions>

type BeforeLoadShareOptions ={
  pkgName: string;
  shareInfo?: Shared;
  shared: Options['shared'];
  origin: FederationHost;
}
```

### resolveShare

`SyncWaterfallHook`

Allows manual resolution of shared module requests.

* type

```ts
function resolveShare(args: ResolveShareOptions): ResolveShareOptions

type ResolveShareOptions ={
  shareScopeMap: ShareScopeMap;
  scope: string;
  pkgName: string;
  version: string;
  GlobalFederation: Federation;
  resolver: () => Shared | undefined;
}
```

* example

```ts
import { init, loadRemote } from '@vmok/runtime'

import type { FederationRuntimePlugin } from '@vmok/runtime';

const customSharedPlugin: () => FederationRuntimePlugin =
  function () {
    return {
      name: 'custom-shared-plugin',
      resolveShare(args) {
        const { shareScopeMap, scope, pkgName, version, GlobalFederation } = args;

        if (
          pkgName !== 'react'
        ) {
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
    plugins: [customSharedPlugin()]
});

window.React = ()=> 'Desired Shared';

loadShare("react").then((reactFactory)=>{
  expect(reactFactory()).toEqual(window.React());
});
```

### beforePreloadRemote

`AsyncHook`

Invoked before any preload logic is executed by the preload handler.

* type

```ts
async function beforePreloadRemote(args: BeforePreloadRemoteOptions): BeforePreloadRemoteOptions

type BeforePreloadRemoteOptions ={
  preloadOps: Array<PreloadRemoteArgs>;
  options: Options;
  origin: FederationHost;
}
```

### generatePreloadAssets

`AsyncHook`

Called for generating preload assets based on configurations.

* type

```ts
async function generatePreloadAssets(args: GeneratePreloadAssetsOptions): Promise<PreloadAssets>

type GeneratePreloadAssetsOptions ={
  origin: FederationHost;
  preloadOptions: PreloadOptions[number];
  remote: Remote;
  remoteInfo: RemoteInfo;
  remoteSnapshot: ModuleInfo;
  globalSnapshot: GlobalModuleInfo;
}

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

* type

```ts
function createScript(args: CreateScriptOptions): HTMLScriptElement | void

type CreateScriptOptions ={
  url: string;
}
```

* example

```ts
import { init } from '@vmok/runtime'
import type { FederationRuntimePlugin } from '@vmok/runtime';

const changeScriptAttributePlugin: () => FederationRuntimePlugin =
  function () {
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
      }
    };
  };
```
