# Modern SSR cache review demo

首次体验请阅读 [中文 Demo 体验指南](./DEMO_GUIDE.zh-CN.md)，包含启动步骤、页面关系、更新范围验证、并发实验和内存观察。

Independent review directory. The previous demo, E2E entry and CI configuration
are unchanged. Review this locally before promoting it to the primary tests.

## Run

From the repository root, with the existing workspace dependencies and MF builds:

```sh
node apps/modernjs-ssr-cache/start.cjs --memory
```

Open <http://127.0.0.1:3059/>. The old demo can continue using port 3058.
The launcher runs each project’s `pnpm run build` in place and starts its compiled
SSR host. Source files and `modern.config.ts` are never generated or rewritten.
Remote v1/v2 are separate directories, just like `modernjs-ssr` examples.

- `console/`: Modern SSR route, loader and React controls, including iframe windows.
- `host/`: Modern MPA host with a statically consumed Remote A and independent B.
- `dynamic-host/`: Modern MPA host with runtime remote registration/loading.
- `remote/`, `remote-new-version/`, `dynamic-remote/`, `dynamic-remote-new-version/`: Modern providers, built into separate v1/v2 releases.
- Each directory owns a complete `modern.config.ts`, `package.json`, `src/` and
  `tsconfig.json`, with ordinary `dev`, `build`, and `serve` scripts.
- `start.cjs`, `console-server.cjs`: process orchestration and Modern production
  serving. Control API requests pass through Modern's bypass to a local control
  service, keeping the console responsive while either host is draining.

The versioned asset server represents a CDN. Remote components and their manifests
are built by Modern with the MF plugin. The Node control service and traffic
worker reuse the existing acceptance harness; they do not render the console.
The console and the two tested SSR applications run in separate processes.

## CJS 脚本的职责与调用关系

这些脚本负责启动、实验控制和自动验证。页面与 Remote 组件仍由各项目的
`modern.config.ts`、Modern 构建以及 React 源码实现。

| 脚本                                         | 谁调用 / 何时执行                             | 具体职责                                                                                                                                                                                                                                                                          |
| -------------------------------------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`start.cjs`](./start.cjs)                   | 手动启动入口；或由 `e2e.cjs` 启动             | 启动版本化静态资源服务，调用 `build.cjs`；分别启动两个 Host 进程和 Modern 控制台进程。它还提供内部控制 API，汇总 Host 状态、请求结果和内存样本，按需启动流量进程，并在退出时清理子进程。                                                                                          |
| [`build.cjs`](./build.cjs)                   | `start.cjs` 启动服务前调用                    | 依次执行七个 Modern 子项目的 `pnpm run build`。把四个 Remote 的 `dist` 复制到对应的 `releases/v1`、`releases/v2`、`releases/palette/v1`、`releases/palette/v2`，供静态资源服务模拟 CDN。会覆盖对应的旧发布产物，不修改源码或生成配置。                                            |
| [`host.cjs`](./host.cjs)                     | `start.cjs` 启动两次，每个 Host 一个进程      | 根据 `LAB_KIND` 加载 `host/dist` 或 `dynamic-host/dist`，通过 Modern 的 `createProdServer` 提供真实 SSR。把 MF 的 `createSSRUpdateAdapter` 接到 Modern 的应用生命周期，设置请求排队、超时和更新范围；提供更新、扣住/释放旧 loader、状态、内存采样和堆快照等 `/__lab/*` 控制接口。 |
| [`console-server.cjs`](./console-server.cjs) | `start.cjs` 单独启动                          | 用 Modern 的 `createProdServer` 提供 `console/dist` 的 SSR 页面，默认监听 3059。将 `/api/*` 请求通过 bypass 转发给 `start.cjs` 的内部控制服务；控制台自身不参与被测 Host 的更新，因此 Host 排空时仍可操作。                                                                       |
| [`traffic.cjs`](./traffic.cjs)               | 点击并发或重复更新实验后，由 `start.cjs` fork | 本目录独立的 Node 流量发生器。通过真实 HTTP 扣住旧请求、触发更新、发送并发请求并收集状态/版本/耗时；按模式自动释放或等待手动释放。内存实验循环更新、发送请求并请求 Host 采样；可视模式逐轮等待 iframe 加载确认后继续，通过进程消息把结果返回给控制服务。                          |
| [`e2e.cjs`](./e2e.cjs)                       | 独立自动测试入口                              | 默认以测试模式启动 demo，给控制台和资源服务分配随机端口并为 Host 开启 GC。运行 `review.cy.cjs`，随后验证静态/动态更新的真实 HTTP 排队、队列满、等待超时、返回版本、PID 不变和内存采样，最后关闭自己启动的服务。                                                                   |
| [`review.cy.cjs`](./review.cy.cjs)           | 由 `e2e.cjs` 交给 Cypress 执行                | 浏览器场景，不是用 `node` 直接运行的服务脚本。验证控制台自身的 Modern SSR、Host/Remote 水合与交互、动态加载、真实 HTML，以及更新期间 iframe 的等待和恢复、B 入口不受局部更新影响、内存页和移动端布局。                                                                            |

