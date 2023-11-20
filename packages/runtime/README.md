# `@vmok/runtime-open-source`

* Can be combined with the build plug-in to share basic dependencies according to policies to reduce the number of module downloads and improve the loading speed of modules.
* Only consume part of the export of the remote module and will not fully download the remote module
* The runtime calling process can be extended through the module-runtime plug-in mechanism

## Usage

```javascript
// Can load modules using only the runtime SDK without relying on build plugins
// When not using build plugins, shared dependencies cannot be automatically reused
import { init, loadRemote } from '@vmok/kit/runtime';

init({
    name: '@demo/app-main',
    remotes: [
        {
            name: "@demo/app3",
            alias: "app3",
            entry: "http://localhost:2001/vmok-manifest.json"
        },
        // Runtime consumption version support requires @vmok/kit 1.6.0 and above
        {
            name: "@demo/app2",
            // If the version number is specified, the specific version number data will be obtained
            // If the version interval or * is set, then the latest released producer data will be obtained
            version: "1.0.0"
        },
    ],
    // If you want to fill in version at runtime, you must fill in this field
    // This field means: @demo/app2 version 1.0.0 released under Extranet-CN will be obtained automatically
    region: NetTypeRegionMap.EXTRANET_CN,
});

// Load the util exposed by app2
// loadRemote<{add: (...args: Array<number>)=> number }>("@demo/app2/util").then((md)=>{
//     md.add(1,2);
// });

// Load by alias
loadRemote<{add: (...args: Array<number>)=> number }>("app3/util").then((md)=>{
    md.add(1,2,3);
});
```

### init

- Type: `init(options: InitOptions): void`
- It is used to dynamically register the `Vmok` module at runtime, you can also use `Vmok` to build a plugin registration module, and use the build plugin registration module first
- InitOptions:

```ts
type InitOptions {
    // Current host name
    name: string;
    // Current host version. The host version corresponding to the online version will be used.
    // The remoteInfo in remotes will use the online version.
    version: string;
    // The area where the module is deployed, the consumer will transparently transmit this data to the producer
    // After setting, when the producer data fails to be obtained normally, the backup data will be obtained automatically according to this configuration
    region?: `EnhancedRegion`;
    // tip: The remotes configured at runtime are not exactly the same as the type and data passed in by the build plugin, and the runtime does not support passing in * ^ ~ version rules
    remotes: Array<RemoteInfo>;
    // List of dependencies that need to be shared by the current host
    // When using build plugins, users can configure the dependencies that need to be shared in the build plugin,
    // and the build plugin will inject the dependencies that need to be shared into the runtime shared configuration
    // When shared is passed in at runtime, the version instance reference must be manually passed in, because it cannot be directly passed in at runtime
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
import { init, loadRemote } from '@vmok/kit/runtime';

init({
    name: "@demo/main-app",
    region: "cn",
    remotes: [
        {
            name: "@demo/app3",
            // After configuring the alias, it can be loaded directly through the alias
            alias: "app3",
            // Determine the loaded module by specifying the manifest.json file address of the module
            entry: "http://localhost:2001/vmok-manifest.json"
        },
        {
             // Runtime consumption version support requires @vmok/kit 1.6.0 and above
            name: "@demo/app2",
            // If the version number is specified, the specific version number data will be obtained
            // If the version interval or * is set, then the latest released producer data will be obtained
            version: "1.0.0"
        },
    ],
    // If you want to fill in version at runtime, you must fill in this field
    // This field means: @demo/app2 version 1.0.0 released under Extranet-CN will be obtained automatically
    region: NetTypeRegionMap.EXTRANET_CN,
});
```
import CustomAddress from '@components/en/CustomAddress'

<CustomAddress />

### loadRemote

- Type: `loadRemote(id: string)`
- Used to load initialized remote modules, when used with build plugins, it can be loaded directly through native `import("remoteName/expose")` syntax, and the build plugin will automatically convert it into `loadRemote` usage.

- Example

