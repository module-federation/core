# Bridge 渲染回调：实现与验收

回调与 Service 缓存的整合结果见 [联合验证记录](CACHE-CALLBACKS-VERIFICATION.md)。[缓存 PR #5201](https://github.com/module-federation/core/pull/5201) 已包含本分支的回调实现，配套使用 [Modern #9002](https://github.com/web-infra-dev/modern.js/pull/9002)。下文保留回调接入及其原有验收范围。

分支：`feat/bridge-renderer-callbacks`。本轮在已有 Bridge SSR / Service App Demo 上验证完整根应用，不包含指定路由导出。生产者直接导出自己的 provider，构建器保留该入口并选择对应环境的实现。

## 生产者怎么写

```tsx
import '@modern-js/runtime/registry/index';
import { createRoot } from '@modern-js/runtime/react';
import { render, hydrate, renderStream } from '@modern-js/runtime/mf';
import { createBridgeComponent } from '@module-federation/modern-js-v3/react-v19';

const ModernRoot = createRoot();

export const provider = createBridgeComponent({
  rootComponent: ModernRoot,
  render,
  hydrate,
  renderStream,
});

export default provider;
```

React 18 使用 `react-v18`。普通 `module-federation.config.ts` 指向这个文件：

```ts
export default {
  name: 'inventory',
  exposes: { './App': './src/bridge.tsx' },
};
```

当前插件版在 `modern.config.ts` 使用 `moduleFederationPlugin({ bridge: true })` 接入。

`bridge: true` 是当前插件版的集成开关；本轮没有实现后续 Modern 内置配置，也没有新增自动扫描。不要添加 `bridge.exposes`：那是旧方案生成 provider 的入口，本轮 Demo 不使用它。Service App 使用同样的生产者导出，由服务端 middleware 调用这个 provider 的 `renderStream`。

## 分工与执行顺序

| 层 | 本轮职责 | Review 入口 |
| --- | --- | --- |
| 通用 Bridge React | 在生产者内部构造同一棵树，调用注入的回调，保存挂载句柄，处理更新和销毁 | [bridge-base.tsx](../bridge/bridge-react/src/provider/versions/bridge-base.tsx)、[types.ts](../bridge/bridge-react/src/types.ts) |
| Modern Node 回调 | 将传入的根树交给 `renderApplication`；运行请求 hooks、Router 与 loader；生成 HTML 流和水合数据 | 本地 Modern `packages/runtime/plugin-runtime/src/mf/server.tsx` |
| Modern Browser 回调 | 通过 `createApplication(element)` 恢复路由和数据；每个容器持有独立实例，复用同一 root 更新、卸载 | 本地 Modern `packages/runtime/plugin-runtime/src/mf/index.tsx` |
| MF/Modern 集成 | 选择 Node/Browser 入口；注册本次请求的 Remote 任务；生产者 Node 入口分帧、隔离更新脚本并判断就绪，消费者合并已处理消息 | [rspack/index.ts](src/rspack/index.ts)、[bridgeStreamPlugin.node.tsx](src/ssr-runtime/bridgeStreamPlugin.node.tsx) |

```text
Host 本地 SSR：loadRemote(Node provider) ──▶ provider.renderStream(info)
Service SSR：Host HTTP ──▶ 生产者服务 ──────▶ 同一个 provider.renderStream(info)
                                                │
                          Bridge 构造生产者树 ───┤
                                                ▼
                             Modern renderStream(App, info)
                                → renderApplication(..., { element: App })
                                → HTML 流 + 初始 snapshot + 后续数据
                                                │
                         生产者适配层：分帧、脚本隔离、生成 ready
                                                │
                         消费者：按 instanceId 合流、发送到浏览器
                                                │
                         provider.hydrate → Modern hydrate → 独立 root
```

Host 与生产者之间只传请求参数、HTML 和数据；React element 在生产者内部创建、消费。Service HTTP 模式下，Host 不执行生产者 Node 代码；选择本地执行时才加载 Node 产物。两种方式继续复用现有流协议、提前水合与降级处理。

框架回调约定：

```ts
render(App, container, info?) → Promise<{ render, unmount }>
hydrate(App, container, info) → Promise<{ render, unmount }>
renderStream(App, info) → Promise<{
  stream,
  snapshot,
  abort,
  hydration?: { snapshot, updates, shellMarker },
}>
```

`hydration` 支持 shell 就绪后提前水合。没有它时仍能流式展示，水合等待最终 snapshot。以上是框架回调的原始返回值。Modern 的 Node 入口把它转换为 `BridgeSSRMessageResult`，统一输出完整 HTML、就绪通知和数据消息。消费者不再判断标签闭合或扫描 shell marker，Service App 缓存的也是这些已处理消息。社区 React 框架可实现同样约定；本轮实际适配与浏览器验证仅覆盖 Modern，没有验证其他框架。

## 构建与兼容

| 导入 | Browser | Node |
| --- | --- | --- |
| `@modern-js/runtime/mf` | Modern `render/hydrate`，SSR 方法为显式错误入口 | 改为 `@modern-js/runtime/mf/server` |
| `@module-federation/modern-js-v3/react-v18` 或 `react-v19` | 对应 React 版本的 Bridge | 改为 `react-server`，不导入 `react-dom/client` |
| `@module-federation/bridge-react/v18` 或 `v19` | 原版本入口 | 改为 Modern `react-server`，包含生产者消息适配层 |

选择发生在框架构建插件中，同一份 `src/bridge.tsx` 用于两个目标。构建器没有把它替换成 `createModernServerBridge(...)` 生成文件。Node/Browser 编入同一 revision；Bridge 开启时移除旧 `runtime/mf` 别名，避免它覆盖框架回调出口。

原有 CSR `createBridgeComponent({ rootComponent, render })` 保持可用；自定义 `render` 仍在每次更新时调用，只新增可选第三参数。没有配置 `renderStream` 的 provider 不暴露 SSR 能力。旧 application provider 与完整 snapshot 路径保留兼容。

本轮另外验证了异步初始化期间取消后立即重新挂载、同生产者多容器隔离、SSR/Browser 根 props 一致，以及更新时保留已水合 DOM 和交互状态。

## 本地代码与预览

下列路径是本机工作区，均使用同名分支；不是已发布包地址。

- MF：`/Users/bytedance/outter/core-bridge-service-ssr`。
- Modern 与商品 Demo：[商品 Demo 验收记录](/Users/bytedance/outter/modern-js-bridge-progressive-hydration/examples/module-federation/bridge-ssr/CALLBACKS-VERIFICATION.md)。先看 `product-app/src/bridge.tsx`、`inventory-app/src/bridge.tsx`，再看 Modern `packages/runtime/plugin-runtime/src/mf`。
- Service Demo：[Service 验收记录](/Users/bytedance/personal/mf-x-bridge-service-ssr/CALLBACKS-VERIFICATION.md)。先看 `apps/provider/src/bridge.tsx`、`apps/provider/server/modern.server.ts`，再看 Host 传输配置。

| 场景 | 预览 |
| --- | --- |
| 首页两个独立 Remote | [商品后台 4900](http://127.0.0.1:4900/?streamDelay=4500&activityDelay=5000) |
| Service HTTP SSR | [周末指南 HTTP 4950](http://127.0.0.1:4950/?mode=ssr-remote&featuredDelay=1500&recommendedDelay=7000) |
| 同一 provider 本地 Node SSR | [周末指南 local 4950](http://127.0.0.1:4950/?mode=ssr-local&featuredDelay=1500&recommendedDelay=7000) |
| CSR Host 请求 Service | [周末指南 CSR Host 4952](http://127.0.0.1:4952/?featuredDelay=1500&recommendedDelay=4000) |

先在延迟区域仍 loading 时操作已显示区域，再操作后到内容；具体按钮、降级入口和浏览器结果见两份 Demo 验收记录。

## 已运行验证

在 MF 仓库根目录执行：

```bash
pnpm --filter @module-federation/bridge-react run test
pnpm --filter @module-federation/modern-js-v3 run test
pnpm --filter @module-federation/bridge-react run build
pnpm --filter @module-federation/modern-js-v3 run build
pnpm exec prettier --check .
```

结果均通过：Bridge React 为 Jest 67 项、Rstest 11 项；Modern MF 包为 16 个测试文件、117 项测试；两个包构建与仓库格式检查通过。Modern 框架及两个 Demo 的类型检查、production build 和专项验证记录在各自工作区。

未运行更广泛的 `ci:local` E2E 或 Playwright 套件。本轮使用两个真实 production Demo 与 Divebell 浏览器验收，覆盖本次用户流程；这不等同于完整 CI 回归或任意框架兼容性验证。React 18 Demo 继续使用已有 UTF-8 输出补丁；Service Demo 的跨 pending Suspense 父级状态更新使用 `startTransition`，详情见其验收记录。
