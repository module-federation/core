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

从仓库根目录执行 `node apps/modernjs-ssr-cache/start.cjs --memory`，访问 http://127.0.0.1:3059/tomorrow。普通 `modern serve` 不安装实验控制接口，因此完整体验使用此启动脚本。所有页面仍由 Modern 生产 SSR 渲染。

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
- 控制接口仅用于本地演示，不作为生产管理接口。原并发故障覆盖仍在旧 SSR 回归中，本界面不再堆放请求窗口和故障按钮。
- 同一 checkout 的构建和运行服务共用产物；E2E 前停止体验服务，结束后重新启动。

## 验证

```sh
node apps/modernjs-ssr-cache/e2e.cjs
pnpm exec prettier --check apps/modernjs-ssr-cache
node --check apps/modernjs-ssr-cache/host/weather.config.cjs
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
node --check apps/modernjs-ssr-cache/host/weather.config.cjs
node --check apps/modernjs-ssr-cache/start.cjs
node --check apps/modernjs-ssr-cache/use-workspace.cjs
git diff --check
```

五个包分别通过 150、95、128、42、53 个测试。原 SSR 回归涵盖静态更新、失败恢复、流式请求排队/溢出/超时、水合及 70 轮生产更新，每轮并发 8 个真实请求；预热后的 GC Heap 从约 31.10 MiB 到峰值 32.00 MiB，增长约 0.90 MiB。该数值是本机本次运行结果，不是内存上限承诺。

天气 E2E 另外验证 20 次整体重建、第 20 次的旧 Host WeakRef 已不可达、Host 注册数量为 1、PID 不变，以及重置后再次静态更新。GC 数值不是 remote 文件大小，RSS 也不保证立即下降。

没有运行包含其他 SSR 示例的整个 `e2e-modern-ssr` CI job、无关包测试或 Modern/Rspack 全仓构建；本次使用对应包脚本与上述实际生产/浏览器回归，未修改 Modern/Rspack 源码。Changesets status 能生成计划，但会提示演示项目锁定的预览版本与工作区版本不同，保留这一既有预览依赖设计。

### 临时集成包验证

`@demo/modern-mf-server` 已接入真实宿主。以下命令通过：

```sh
pnpm install --ignore-scripts
pnpm install --frozen-lockfile --lockfile-only --ignore-scripts
pnpm --filter @demo/modern-mf-server test
node --check apps/modernjs-ssr-cache/host/weather.config.cjs
node --check apps/modernjs-ssr-cache/modern-mf-server/index.cjs
pnpm exec prettier --check apps/modernjs-ssr-cache/modern-mf-server apps/modernjs-ssr-cache/host/weather.config.cjs apps/modernjs-ssr-cache/host/package.json apps/modernjs-ssr-cache/README.md apps/modernjs-ssr-cache/DEMO_GUIDE.zh-CN.md
git diff --check
```

代理生命周期测试 2 个通过，覆盖独立应用隔离和重置后使用新 adapter。本次浏览器验证先执行 `node apps/modernjs-ssr-cache/use-workspace.cjs`，通过本地 resolve hook 加载包含 Rspack #15720 的构建，再运行：

```sh
WEATHER_PORT=3079 WEATHER_ASSET_PORT=3086 NODE_OPTIONS='--require=/tmp/weather-local-rspack.cjs' node apps/modernjs-ssr-cache/start.cjs --memory
WEATHER_TEST_URL=http://127.0.0.1:3079 node apps/modernjs-ssr-cache/e2e.cjs
```

真实浏览器 E2E 3 个通过，覆盖 SSR、水合、连续更新、动态整体重建及重置后的静态局部更新。上述 `/tmp` hook 是本机验证辅助文件，不属于常规启动依赖；这是 9 月 16 日的历史验证；9 月 17 日已替换为新 Rspack canary，见下文。

本次未运行旧示例的整个 `e2e-modern-ssr` CI job，使用天气 demo 对应 E2E；未重复无关包及 Modern/Rspack 全仓测试，本次仅改动私有 demo 集成包和接线。

### 一体化启动与局部更新内存复测

服务启动已移到 `modern-mf-server/serve.cjs`，消费者只保留 `weather.config.cjs` 的天气业务配置。`pnpm --filter modernjs-ssr-cache-host run serve` 调用本地集成入口；完整 demo 仍由 `start.cjs` 构建并启动模拟 CDN。

本次执行 `pnpm --filter @demo/modern-mf-server test`（2 个通过）、`WEATHER_TEST_URL=http://127.0.0.1:3079 node apps/modernjs-ssr-cache/e2e.cjs`（3 个真实浏览器 E2E 通过），以及 `node --check apps/modernjs-ssr-cache/host/weather.config.cjs`、`node --check apps/modernjs-ssr-cache/modern-mf-server/serve.cjs`、`git diff --check`。格式检查：

```sh
pnpm exec prettier --check apps/modernjs-ssr-cache/modern-mf-server apps/modernjs-ssr-cache/host/weather.config.cjs apps/modernjs-ssr-cache/host/package.json apps/modernjs-ssr-cache/start.cjs apps/modernjs-ssr-cache/README.md apps/modernjs-ssr-cache/DEMO_GUIDE.zh-CN.md
```