```javascript
import { init, loadRemote } from '@vmok/kit/runtime';

init({
    name: "@demo/main-app",
    region: "cn",
    remotes: [
        // Not yet supported to consume version at runtime directly
        // {
        //     // Remote module name
        //     name: "@demo/app2",
        //     // Remote module version, can directly specify version or semver rule
        //     // https://semver.org/lang/zh-CN/
        //     version: "^1.0.0"
        // },
        {
            name: "@demo/app3",
            // After configuring the alias, it can be loaded directly through the alias
            alias: "app3",
            // Determine the loaded module by specifying the manifest.json file address of the module
            entry: "http://localhost:2001/vmok-manifest.json"
        }
    ],
});

// remoteName + expose
loadRemote("@demo/app2/util").then((m)=> m.add(1,2,3));

// alias + expose
loadRemote("app3/util").then((m)=> m.add(1,2,3));
```

::: tip
The prefix of the alias and name cannot be the same, for example:

```js
remotes: [
    {
        name: "@tiktok/button",
        version: "1.0.2"
    },
    {
        name: "@tiktok/component",
        alias: "@tiktok",
        version: "1.0.1"
    }
]
```

Because the reference supports multi-level path reference, it cannot be determined internally whether it is obtained from `"@tiktok/button"` or `"@tiktok/component"` when using `"@tiktok/button"`
:::

### loadShare

- Type: `loadShare(pkgName: string)`
- Gets the `share` dependency. When there are `share` dependencies that match the current `host` in the global environment, the existing and satisfying `share` dependencies will be reused first. Otherwise, load its own dependencies and store them in the global cache.
- This `API` is generally not called directly by users, but is used by build plugins to convert their own dependencies.

- Example

```js
import { init, loadRemote, loadShare } from '@vmok/kit/runtime';
init({
    name: "@demo/main-app",
    remotes: [],
    shared: {
        react: {
            version: "17.0.0",
            scope: "default",
            lib: ()=> import("react"),
            shareConfig: {
                singleton: true,
                requiredVersion: "^17.0.0"
            }
        },
        "react-dom": {
            version: "17.0.0",
            scope: "default",
            lib: ()=> import("react-dom"),
            shareConfig: {
                singleton: true,
                requiredVersion: "^17.0.0"
            }
        }
    }
});


loadShare("react").then((reactFactory)=>{
    console.log(reactFactory())
});
```
### usePlugin

Used to extend the internal loading process of `Vmok`, affecting the entire loading process through hook triggers and return values.

- Example

```ts
import { init } from '@vmok/kit/runtime';

// mock get remote tcc remotes config
function getTccConfig (){
    return new Promise((resolve)=>{
        setTimeout(()=>{
            resolve({
                remotes: [
                    {
                        name: "@demo/sub",
                        alias: "sub",
                        version: "1.0.2"
                    }
                ]
            })
        }, 2000);
    })
}

function TccRemotesPlugin () {
    return {
        name: "tcc-config",
        async beforeLoadRemote(args){
            const remotes = await getTccConfig();
            origin.initOptions({
                remotes
            });
            return args;
        }
    }
}


init({
    name: "@demo/micro-app",
    remotes: [],
    pluigns: [TccRemotesPlugin()]
});

loadRemote("sub/utils").then((m)=>{
    m.add(1,2,3,4);
});
```

- Type

```typescript
type Plugin = {
    name: string;
    core: {
        beforeLoadRemote: AsyncWaterfallHook<{
            id: string;
            options: Options;
            origin: VmokHost;
        }>
    },
    snapshot: {

    }
}
type usePlugin = (plugin: Plugin)=> void;
```


### preloadRemote

- Type

```typescript
async function preloadRemote(preloadOptions: Array<PreloadRemoteArgs>){}

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

* The `remoteEntry` of `remote`
* `expose` of `remote`
* Synchronous resources or asynchronous resources of `remote`
* `remote` resources that `remote` depends on

- Example

```ts
import { init, preloadRemote } from '@vmok/kit/runtime';
init({
    name: '@demo/preload-remote',
    remotes: [
        {
            name: '@demo/sub1',
            entry: "http://localhost:2001/vmok-manifest.json"
        },
        {
            name: '@demo/sub2',
            entry: "http://localhost:2001/vmok-manifest.json"
        },
        {
            name: '@demo/sub3',
            entry: "http://localhost:2001/vmok-manifest.json"
        },
    ],
});

// Preload @demo/sub1 module
// Filter out resources with the word 'ignore' in their
```

