# `@module-federation/sdk`

`@module-federation/sdk` 提供了 Module Federation 运行时、清单与调试能力所需的基础工具。除了原有的工具函数外，现在还内置了一套**无 Chrome 插件依赖的代理调试 SDK**，方便 AI 或业务方脚本手动接入远程模块代理能力。

## 这次新增了什么

新的代理调试 SDK 拆成两层：

1. **代理数据层**：负责读写代理快照、remote overrides 与运行时标记，兼容当前 Chrome Devtools 使用的 localStorage 结构。
2. **运行时注入层**：负责把 override / snapshot 两个 runtime plugin 注入到 `window.__FEDERATION__.__GLOBAL_PLUGIN__`，从而在运行时修改 remotes 与完整 `moduleInfo`。

这意味着现在有三种接入方式：继续使用 Chrome 插件、在业务代码里显式调用 SDK，或者在应用主逻辑执行前先通过 IIFE 文件做前置注入。

## 核心导出

### 代理数据层

```ts
import { FederationProxyDataManager, FEDERATION_PROXY_MODULE_INFO_KEY, FEDERATION_PROXY_STORAGE_KEY } from '@module-federation/sdk/proxy';
```

`FederationProxyDataManager` 负责管理这三类信息：

- `overrides`：remote 名称到本地 entry/version 的映射
- `moduleInfo`：完整的远程模块快照
- `browserEnv`：页面进入代理调试模式的标记

常用方法包括：

- `getOverrides()` / `setOverrides()` / `mergeOverrides()` / `clearOverrides()`
- `getModuleInfo()` / `setModuleInfo()` / `clearModuleInfo()`
- `setBrowserEnv()` / `getBrowserEnv()`
- `applyState()` / `getState()` / `reset()`

### 运行时注入层

```ts
import { bootstrapFederationProxy, createFederationProxyOverridePlugin, createFederationProxySnapshotPlugin, registerFederationProxyRuntimePlugins } from '@module-federation/sdk/proxy';
```

- `createFederationProxyOverridePlugin()`：在 `beforeRegisterRemote` 阶段重写 remote 的 `entry` 或 `version`
- `createFederationProxySnapshotPlugin()`：在 `beforeLoadRemoteSnapshot` 阶段把代理快照合并进全局 `moduleInfo`
- `registerFederationProxyRuntimePlugins()`：只注入 runtime plugin，不改数据
- `bootstrapFederationProxy()`：同时写入数据并注入 runtime plugin，适合 AI/脚本一次性接入

## 手动接入示例

### 方案一：通过 IIFE 在应用主逻辑前前置注入

```html
<script src="https://unpkg.com/@module-federation/sdk@latest/dist/index.iife.js"></script>
<script>
  window.FederationSdk.bootstrapFederationProxy({
    data: {
      overrides: {
        provider: 'http://127.0.0.1:3009/mf-manifest.json',
      },
      browserEnv: true,
    },
  });
</script>
<script type="module" src="/src/main.ts"></script>
```

这个 IIFE 产物会把 `bootstrapFederationProxy`、`registerFederationProxyRuntimePlugins`、`FederationProxyDataManager` 等 API 暴露到全局变量 `window.FederationSdk`。推荐把它放在业务主逻辑之前执行，这样可以在应用真正开始注册 remotes 之前就把 runtime plugins 注入进去，解决**页面刷新后内存里的 plugin 丢失**、以及**代理配置在首次加载阶段不生效**的问题。

### 方案二：AI / 脚本一步接入（默认推荐）

```ts
import { bootstrapFederationProxy } from '@module-federation/sdk/proxy';

bootstrapFederationProxy({
  data: {
    overrides: {
      provider: 'http://127.0.0.1:3009/mf-manifest.json',
    },
    browserEnv: true,
  },
});
```

这段代码会做三件事：写入代理数据、初始化 `__FEDERATION__ / __VMOK__`、注册两个调试 runtime plugin。对于大多数外部接入场景，只传 `override` 就够了，不需要额外传 `moduleInfo`。

### 方案三：数据与注入分开控制

```ts
import { FederationProxyDataManager, registerFederationProxyRuntimePlugins } from '@module-federation/sdk/proxy';

const proxyManager = new FederationProxyDataManager();

proxyManager.applyState({
  overrides: {
    provider: 'http://127.0.0.1:3009/mf-manifest.json',
  },
  browserEnv: true,
});

registerFederationProxyRuntimePlugins();
```

这个模式更适合：先由 AI 生成代理数据，再由业务方控制何时启用插件。

## `moduleInfo` 的内部实现说明

