# Modern 单宿主天气 SSR Demo

先看 [中文体验指南](./DEMO_GUIDE.zh-CN.md)。正常操作只有更新预报、记录备忘、切换温度单位；天气、备忘、结果和内存集中在桌面一屏。旧的独立控制台和第二个 Host 已删除。

当前 Rspack 依赖为已发布的 `2.2.3-canary-ba52386c-20260916132656`，包含入口导出同步修复；启动无需本地 Rspack hook。MF 仍需按下文使用本分支构建产物，Modern 保留仓库中的预览 patch。

## 目录与运行方式

| 目录 / 脚本                                      | 职责                                                                                    |
| ------------------------------------------------ | --------------------------------------------------------------------------------------- |
| `modern-mf-server/`                              | 私有 workspace 代理包，自动绑定 Modern application，提供不带 application 参数的更新函数 |
| `host/`                                          | 唯一消费者，普通 Modern 配置、源码、build/dev/serve 脚本                                |
| `host/weather.config.cjs`                        | 天气业务配置：动态 remote、更新/采样/快照接口；不负责服务启动和生命周期接线             |
| `host/src/tomorrow/`                             | 静态引用 `remote/Weather` 的明天页面                                                    |
| `host/src/day-after/`                            | 后天天气页面，通过 server/client 两个薄封装动态加载组件                                 |
| `host/src/memo/`                                 | 独立 SSR 入口，模块级备忘计数和内部 ID；同源小 iframe 嵌入天气页                        |
| `remote/`、`remote-new-version/`                 | 明天天气的 v1/v2 Modern 生产者                                                          |
| `dynamic-remote/`、`dynamic-remote-new-version/` | 后天天气的 v1/v2 Modern 生产者                                                          |
| `build.cjs`                                      | 构建上述五个项目并复制版本化 provider 产物                                              |
| `start.cjs`                                      | 启动模拟 CDN 和唯一 Host；更新和重置均在 Host 进程内完成                                |
| `e2e.cjs`、`review.cy.cjs`                       | 独立浏览器 E2E；旧 `apps/modernjs-ssr` 回归和 CI 入口不变                               |

从仓库根目录执行 `node apps/modernjs-ssr-cache/start.cjs --memory`，访问 http://127.0.0.1:3059/tomorrow。普通 `modern serve` 不安装实验控制接口，因此完整体验使用此启动脚本。普通请求由 Modern 生产 SSR 渲染；更新窗口可按下文策略返回 CSR 页面壳。

## 内置后的接入示范

当前消费者通过私有临时包 [@demo/modern-mf-server](./modern-mf-server/README.md) 接入，业务更新不再传入 application：

```js
const { createFederationServer } = require('@demo/modern-mf-server');
const federation = createFederationServer(options);
const { updateRemotes } = federation;

// 在 weather.config.cjs 中提供天气业务配置；服务启动和生命周期由临时包负责。
await updateRemotes(changes);
```

临时包自动安装 Modern 生命周期钩子，在 `onReady` 绑定对应应用，内部仍调用真实 `adapter.updateRemotes(application, changes)`。同一应用的 MPA entry 共用绑定，独立应用各自创建集成对象。应用未就绪或已关闭时更新会报错；应用重建和 demo 重置不会令导出的函数持有过期 adapter。

这已经是可运行的代理示范，但包名和 API 不是正式 Modern 接口。本地包的 serve 入口已负责启动 Modern 服务并挂载钩子。完整示例见 [host/weather.config.cjs](./host/weather.config.cjs)，包内 README 解释了真实更新流程和生命周期。

## 更新期间的请求策略与 SSR 内通知

`host/server/request-policy.cjs` 由 `weather.config.cjs` 显式导入到
`application.requestPolicy`。它只在请求受到更新阻塞或等待失败时执行，读取原始
`Request`（URL、headers、method、signal）和 `update` 状态，同步返回
`wait`、`csr` 或 `reject`。默认等待有数量和时间上限；排队请求按顺序、最多 8 个同时恢复。

