# 天气 Demo 体验指南

这是一个 Modern 消费者应用，没有独立控制台。明天和后天是同一宿主的两个页面；天气由 remote 提供，出行备忘由宿主提供。天气是固定演示数据，不是真实预报。

## 先确认体验版本

对应 [MF PR #5088](https://github.com/module-federation/core/pull/5088)。Rspack 已锁定发布的 `2.2.3-canary-ba52386c-20260916132656`，包含 [Rspack PR #15720](https://github.com/web-infra-dev/rspack/pull/15720) 的入口导出同步修复，无需本地 Rspack 构建或额外 NODE_OPTIONS hook。MF 使用当前分支构建产物（通过 `use-workspace.cjs` 接入），Modern 使用现有预览及仓库 patch。

## 启动

在包含此目录的仓库根目录，使用 Node.js 24、pnpm 10.28.0：

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm exec turbo run build --filter=@module-federation/modern-js-v3...
node apps/modernjs-ssr-cache/use-workspace.cjs
node apps/modernjs-ssr-cache/start.cjs --memory
```

等待 `PLAYGROUND_READY`，打开 **http://127.0.0.1:3059/tomorrow**。保留启动终端，Ctrl+C 退出。脚本构建四个 remote 版本项目和一个 Host，随后运行生产 SSR；更新按钮只切换已有产物，不重新编译。

如端口被旧 demo 占用，先停止旧服务，或指定独立端口：

```sh
WEATHER_PORT=3079 WEATHER_ASSET_PORT=3086 node apps/modernjs-ssr-cache/start.cjs --memory
```

这时访问 http://127.0.0.1:3079/tomorrow。不要同时在同一个 checkout 运行构建、E2E 和体验服务，它们共用构建产物。

## 第一步：明天天气，体验局部更新

1. 在右侧「出行备忘」点击两次「记录一次」，让计数变成 2。这是宿主服务端模块中的计数，普通刷新会保留。
2. 在天气卡片点击「切换到 °F」：26°C 变成 78.8°F。无需请求服务器，证明 remote 的浏览器 React 交互已经就绪。
3. 点击「更新预报」，天气变成雨天、18°C。
4. 观察同屏结果：备忘仍是 2，提示「出行备忘保留」，服务进程未重启。
5. 再切换温度单位，18°C 应变成 64.4°F，证明更新后的 remote 也完成水合。

明天天气通过静态 import 引用 remote。更新时重新执行受影响的天气入口，独立备忘入口继续保留。不需要比较初始化 ID。

## 第二步：后天天气，体验整体重建

1. 点击顶部「后天」。首次服务端渲染才注册并通过 `loadRemote()` 加载另一份天气 remote；首屏 HTML 已包含多云、22°C。
2. 备忘仍是同一个宿主的服务端状态。可以再记录几次。
3. 点击「更新预报」，天气变为雷雨、16°C。
4. 观察备忘归零，结果提示「出行备忘已重新初始化」，但服务进程仍未重启。
5. 点击温度单位切换，16°C 应变为 60.8°F。

首次动态加载本身不会清空备忘。发生服务端动态消费后，后续 remote 更新才走整体重建。回到明天天气页也会显示已启用动态消费，不能假装仍是局部更新。

想从头体验时，点击「重置体验（重建应用）」。它清空备忘、实验历史和动态注册，释放旧 MF 实例并在同一进程创建新应用，恢复静态体验。**更新和重置都不退出 Node 进程，PID、端口不变。**

## 内存怎么看

每次更新自动执行：

```text
读取备忘 → 等待 SSR 空闲 → GC 后基准
  → 更新 remote → 请求新版 SSR 页面和备忘
  → 等待 SSR 完成 → GC 后采样 → 返回结果并刷新浏览器页面
```

结果区明确显示“更新前 GC 后 → 更新后 GC 后”，下一行显示本次采样 GC 前后的 Heap、GC 耗时和采样时间。

同屏显示的内存是 Host 进程的 JS Heap，不是 remote 文件体积，也不包含浏览器。两个样本都在服务端执行两次同步 GC，中间让出一次事件循环。新版页面已经在服务端完成渲染后才取后样本；最终浏览器导航和水合发生在采样之后。

回收只针对不再被引用的对象，不保证 RSS 立即下降，不能凭一次涨跌判断泄漏。「高级观察」中有 RSS、GC 前值、GC 耗时、实际更新方式及内部模块证据。

## 高级观察（首次体验可以不看）

- **连续更新 20 次**：每轮真实更新和重新导航 SSR 页面，天气 v1/v2 交替。后续轮次等待天气水合和备忘 HTML 就绪，并展示至少 0.8 秒；每轮自动记录前后内存。页面保持前台，可点击「停止连续更新」。单轮就绪等待超过 15 秒会停止并报告错误。
- **生成堆快照**：显示本地文件路径，可在 Chrome DevTools Memory 中加载。
- **内部证据**：展示真正的备忘模块 ID、PID 和 adapter 返回结果，主界面的保留/重建结论依据实际模块 ID 比较，不按页面名称写死。

手动检查 SSR HTML 和服务状态：

```sh
curl -fsS http://127.0.0.1:3059/tomorrow
curl -fsS http://127.0.0.1:3059/__weather/state
curl -fsS -X POST http://127.0.0.1:3059/__weather/sample
```

调试时先停止普通服务，然后运行：

```sh
node apps/modernjs-ssr-cache/start.cjs --debug
```

在 Chrome 打开 `chrome://inspect`，连接 9230 的 Host。

自动验证（先停止同一 checkout 的体验服务）：

```sh
node apps/modernjs-ssr-cache/e2e.cjs
```

E2E 使用真实浏览器验证原始 SSR HTML、更新前后水合交互、备忘保留/重置、正常更新 PID 不变、重置后恢复静态更新、20 轮更新以及桌面同屏/手机布局。

## 内置后的接入示范

示例已通过临时 workspace 包 `@demo/modern-mf-server` 代理更新：消费者创建自己的集成对象，解构得到 `updateRemotes`，之后只传 remote 列表，无需 application 参数。

包内部在 Modern 应用就绪时自动绑定 application，仍执行真实的请求排队、缓存更新、handler 发布和失败恢复。多入口共用同一应用绑定，独立应用分别绑定。重置后导出的更新函数仍然有效。

这是可运行的集成示范，**不是已发布的 Modern 官方 API**。详见 [临时包接入文档](./modern-mf-server/README.md) 和 [完整消费者入口](./host/weather.config.cjs)。