`moduleInfo` 不是默认接入路径，主要用于**内部场景**：当你已经提前拿到了 Vmok / Garfish 侧解析完成的 remote 快照时，可以把这份快照直接写入代理 SDK，让运行时在真正发起远程模块请求前就拥有完整的模块信息。

在 `pgcfe/garfish` 仓库里，`packages/module-devtools/src/App.jsx` 会把 `handleSnapshot={(rules) => getModuleInfo(rules)}` 传给 DevTools 组件；而 `packages/module-devtools/src/utils/data/index.js` 里的 `getModuleInfo` 最终返回的是：

```ts
{
  status: 'success' | 'error';
  reason: unknown;
  moduleInfo: GlobalModuleInfo;
  overrides: Record<string, string>;
}
```

其中 `moduleInfo` 本身就是一份可直接注入的 Vmok snapshot。它的顶层除了模块 key 之外，通常还会带上 `extendInfos`，内部链路里有时还会保留 `res` 这样的附加字段。因此当前 SDK 的 TypeScript 声明已经兼容这类结构，便于直接透传内部解析结果。

下面是一个精简后的 `moduleInfo` 示例参数，结构可对照 Garfish 中 `App.jsx` / `utils/data/index.js` 的传参方式理解：

```ts
import { bootstrapFederationProxy } from '@module-federation/sdk/proxy';

bootstrapFederationProxy({
  data: {
    browserEnv: true,
    overrides: {
      provider: 'deploy_channel#12345',
    },
    moduleInfo: {
      extendInfos: {
        region: 'cn',
        overrides: {
          provider: 'deploy_channel#12345',
        },
        dynamicModulesInfo: {
          provider: {
            version: '1.0.0',
            alias: 'provider',
            consumeMode: 'version',
          },
        },
      },
      '@demo/host': {
        version: '1.0.0',
        buildVersion: '1.0.0.1517',
        globalName: '__FEDERATION_@demo/host:1.0.0.1517__',
        remoteEntry: 'https://cdn.example.com/host/federation-remote-entry.js',
        remoteEntryType: 'global',
        remoteTypes: 'index.d.ts',
        remoteTypesZip: '@mf-types.zip',
        remotesInfo: {
          provider: {
            matchedVersion: '1.0.0',
          },
        },
        shared: [],
        modules: [
          {
            moduleName: '.',
            modulePath: '.',
            assets: {
              js: { sync: ['main.js'], async: [] },
              css: { sync: ['main.css'], async: [] },
            },
          },
        ],
        publicPath: 'https://cdn.example.com/host/',
      },
      'provider:1.0.0': {
        version: '1.0.0',
        buildVersion: '1.0.0.1517',
        globalName: '__FEDERATION_provider:1.0.0.1517__',
        remoteEntry: 'https://cdn.example.com/provider/federation-remote-entry.js',
        remoteEntryType: 'global',
        remoteTypes: 'index.d.ts',
        remoteTypesZip: '@mf-types.zip',
        remotesInfo: {},
        shared: [],
        modules: [
          {
            moduleName: './Widget',
            modulePath: './Widget',
            assets: {
              js: { sync: ['widget.js'], async: [] },
              css: { sync: [], async: [] },
            },
          },
        ],
        publicPath: 'https://cdn.example.com/provider/',
      },
    },
  },
});
```

如果你只是想把某个 remote 临时切到本地地址或指定版本，请继续优先使用 `override`；只有在你已经有一份服务端返回的完整 snapshot、并且希望直接注入运行时时，才需要显式传 `moduleInfo`。

## 兼容性说明

- 当前代理 SDK 依赖 `beforeRegisterRemote` hook 来在 remote 注册前改写 `entry` / `version`
- 因此要求 Module Federation Runtime / Enhanced **至少为 2.0.0**；这个 hook 的底层能力最早出现在 `runtime-core@0.6.14`，更早的版本无法保证首次加载阶段的代理生效
- 仍兼容 `window.__FEDERATION__` 与 `window.__VMOK__`
- 仍兼容 Chrome Devtools 旧版写入的 top-level override 结构
- 插件注册会按 `name` 去重，避免重复注入

## 和 Chrome Devtools 的关系

Chrome Devtools 现在直接复用这套 SDK：

- 存储结构仍兼容 `__MF_DEVTOOLS__` 与 `__MF_DEVTOOLS_MODULE_INFO__`
- override / snapshot 插件改为由 SDK 统一实现
- 历史的 top-level override 结构仍可读取，新的写入会统一归一化到 `overrides` 字段

## Testing

SDK 使用 Jest 做单测。与代理调试能力直接相关的测试位于：

- `packages/sdk/__tests__/proxy-storage.spec.ts`
- `packages/sdk/__tests__/proxy-runtime.spec.ts`