在更新窗口请求 `/tomorrow?updatePolicy=csr` 可查看客户端降级的 HTML；
`?updatePolicy=reject` 返回 503。未更新时这些参数不改变正常 SSR。
CSR 直接使用上次发布成功的模板和公开 remote 信息，不执行业务 SSR、中间件或 loader。
需要鉴权的页面必须在进入 gate 前完成鉴权；依赖服务端 loader 的页面仍需等待数据请求，
不能用这个选项绕过正在更新的应用。

本地包绑定的 `federation.shouldUpdateRemotes(remotes, { revision })` 用于比较版本。
版本由业务版本服务提供，框架不会通过 URL 猜测 remote 内容是否改变。
外部监听器调用 `await federation.updateRemotes(...)` 等待发布完成；SSR 中发现变化时使用：

```js
// 这里是服务端执行的业务代码，通过已绑定当前 application 的服务函数调用。
const receipt = await federation.updateRemotes(release.remotes, {
  revision: release.revision,
  defer: 'after-response',
});
```

这只等待受理，当前响应继续使用旧版本；响应流和注册的异步任务结束后才进入更新队列。
通过 `federation.updateStatus` 查看 applied/failed，不能把 receipt 当成更新成功。
普通 `updateRemotes` 仍拒绝在 SSR 内等待自己更新。上述能力是本轮适配器与 Modern 改动；
正式 `@modern-js/runtime/mf` 出口还未发布。

## 动态消费与重置边界

初始配置只有静态天气 remote。后天页面的服务器端 React.lazy 封装调用消费者服务入口提供的 `__weatherLoad`，实际执行 MF `loadRemote()`；浏览器使用正常 MF API 对相同 release 水合。动态调用位于消费者服务入口，不通过改写 `from` 或绕过运行时追踪来冒充静态调用。

首次后天请求在 loader 中激活动态消费，MF ownership tracker 观察真实注册/加载，使静态分析证明失效。后续更新使用整体应用重建。出行备忘放在独立编译入口，局部天气更新保留它，整体重建使其重新初始化。结果由实际前后备忘 ID 比较得出。

整体重建现在销毁旧 MF 实例、归属此应用的 provider、缓存绑定和入口登记，只交接 remote 声明给新的实例。仍被其他消费者使用的 shared 保留。「重置体验（重建应用）」清空实验状态、恢复初始注册并整体重建；PID 和监听端口不变，随后可重新体验静态局部更新。

此清理不会撤销任意业务自行创建的全局变量、定时器或监听器。业务插件可使用 MF 的 `dispose` hook 释放自己拥有的资源。GC 只能回收不可达对象，不能承诺整个进程的所有内存清零。

更新会先后取两个 GC 样本，中间执行 adapter 更新并真实请求新的 SSR HTML 和备忘；最终浏览器导航、水合发生在取样之后。天气版本、module 状态与内存来自真实执行，非人工修改结果。

## 保留的限制

- 沿用已锁定 MF/Modern/Rspack 预览版本和 Modern 重复 pipe 与局部更新同步 Node 入口导出的 pnpm patch。
- Host 服务端 splitChunks 仍禁用；本次界面重做没有解决既有共享入口初始化限制。
- 备忘是演示用进程内模块状态，不是持久化业务数据；重启或整体重建会清空。
- 动态激活后影响整个宿主更新策略，不只是后天页面。
- 同名 provider 的两个发布版本不能仅靠消费者 alias 实现隔离；本轮回归曾复现 chunk 公共路径冲突。测试中的同一 provider 别名保持相同版本，本次未解决同名 provider 多版本共存。
- 控制接口仅用于本地演示，不作为生产管理接口。原并发故障覆盖仍在旧 SSR 回归中，本界面不再堆放请求窗口和故障按钮。
- 同一 checkout 的构建和运行服务共用产物；E2E 前停止体验服务，结束后重新启动。