额外用本机脚本 `node /tmp/weather-integrated-memory.cjs` 调用真实更新、采样和快照接口：120 次预热后，再连续 600 次静态局部更新，全部返回 `entries`，PID 保持 48375。GC 后 JS Heap：

| 阶段          |   MiB |
| ------------- | ----: |
| 预热后        | 36.55 |
| 再更新 300 次 | 36.53 |
| 再更新 600 次 | 37.01 |
| 空闲 15 秒后  | 35.92 |

比较四份堆快照，每份只有宿主和当前 provider 两个 `ModuleFederation` 对象，宿主 ID 不变，之前采样的 provider 在后续更新快照中消失。新增占用主要是 V8 code 及其内部关联对象；本轮未复现旧 provider 持续累积。此结果不保证所有场景无泄漏，也不保证 RSS 回落；堆快照自身会影响进程内存，因此不要用此次 RSS 判断更新泄漏。

本次仍使用本地 MF / Rspack 构建，没有替换发布依赖；该等待项已由 9 月 17 日的版本升级解除，见下文。旧示例整个 CI job 和无关包全仓测试没有重复，原因同上一节。

### Rspack 发布 canary 验证（2026-09-17）

根依赖及 overrides 中的 Rspack core/cli 已统一到 `2.2.3-canary-ba52386c-20260916132656`，锁文件由 pnpm 重新生成。宿主实际解析到 pnpm 安装的 `@rspack-canary/core`，不是 `/private/tmp/rspack-entry-exports`。MF 使用当前分支构建产物，Modern 使用仓库中的预览 patch；这不是 MF/Modern 全部发布包的验收。

执行命令：

```sh
pnpm install --ignore-scripts
pnpm install --frozen-lockfile --lockfile-only --ignore-scripts
node apps/modernjs-ssr-cache/use-workspace.cjs
env -u NODE_OPTIONS WEATHER_PORT=3079 WEATHER_ASSET_PORT=3086 node apps/modernjs-ssr-cache/start.cjs --memory
WEATHER_TEST_URL=http://127.0.0.1:3079 node apps/modernjs-ssr-cache/e2e.cjs
pnpm --filter modernjs-ssr-cache-updates run e2e
pnpm --filter modernjs-ssr-cache-updates run e2e:playground
pnpm exec prettier --check package.json pnpm-lock.yaml apps/modernjs-ssr-cache/README.md apps/modernjs-ssr-cache/DEMO_GUIDE.zh-CN.md apps/modernjs-ssr/cache-updates/README.md packages/modernjs-v3/README.md
git diff --check
```

天气浏览器 E2E 3 个通过，包括局部更新、整体重建、水合与重置。冻结锁文件和格式检查通过。额外的旧 SSR 回归中，static 和 production 阶段通过；playground 阶段及其独立复跑均失败：动态宿主并发更新后出现 `Cannot read properties of null (reading 'useState')`，随后在 `e2e/playground.cjs:202` 的版本/等待时间断言失败。当时该回归未通过；后续已定位到 MF removeRemote 保留旧容器入口的遗漏，修复见下文。

本次没有修改 runtime 行为来掩盖失败。未跑整个 `e2e-modern-ssr` CI job 或无关包测试，使用上述对应 package 脚本及天气 E2E；旧 playground 失败已在后续 remote 容器清理修复中解决，见下文。

### 旧 playground 动态重建修复（2026-09-17）

`removeRemote` 在保留仍被其他消费者使用的 shared runtime 时提前返回，没有清除旧 remoteEntry 的全局引用和加载 Promise。之后同一 remote 再次加载可能取回旧 container，导致旧 React 与新 renderer 混用。修复保留 shared 工厂和执行缓存的规则，仅确保两种清理路径都移除 remote 的全局入口、加载 Promise 和宿主 moduleCache。单测同时断言 shared 工厂身份不变与加载入口被移除。

验证命令：

```sh
pnpm exec turbo run build --filter=@module-federation/modern-js-v3...
pnpm --filter @module-federation/runtime-core run test
pnpm --filter modernjs-ssr-cache-updates run e2e:playground
pnpm --filter modernjs-ssr-cache-updates run e2e
node apps/modernjs-ssr-cache/use-workspace.cjs
env -u NODE_OPTIONS WEATHER_PORT=3079 WEATHER_ASSET_PORT=3086 node apps/modernjs-ssr-cache/start.cjs --memory
WEATHER_TEST_URL=http://127.0.0.1:3079 node apps/modernjs-ssr-cache/e2e.cjs
pnpm exec prettier --check .
pnpm exec changeset status
git diff --check
```

不重复整个旧 SSR CI job 或无关包测试，使用对应 SSR package 回归和天气浏览器 E2E；此修复不需要改动 Rspack 或 Modern 源码。Changesets 检查保留现有预览版本与 workspace 版本不一致的提示。

结果：依赖构建 20 个任务成功，runtime-core 151 个测试通过，playground 独立回归及完整 static/production/playground 回归均通过，天气浏览器 E2E 3 个通过。全仓格式、Changesets 和 diff 检查通过。
