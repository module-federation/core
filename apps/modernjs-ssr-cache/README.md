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
| `start.cjs`                                      | 启动模拟 CDN 和唯一 Host；处理用户主动重置时的 Host 重启。不提供控制台应用                      |
| `e2e.cjs`、`review.cy.cjs`                       | 独立浏览器 E2E；旧 `apps/modernjs-ssr` 回归和 CI 入口不变                                       |

从仓库根目录执行 `node apps/modernjs-ssr-cache/start.cjs --memory`，访问 http://127.0.0.1:3059/tomorrow。普通 `modern serve` 不安装实验控制接口，因此完整体验使用此启动脚本。所有页面仍由 Modern 生产 SSR 渲染。

## 动态消费与重置边界

初始配置只有静态天气 remote。后天页面的服务器端 React.lazy 封装调用消费者服务入口提供的 `__weatherLoad`，实际执行 MF `loadRemote()`；浏览器使用正常 MF API 对相同 release 水合。动态调用位于消费者服务入口，不通过改写 `from` 或绕过运行时追踪来冒充静态调用。

首次后天请求在 loader 中激活动态消费，adapter 的 `staticOnly` 随即变为 false，MF ownership tracker 同时观察注册/加载。后续更新使用整体应用重建。出行备忘放在独立编译入口，局部天气更新保留它，整体重建使其重新初始化。结果由实际前后备忘 ID 比较得出。

已发生的动态消费标记不能靠清空 UI 或重新加载入口恢复。早期尝试仅重建应用来重置时，回到明天后的更新仍被正确识别为整体重建。因此重置明确重启 Host，保持监听地址，不重新 build；常规更新只重建 SSR 资源并保持 PID。

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

这是独立 demo 的对应 E2E，未更改原 Modern SSR CI 入口或发布包。旧全量 SSR CI、无关包单测和框架全量构建不在本次界面重做中重复执行。桌面和手机截图由 Cypress 生成。

本次验证：以上命令通过，E2E 日志 `/tmp/weather-e2e-verified.log`（三个浏览器场景，包括 20 次真实更新）。已检查桌面及手机截图。初次验证发现缓存 iframe 先于父页面水合时会遗漏备忘就绪消息，已通过父页面水合后读取和 iframe 加载回调修复；重置逻辑也改为明确重启 Host，最终全套通过。worktree 安装执行 `corepack enable` 和 `pnpm install --frozen-lockfile`。提交另执行 `pnpm exec commitlint --from HEAD~1 --to HEAD`。