## 使用本地 MF 改动

当前已发布预览包不包含本分支的全部缓存清理与更新策略改动。安装依赖后，在本 worktree 执行：

```sh
pnpm exec turbo run build --filter=@module-federation/modern-js-v3...
node apps/modernjs-ssr-cache/use-workspace.cjs
node apps/modernjs-ssr-cache/start.cjs --memory
```

`use-workspace.cjs` 将工作区 MF 构建产物复制到临时 node_modules，再替换这五个 demo 应用中的 MF 符号链接；不会修改 pnpm 全局 store。每次重新构建 MF 后需再次执行。重新安装依赖可恢复锁定的预览包。

## IPv4 分享

`WEATHER_HOST=0.0.0.0` 让宿主与资源服务监听 IPv4；`SSR_CACHE_ASSET_URL` 指定同事可访问的资源地址，并传入全部生产构建。默认只监听本机。启动命令见[中文体验指南](./DEMO_GUIDE.zh-CN.md#分享给同一网络的同事)；不同电脑间的路由和防火墙仍需实际连通验证。

## 当前验证

天气与内存的操作步骤统一见[中文体验指南](./DEMO_GUIDE.zh-CN.md)，不再保留历次运行日志。GC 后 Heap 是宿主存活 JS 对象的采样，不是 Remote 文件大小；不能用单次数字判断是否泄漏，RSS 也不保证立即下降。

本轮验证记录：

| 仓库   | 命令 / 检查                                                                            | 结果                                                        |
| ------ | -------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| MF     | `pnpm exec turbo run build --filter=@module-federation/modern-js-v3`                   | 20 个构建任务通过                                           |
| MF     | `pnpm --filter @module-federation/modern-js-v3 build`                                  | 最后一次适配器修改后重新构建通过                            |
| MF     | `pnpm --filter @module-federation/modern-js-v3 run test`                               | 53 个测试通过                                               |
| MF     | `pnpm --filter @demo/modern-mf-server test`                                            | 2 个测试通过                                                |
| Modern | `pnpm --filter @modern-js/server-core test`                                            | 63 个测试通过                                               |
| Modern | `NODE_ENV=production node --test packages/server/core/tests/application.http.test.cjs` | 3 个测试通过                                                |
| MF     | `pnpm --filter modernjs-ssr-cache-updates run e2e`                                     | 静态产物、生产与 playground 全部通过；两组浏览器各 3 个测试 |
| MF     | `node apps/modernjs-ssr-cache/e2e.cjs`                                                 | 3 个真实浏览器测试通过                                      |

浏览器 E2E 覆盖真实 SSR、水合、局部更新、连续整体重建、重置后恢复静态更新和 GC 返回值。它需要当前 MF 构建产物与 Modern patch；同一 checkout 运行 E2E 前先停止体验服务。

生产回归还验证了更新期间的 CSR 页面壳、客户端交互、loader 拒绝，以及断开连接后仍等待生产任务的延迟提交。70 轮更新中，第 20～70 轮 GC 后 Heap 从 30.56 到 31.31 MiB；实例与绑定数量稳定。这是本次运行证据，不是内存上限承诺。

另外执行并通过 `pnpm install --frozen-lockfile --ignore-scripts`、`pnpm --filter @module-federation/modern-js-v3 lint`、`pnpm exec prettier --check .`、`python3 .codex/skills/changeset-pr/scripts/run_changeset_status.py --json` 与 `git diff --check`。Changesets 仍提示 demo 锁定的预览版本不同于 workspace 版本；没有改变既有预览依赖设计。

此独立 demo 没有替换旧 `e2e-modern-ssr` CI 入口。worktree 按约定直接运行上述对应 package 脚本，没有重复包含其他示例的整个 CI job、无关包测试或 Modern/Rspack 全仓构建。Modern 的完整命令与边界见其 `SSR_REQUEST_COORDINATION.md`。
