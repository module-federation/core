# `@module-federation/sdk`

`@module-federation/sdk` 提供了 Module Federation 运行时、清单与调试能力所需的基础工具。除了原有的工具函数外，现在还内置了一套**无 Chrome 插件依赖的代理调试 SDK**，方便 AI 或业务方脚本手动接入远程模块代理能力。

## 这次新增了什么

新的代理调试 SDK 拆成两层：

1. **代理数据层**：负责读写代理快照、remote overrides 与运行时标记，兼容当前 Chrome Devtools 使用的 localStorage 结构。
2. **运行时注入层**：负责把 override / snapshot 两个 runtime plugin 注入到 `window.__FEDERATION__.__GLOBAL_PLUGIN__`，从而在运行时修改 remotes 与完整 `moduleInfo`。

这意味着现在有两种接入方式：继续使用 Chrome 插件，或者在页面里直接手动调用 SDK。

## 核心导出

### 代理数据层

```ts
import { FederationProxyDataManager, FEDERATION_PROXY_STORAGE_KEY, FEDERATION_PROXY_MODULE_INFO_KEY } from '@module-federation/sdk';
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
import { bootstrapFederationProxy, registerFederationProxyRuntimePlugins, createFederationProxyOverridePlugin, createFederationProxySnapshotPlugin } from '@module-federation/sdk';
```

- `createFederationProxyOverridePlugin()`：在 `beforeRegisterRemote` 阶段重写 remote 的 `entry` 或 `version`
- `createFederationProxySnapshotPlugin()`：在 `beforeLoadRemoteSnapshot` 阶段把代理快照合并进全局 `moduleInfo`
- `registerFederationProxyRuntimePlugins()`：只注入 runtime plugin，不改数据
- `bootstrapFederationProxy()`：同时写入数据并注入 runtime plugin，适合 AI/脚本一次性接入

## 手动接入示例

### 方案一：AI / 脚本一步接入

```ts
import { bootstrapFederationProxy } from '@module-federation/sdk';

bootstrapFederationProxy({
  data: {
    overrides: {
      provider: 'http://127.0.0.1:3009/mf-manifest.json',
    },
    moduleInfo: {
      provider: {
        version: '1.0.0',
        remoteEntry: 'http://127.0.0.1:3009/mf-manifest.json',
      },
    },
    browserEnv: true,
  },
});
```

这段代码会做三件事：写入代理数据、初始化 `__FEDERATION__ / __VMOK__`、注册两个调试 runtime plugin。

### 方案二：数据与注入分开控制

```ts
import { FederationProxyDataManager, registerFederationProxyRuntimePlugins } from '@module-federation/sdk';

const proxyManager = new FederationProxyDataManager();

proxyManager.applyState({
  overrides: {
    provider: 'http://127.0.0.1:3009/mf-manifest.json',
  },
  moduleInfo: {
    provider: {
      version: '1.0.0',
      remoteEntry: 'http://127.0.0.1:3009/mf-manifest.json',
    },
  },
  browserEnv: true,
});

registerFederationProxyRuntimePlugins();
```

这个模式更适合：先由 AI 生成代理数据，再由业务方控制何时启用插件。

## 和 Chrome Devtools 的关系

Chrome Devtools 现在直接复用这套 SDK：

- 存储结构仍兼容 `__MF_DEVTOOLS__` 与 `__MF_DEVTOOLS_MODULE_INFO__`
- override / snapshot 插件改为由 SDK 统一实现
- 历史的 top-level override 结构仍可读取，新的写入会统一归一化到 `overrides` 字段

## 兼容性说明

- 仍兼容 `window.__FEDERATION__` 与 `window.__VMOK__`
- 仍兼容 Chrome Devtools 旧版写入的 top-level override 结构
- 插件注册会按 `name` 去重，避免重复注入

## Testing

SDK 使用 Jest 做单测。与代理调试能力直接相关的测试位于：

- `packages/sdk/__tests__/proxy-storage.spec.ts`
- `packages/sdk/__tests__/proxy-runtime.spec.ts`
