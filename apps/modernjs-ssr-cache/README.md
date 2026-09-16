# Modern 单宿主天气 SSR Demo

先看 [中文体验指南](./DEMO_GUIDE.zh-CN.md)。正常操作只有更新预报、记录备忘、切换温度单位；天气、备忘、结果和内存集中在桌面一屏。旧的独立控制台和第二个 Host 已删除。

## 目录与运行方式

| 目录 / 脚本                                      | 职责                                                                                            |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| `host/`                                          | 唯一消费者，普通 Modern 配置、源码、build/dev/serve 脚本                                        |
| `host/server.cjs`                                | 消费者的生产服务入口，获取 Modern application，接入 MF adapter、动态 remote、更新/采样/快照接口 |
| `host/src/tomorrow/`                             | 静态引用 `remote/Weather` 的明天页面                                                            |
| `host/src/day-after/`                            | 后天天气页面，通过 server/client 两个薄封装动态加载组件                                         |
| `host/src/memo/`                                 | 独立 SSR 入口，模块级备忘计数和内部 ID；同源小 iframe 嵌入天气页                                |
| `remote/`、`remote-new-version/`                 | 明天天气的 v1/v2 Modern 生产者                                                                  |
| `dynamic-remote/`、`dynamic-remote-new-version/` | 后天天气的 v1/v2 Modern 生产者                                                                  |
| `build.cjs`                                      | 构建上述五个项目并复制版本化 provider 产物                                                      |
| `start.cjs`                                      | 启动模拟 CDN 和唯一 Host；更新和重置均在 Host 进程内完成                                        |
| `e2e.cjs`、`review.cy.cjs`                       | 独立浏览器 E2E；旧 `apps/modernjs-ssr` 回归和 CI 入口不变                                       |

从仓库根目录执行 `node apps/modernjs-ssr-cache/start.cjs --memory`，访问 http://127.0.0.1:3059/tomorrow。普通 `modern serve` 不安装实验控制接口，因此完整体验使用此启动脚本。所有页面仍由 Modern 生产 SSR 渲染。

## 动态消费与重置边界

初始配置只有静态天气 remote。后天页面的服务器端 React.lazy 封装调用消费者服务入口提供的 `__weatherLoad`，实际执行 MF `loadRemote()`；浏览器使用正常 MF API 对相同 release 水合。动态调用位于消费者服务入口，不通过改写 `from` 或绕过运行时追踪来冒充静态调用。

首次后天请求在 loader 中激活动态消费，MF ownership tracker 观察真实注册/加载，使静态分析证明失效。后续更新使用整体应用重建。出行备忘放在独立编译入口，局部天气更新保留它，整体重建使其重新初始化。结果由实际前后备忘 ID 比较得出。

整体重建现在销毁旧 MF 实例、归属此应用的 provider、缓存绑定和入口登记，只交接 remote 声明给新的实例。仍被其他消费者使用的 shared 保留。「重置体验（重建应用）」清空实验状态、恢复初始注册并整体重建；PID 和监听端口不变，随后可重新体验静态局部更新。

此清理不会撤销任意业务自行创建的全局变量、定时器或监听器。业务插件可使用 MF 的 `dispose` hook 释放自己拥有的资源。GC 只能回收不可达对象，不能承诺整个进程的所有内存清零。

更新会先后取两个 GC 样本，中间执行 adapter 更新并真实请求新的 SSR HTML 和备忘；最终浏览器导航、水合发生在取样之后。天气版本、module 状态与内存来自真实执行，非人工修改结果。

## 保留的限制

- 沿用已锁定 MF/Modern/Rspack 预览版本和 Modern 重复 pipe 的 pnpm patch。
- Host 服务端 splitChunks 仍禁用；本次界面重做没有解决既有共享入口初始化限制。
- 备忘是演示用进程内模块状态，不是持久化业务数据；重启或整体重建会清空。
- 动态激活后影响整个宿主更新策略，不只是后天页面。
- 控制接口仅用于本地演示，不作为生产管理接口。原并发故障覆盖仍在旧 SSR 回归中，本界面不再堆放请求窗口和故障按钮。
- 同一 checkout 的构建和运行服务共用产物；E2E 前停止体验服务，结束后重新启动。

## 验证

```sh
node apps/modernjs-ssr-cache/e2e.cjs
pnpm exec prettier --check apps/modernjs-ssr-cache
node --check apps/modernjs-ssr-cache/host/server.cjs
node --check apps/modernjs-ssr-cache/start.cjs
node --check apps/modernjs-ssr-cache/e2e.cjs
git diff --check
```

这是独立 demo 的对应 E2E，原 Modern SSR CI 入口不变。测试覆盖静态局部更新、连续动态整体重建、重置后恢复静态更新、SSR/水合及 GC 返回值。

## 使用本地 MF 改动

当前已发布预览包不包含本次销毁生命周期。安装依赖后，在本 worktree 执行：

```sh
pnpm exec turbo run build --filter=@module-federation/modern-js-v3...
node apps/modernjs-ssr-cache/use-workspace.cjs
node apps/modernjs-ssr-cache/start.cjs --memory
```

`use-workspace.cjs` 将工作区 MF 构建产物复制到临时 node_modules，再替换这五个 demo 应用中的 MF 符号链接；不会修改 pnpm 全局 store。每次重新构建 MF 后需再次执行。重新安装依赖可恢复锁定的预览包。

## 本次验证记录（2026-09-16）

执行命令：

```sh
pnpm exec turbo run build --filter=@module-federation/modern-js-v3...
pnpm --filter @module-federation/runtime-core run test
pnpm --filter @module-federation/runtime run test
pnpm --filter @module-federation/webpack-bundler-runtime run test
pnpm --filter @module-federation/modern-js-v3 run test
pnpm --filter @module-federation/node run test
pnpm --filter modernjs-ssr-cache-updates run e2e
node apps/modernjs-ssr-cache/use-workspace.cjs
node apps/modernjs-ssr-cache/e2e.cjs
pnpm exec prettier --check .
node --check apps/modernjs-ssr-cache/host/server.cjs
node --check apps/modernjs-ssr-cache/start.cjs
node --check apps/modernjs-ssr-cache/use-workspace.cjs
git diff --check
```

五个包分别通过 150、95、128、42、53 个测试。原 SSR 回归涵盖静态更新、失败恢复、流式请求排队/溢出/超时、水合及 70 轮生产更新，每轮并发 8 个真实请求；预热后的 GC Heap 从约 31.10 MiB 到峰值 32.00 MiB，增长约 0.90 MiB。该数值是本机本次运行结果，不是内存上限承诺。

天气 E2E 另外验证 20 次整体重建、第 20 次的旧 Host WeakRef 已不可达、Host 注册数量为 1、PID 不变，以及重置后再次静态更新。GC 数值不是 remote 文件大小，RSS 也不保证立即下降。

没有运行包含其他 SSR 示例的整个 `e2e-modern-ssr` CI job、无关包测试或 Modern/Rspack 全仓构建；本次使用对应包脚本与上述实际生产/浏览器回归，未修改 Modern/Rspack 源码。Changesets status 能生成计划，但会提示演示项目锁定的预览版本与工作区版本不同，保留这一既有预览依赖设计。