启动关系如下；`host.cjs` 的两次启动是两个独立 SSR 进程：

```text
手动执行 start.cjs                 自动执行 e2e.cjs
        │                                  │
        │                          启动 start.cjs --test
        │                          运行 review.cy.cjs + HTTP 检查
        ▼
  启动资源服务 → build.cjs → 所有构建完成
        │
        ├── host.cjs（static） → host/dist
        ├── host.cjs（dynamic）→ dynamic-host/dist
        ├── console-server.cjs → console/dist
        └── 收到实验请求时 fork traffic.cjs
```

点击“开始并发实验”时，控制台 React 页面请求 `/api/experiment`，经
`console-server.cjs` 转发给 `start.cjs`，再由流量进程访问目标 Host 的
`/__lab/*` 控制接口和实际 SSR 路由。页面中的四个 iframe 是浏览器额外发起的四次
真实导航（A1/A2/A3 访问 `/`，B1 访问 `/b`），不是 `traffic.cjs` 生成的窗口；它计入 Host 的实际排队数量，但不计入
Node 请求列表。

**`build.cjs` 只在启动阶段执行，更新 Remote 时不会再次执行。** 更新切换的是已构建
的 v1/v2 manifest 地址，再由 MF/Modern 清理缓存或重建应用资源；运行中的 Host
进程保持不变。

`host.cjs` 和 `console-server.cjs` 都使用 Modern 的生产服务 API，并非自行实现
SSR 渲染器。之所以保留这些服务入口，是为了接入本次实验的更新适配器、请求闸门和
控制接口。普通 `modern serve` 不会自动安装这些实验接口。

日常只需执行上面的 `start.cjs` 或下方的 `e2e.cjs`。其余脚本由入口传入环境变量、
端口和进程通信配置，不需要逐个手动启动。内存样本由 `host.cjs` 在被测进程内采集；
控制台、控制服务、构建和流量进程的内存不混入 Host 样本。

## What to try

1. The console itself displays server-rendered PID/time evidence. The left/right
   frames show actual Modern host pages. Change BPM on the old page, update to v2,
   and compare the new SSR version while the old page retains its client state.
2. Use “查看真实 HTML” to inspect a freshly fetched server response. The provider
   version and loader module identity help distinguish SSR cache reuse/reload.
3. Select the dynamic host. Load the palette in the browser, then register it for
   SSR and inspect the raw HTML containing “Choose a mood.”.
4. Start the traffic experiment. A held loader keeps the update in draining;
   twelve new Node requests target A/B (nine `/`, three `/b`). Four additional
   iframes open during draining: A1/A2/A3 and B1, each with its own real URL and
   loading status. These labels describe page routes, not component counts.
   Default release is automatic. With manual release, B1 can finish while all
   three A windows still wait for the static A update. A dynamic whole-app update
   affects both routes. The four browser requests are additional to the Node
   traffic; at most 16 new requests queue in the default whole-app experiment.
5. The memory tab samples only the selected host PID, can request GC, perform
   twenty updates, and generate an explicit heap snapshot. No periodic heap
   sampling occurs. Queue counters include the iframe; Node result counts do not.

Fault presets intentionally produce queue-full or timeout 503 responses. A failed
iframe response stays visible; the UI does not fabricate a stale-page fallback.
If a background tab misses draining, it reports that instead of claiming blocking.

