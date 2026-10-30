# Unified React remote prototype

这个独立 demo 基于 `modern-component-data-fetch` 的 SSR/DataLoader 流程和 `router-demo` 的 Bridge provider 模型，验证同一个 `createReactRemote()` 能否根据生产者 metadata 分流。

只修改 demo，没有修改 `bridge-react` 的公开 API。`shared/exposes.ts` 中的 `createReactExpose(source, type)` 是构建期声明原型，不是最终的生产者运行时 API。

## 启动

在仓库根目录执行（Node 24，pnpm 10.28.0）：

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm exec turbo run build --filter=unified-react-host^... --filter=unified-react-provider^...
```

终端一启动 provider（5103）：

```sh
pnpm --filter unified-react-provider run dev
```

等 provider 编译完成后，终端二选择一种模式启动 host（5101）。不要在同一目录同时启动两种模式，避免它们写入同一构建输出。

纯 manifest：

```sh
DEMO_MODE=manifest pnpm --filter unified-react-host run dev
```

静态 snapshot：

```sh
pnpm --filter unified-react-host run snapshot
DEMO_MODE=snapshot pnpm --filter unified-react-host run dev
```

打开 <http://localhost:5101/>。切换模式时停止 host，使用另一条命令重启，并完整刷新浏览器。

`snapshot` 命令从当前 provider 捕获静态 fixture。页面启动时不通过该命令实时获取数据：`src/Document.tsx` 在客户端脚本前注入 fixture；`server/modern.server.ts` 在 SSR middleware 中将同一个 fixture 注入全局。修改 provider 后需重新生成 fixture。提交的 fixture 对应开发构建；不要将它用于不同部署或生产构建。

## 验证矩阵

两种模式均展示九个场景：

| 场景                 | 输入                           | 预期                                          |
| -------------------- | ------------------------------ | --------------------------------------------- |
| 普通组件             | id / loader                    | SSR HTML 包含组件；hydration 后计数按钮可用   |
| 带 DataLoader 的组件 | id / loader                    | SSR HTML 已包含数据；hydration 后计数按钮可用 |
| Bridge 应用          | id / loader                    | 客户端独立 root；应用内路由和计数按钮可用     |
| loader 优先          | id 指向 App，loader 导入 Plain | 渲染 Plain，不能误选 App 适配器               |
| noSSR 普通组件       | id                             | 服务端占位，客户端显示                        |
| noSSR 数据组件       | id                             | 客户端获取数据并显示                          |

`Rerender parent` 可检查子组件状态是否保留；`Remount remotes` 和 `Toggle remotes` 可观察重新挂载。数据重新取数仍继承现有 bridge 数据层行为，不在本原型中重新定义缓存规则。

页面显示 `manifest` / `snapshot` 表示类型元数据来源，不代表没有网络请求。snapshot 模式仍需加载远程 JS；验证结果是浏览器不请求 `5103/mf-manifest.json`。

## 可重复验证

host 启动后，在根目录检查原始 HTTP HTML（不是 hydration 后的 DOM）：

```sh
node apps/unified-react-demo/host/verify-ssr.mjs manifest
# 或
node apps/unified-react-demo/host/verify-ssr.mjs snapshot
```

该断言检查三个普通组件和两个数据组件的服务端内容、真实数据、App 不在服务端挂载、类型来源，以及 snapshot 模式的 HTML 注入。可以连续执行验证后续 SSR 请求。

安装了 byted-browser 时，使用其受控页面运行交互断言：

```sh
bytedbrowser setup
bytedbrowser open http://localhost:5101 --no-default-profile --no-default-state
bytedbrowser goto http://localhost:5101
bytedbrowser eval --file apps/unified-react-demo/host/verify-browser.js
bytedbrowser console --level error --limit 10
```

每次执行交互断言前完整刷新页面。脚本检查九个场景、普通组件和数据组件的 hydration 交互、两个 App 的独立路由/状态、父组件 rerender 后状态保留，并返回 provider manifest 请求列表。snapshot 模式该列表应为空。

## 实现边界与已发现的问题

- `loader` 优先于 `id`，类型也以 loader 返回模块的 `mf_module_id` 为准，不能用冲突的 id 预判。
- 只有 id 时，已注入的 snapshot 可以在工厂阶段直接选适配器；没有 snapshot 时先读取 manifest。只有 loader 时先加载模块再定位 metadata。
- 工厂级缓存只保存模块 Promise 和适配器类型，不保存 DataLoader 结果。有数据时复用现有 `createLazyComponent`；App 复用 `createRemoteAppComponent`；无数据组件直接通过 Lazy 渲染。
- 注册 `autoFetchDataPlugin`，并为数据分支重新准备 snapshot/data getter，使模块缓存不跳过请求数据初始化。
- manifest 到 snapshot 的默认转换不保留自定义字段，因此 demo 的 runtime plugin 显式复制 `reactExposes`。构建插件在 SSR manifest 合并前补写该字段。
- 两个 SSR 数据场景使用不同 expose，但共享业务实现。当前数据层按 expose key 注入 hydration 数据，同一个 expose 的两个实例返回不同数据时会发生冲突。此 demo 没有修复该现有协议限制。
- 仅有 loader 时，需要执行模块才能识别类型，因此该模块可能在 SSR 期间求值；浏览器专用模块应显式传 `noSSR: true`。
- 不实现 App SSR，不承诺固定 render 次数。没有实现统一 `delayLoading`、完整 fallback/ref/路由参数类型或加载失败重试协议；这些应在公开 API 设计阶段单独补齐。
- SSR 验证覆盖连续请求，不代表完成并发请求隔离或跨版本 React 的兼容性验证。

## 验证记录

开发模式的 manifest 和 snapshot 路径均通过 HTTP SSR 断言与浏览器交互断言；snapshot 浏览器没有 provider manifest 请求，最终干净导航后无控制台 error。

检查命令：

```sh
pnpm --filter unified-react-provider run build
pnpm --filter unified-react-host run build
pnpm --filter unified-react-host exec tsc --noEmit
pnpm --filter unified-react-provider exec tsc --noEmit
pnpm exec prettier --check apps/unified-react-demo pnpm-workspace.yaml pnpm-lock.yaml
git diff --check
```

未运行全仓包测试：未修改 packages。未运行旧 `e2e-modern-ssr` / `e2e-router` CI jobs：它们固定指向旧 demo 和端口，不覆盖此新应用；worktree 使用上述定向构建、类型检查、HTTP 和真实浏览器验证。无 publishable package 变化，因此没有 changeset。
