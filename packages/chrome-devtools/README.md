# Module Federation Chrome Devtools

## 背景

Chrome Devtools 主要用于把线上 Module Federation remote 代理到本地调试环境。原有实现依赖插件侧把数据写进 `localStorage`，再往页面里注入 override / snapshot 两个 runtime plugin。

## 当前实现

现在这套能力已经下沉为共享 SDK，Chrome Devtools 只负责：

- 采集用户选择的代理模块与目标地址
- 计算代理所需的 snapshot / overrides 数据
- 调用 `@module-federation/sdk` 提供的共享存储与 runtime plugin 注入能力

## SDK 入口

如果不想安装 Chrome 插件，也可以直接手动接入：

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

## Ability

- Proxy online Module Federation remote module to local
- Let proxied remote module get hmr
- Reuse the shared proxy SDK for AI / manual integration

https://module-federation.io/