Manual debugger startup:

```sh
node apps/modernjs-ssr-cache/start.cjs --debug
```

Attach via `chrome://inspect` to ports 9230 (static) / 9231 (dynamic). This also
enables GC. The console PID and load-generator PID are excluded from host samples.

## Independent validation

```sh
node apps/modernjs-ssr-cache/e2e.cjs
```

This runs the new console's Cypress scenarios and real HTTP admission/memory
checks without replacing the existing suite. Cypress uses isolated Electron with
cross-origin iframe access enabled for assertions; production UI code does not
read cross-origin DOM. Screenshots and temporary project paths are printed.

## Explicit constraints

- Uses the installed Modern preview and existing pnpm patch for repeated SSR pipe
  startup, as documented in the current cache-updates fixture. A corrected Modern
  preview is still needed before removing that patch.
- Server splitChunks remains disabled for these MPA fixtures because the tested
  preview's shared-entry output previously failed initialization. This demo does
  not claim to fix that limitation.
- Static and dynamic contracts stay in separate host builds. Providers have v1/v2
  artifacts prepared by Modern builds; updates swap the manifest URL without
  rebuilding/restarting the running host process.
- Node orchestration is local test infrastructure, not a production admin API.
  No deployment worker rotation, RSC or arbitrary global side-effect cleanup is
  claimed. Heap trends alone do not prove absence of business-code leaks.

### Dependency and build setup

The projects are regular pnpm workspaces, registered under
`apps/modernjs-ssr-cache/*`. They pin the published MF/Modern previews used in the
acceptance work; the root keeps the Rspack preview override and Modern patch.
This avoids converting linked workspace implementation files into app graph
nodes or manufacturing a temporary consumer installation.

```sh
pnpm install --frozen-lockfile
pnpm --filter modernjs-ssr-cache-host run build
```

For the complete update experience use the launcher above: it also starts the
versioned asset server (port 3066) and the update/admission controls. Ordinary
`modern serve` alone does not install those experimental server controls.

### Verification after restructuring

- `node apps/modernjs-ssr-cache/e2e.cjs`: passed; three browser scenarios plus
  real HTTP admission, queue-full/timeout and memory-update checks. Log:
  `/tmp/modern-sibling-e2e.log`.
- This tests the ordinary installed MF preview, direct per-project Modern builds,
  and the existing patched Modern preview. No temporary project generation or
  copied MF installation is involved.
- Existing SSR CI and unrelated framework suites were not rerun: this remains an
  independently reviewed demo and does not replace the original tests.
- `pnpm install --no-frozen-lockfile --ignore-scripts`, followed by
  `pnpm install --frozen-lockfile --ignore-scripts`: passed. The final lockfile is
  pnpm-generated; an intermediate attempt to trim unrelated peer-resolution
  churn failed lock validation and was discarded.
- `pnpm exec prettier --check apps/modernjs-ssr-cache pnpm-workspace.yaml pnpm-lock.yaml`
  and `git diff --check`: passed.

### Multiple request windows

The traffic panel shows four independent iframe navigations (A1/A2/A3/B1). Each
window retains its own page and hydration state. The 9A/3B numbers refer to Node
requests to host routes `/` and `/b`, not numbers of Remote components. The four
browser requests are additional, and count toward the real admission queue.

The console matches navigation to the returned experiment ID so an old polling
response cannot trigger a new experiment's windows. Load events also match the
iframe URL so an old navigation cannot clear the new window's waiting state.
The host assigns immutable `/static/` resources a separate scope: an A-only
update must not block B's CSS/JS. Whole-application updates still use the global
request gate.

Multi-window validation: `node apps/modernjs-ssr-cache/e2e.cjs` passed (log:
`/tmp/modern-multi-frame-verified.log`). Cypress verifies all four windows hydrate,
B hydrates while three A windows still wait during a selective update, and all
four wait/recover with zero Node rejections during a whole-application update.
The earlier browser failure exposed B asset requests being assigned to A's scope;
that fixture classification is corrected rather than relaxing the assertion.
The four-window screenshot was visually inspected.

`pnpm exec prettier --check apps/modernjs-ssr-cache/console/src/routes/page.tsx apps/modernjs-ssr-cache/console/src/style.css apps/modernjs-ssr-cache/review.cy.cjs apps/modernjs-ssr-cache/host.cjs apps/modernjs-ssr-cache/start.cjs apps/modernjs-ssr-cache/README.md`
and `git diff --check` passed. The old SSR CI entry and unrelated package/framework
suites remain skipped because this changes the independent demo only; no runtime
package or dependencies changed.

### 观察局部更新与整体重建的宿主状态

“功能体验”里的 A、B 页面都展示服务端 loader 模块的初始化 ID、初始化时间、累计调用次数和 Host PID。ID 和计数存放在各入口 `page.data.ts` 的模块变量中，不依赖控制台、浏览器或 `globalThis`。计数统计 loader 调用，包括其他窗口、预热和实验请求，不代表成功渲染次数。

更新 Remote A 后，对比“B 入口 · 保留的旧页面”和“B 入口 · 新请求的页面”：静态 Host 的 B 初始化 ID 应保持一致、计数继续累计；动态 Host 整体重建后 B 初始化 ID 应变化、计数重新开始。两种更新都不应改变 PID。旧窗口保留的是首次请求的状态，切换 Host 或重新打开控制台会重新建立对比基准。

验证：`node apps/modernjs-ssr-cache/e2e.cjs` 通过（日志 `/tmp/modern-module-state.log`），Cypress 对新的 B 请求断言静态更新保留 ID 且计数增加、动态重建改变 ID、两种更新 PID 均不变。已检查页面截图。`pnpm exec prettier --check apps/modernjs-ssr-cache/host/src apps/modernjs-ssr-cache/dynamic-host/src apps/modernjs-ssr-cache/console/src/routes/page.tsx apps/modernjs-ssr-cache/review.cy.cjs apps/modernjs-ssr-cache/README.md`、`git diff --check` 通过。未运行旧 SSR CI 入口或无关包测试，因为本次只改独立 demo。

### 内存采样与逐轮更新

手动对比时，在“内存观察”先点击“GC 后采样”，再点击“更新 remote 到 v1/v2”。按钮更新所选 Host 的 Remote A，并让“手动内存对比的 SSR 页面”发起真实导航；看到新版本加载完成后再次点击“GC 后采样”，比较表格中的 Heap / RSS。按钮按当前版本切换到另一个版本，不自动采样。这里测量的是 Host 进程内存，不是 remote 文件或下载体积。

点击“运行 20 次更新”会启用可视模式：每轮等待 Remote 更新和 8 条 Node SSR 请求完成，再让 iframe 以唯一 URL 打开本轮页面。控制台收到 iframe 加载事件后向流量进程确认，页面至少展示 0.8 秒再进入下一轮，不会因为轮询遗漏而跳到最后一个版本。

页面保留“已完成 N / 20”、当前目标版本和逐轮记录。完整实验产生 20 次更新、160 条 Node SSR 请求及额外 20 次 iframe 导航；每 5 轮在 iframe 加载后执行 GC 并采样，共 4 次。加载事件表示导航完成，具体页面或错误响应原样呈现。请保持内存页打开；15 秒未收到确认会报告失败，不会假装完成剩余轮次。

命令行 HTTP 内存检查默认不启用可视模式，仍可在没有浏览器时运行原来的 20 次更新 / 160 条请求。两种模式请求数量不同，比较内存曲线时应使用同一模式。

验证：`node apps/modernjs-ssr-cache/e2e.cjs` 通过，日志 `/tmp/modern-memory-iframe.log`。Cypress 捕获了 20 个不同 URL 的 iframe 请求，全部返回 HTTP 200，HTML 中的版本按 v2/v1 交替，并验证 20 轮完成记录及最终水合。截图已检查。

`pnpm exec prettier --check apps/modernjs-ssr-cache/console/src/routes/page.tsx apps/modernjs-ssr-cache/start.cjs apps/modernjs-ssr-cache/traffic.cjs apps/modernjs-ssr-cache/review.cy.cjs apps/modernjs-ssr-cache/README.md` 和 `git diff --check` 通过。未运行旧 SSR CI 入口和无关框架测试：本次只修改独立 demo，不改变运行时包、依赖或原测试入口。
