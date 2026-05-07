# MF Loading Observability Roadmap

## 背景

Module Federation 的问题通常不是单点错误。一次加载可能同时经过 host 配置、remote 配置、manifest、remoteEntry、共享依赖、运行时插件和实际模块执行。现在的报错信息能给出错误码和部分上下文，但还不足以让人或 AI coding 快速判断问题属于哪一侧。

这个方案的终极目标不是把报错文案写长，而是让 MF 加载过程本身变得可观测。报错报告应当从加载过程记录中生成，而不是在抛错点临时拼接一段孤立信息。

## 目标

- 让每一次 MF 加载都能留下安全、结构化、可读取的加载记录。
- 让错误报告可以还原失败前后的关键路径。
- 让 AI coding 能基于同一份事实数据判断下一步应该查哪里。
- 让构建侧信息和运行时信息可以被关联起来分析。
- 在默认情况下不引入新的数据泄露风险或调试后门。

## 非目标

- 不自动上传诊断数据。
- 不采集业务数据、源码、远端响应内容、请求头、cookie 或 token。
- 不把 AI 判断作为运行时行为的一部分。
- 不让可观测逻辑影响 MF 正常加载结果。

## 第一原则：安全

所有可观测能力都必须遵守以下规则：

- 默认不开启详细采集。
- 默认不做公网回传。
- 浏览器侧默认只保存在当前实例或当前页面内存中。
- Node 侧只写本地诊断文件，且写入失败不能影响构建或运行。
- URL 必须脱敏，默认移除 query 和 hash。
- 禁止记录请求头、cookie、authorization、token、secret、session、完整请求参数。
- 禁止记录 remote 返回内容、源码、模块源码、用户输入和业务数据。
- 对外导出的报告必须是脱敏后的结果。
- 全局暴露能力必须最小化，不能把内部状态无边界挂到根对象上。
- 生产环境默认低噪声；详细诊断需要用户显式开启。

## 现状判断

当前已有一些基础：

- 统一错误码和文档链接。
- 部分运行时报错能携带 host 配置摘要。
- Node 侧可以写 `.mf/diagnostics/latest.json`。
- 部分 remoteEntry 加载错误已经区分了脚本加载失败、脚本执行失败、global 未注册。

主要不足：

- 浏览器侧没有稳定的结构化记录入口。
- 只记录最近一次错误，不保留加载时间线。
- 很多错误仍然只是字符串，无法自动判断责任方。
- 构建信息和运行时错误没有形成稳定关联。
- shared / eager / 版本匹配类问题缺少完整上下文。
- AI 需要事实数据，但现在多数信息只存在于错误字符串里。

## 总体设计

整体分三层。

### 1. 加载事件层

工程代码负责记录 MF 加载过程中的事实事件。事件只记录白名单字段。

典型事件：

- `loadRemote:start`
- `loadRemote:resolved`
- `loadRemote:success`
- `loadRemote:error`
- `manifest:fetch:start`
- `manifest:fetch:success`
- `manifest:fetch:error`
- `remoteEntry:load:start`
- `remoteEntry:load:success`
- `remoteEntry:load:error`
- `remoteEntry:init:start`
- `remoteEntry:init:success`
- `remoteEntry:init:error`
- `expose:get:start`
- `expose:get:success`
- `expose:get:error`
- `share:resolve:start`
- `share:resolve:success`
- `share:resolve:miss`
- `share:resolve:error`
- `loadRemote:complete`

事件字段建议：

- `traceId`
- `timestamp`
- `phase`
- `status`
- `hostName`
- `remoteName`
- `requestId`
- `expose`
- `shareName`
- `shareScope`
- `expectedVersion`
- `resolvedVersion`
- `provider`
- `sanitizedUrl`
- `remoteType`
- `entryGlobalName`
- `duration`
- `errorCode`
- `errorName`
- `errorMessage`
- `ownerHint`
- `startTime`
- `endTime`
- `cached`
- `attempt`
- `fallbackUsed`
- `resultSummary`

`ownerHint` 只能是工程规则给出的初步分类，例如：

- `host`
- `remote`
- `network`
- `manifest`
- `shared`
- `runtime-plugin`
- `unknown`

### 2. 诊断报告层

工程代码基于事件生成事实报告。报告不是 AI 生成的，它应当是确定性的、可测试的、可复现的。

报告包含：

- 本次加载的概要
- 加载时间线
- 加载结果
- 总耗时
- 失败阶段
- 原始错误
- 脱敏后的上下文
- 可能责任方
- 可执行的检查建议
- 关联的构建信息摘要

这里的“可能责任方”和“检查建议”应由工程规则生成，只能基于已记录事实，不允许猜测未采集的信息。

报告不只在失败时生成。成功加载也应当生成可选的 summary，用来回答：

- remote 是否加载成功。
- manifest 是否命中缓存。
- remoteEntry 是否重复使用已有 global。
- expose 是否获取成功。
- shared 最终命中了哪个提供方和版本。
- 是否走了 fallback 或 retry。
- 每个阶段耗时多少。
- 是否存在“成功但异常”的信号，例如耗时过长、版本命中不符合预期、使用了 fallback。

### 3. AI coding 消费层

AI 不负责生成事实报告。AI 负责读取工程报告，并基于报告做解释、归因、修复建议或代码修改。

推荐边界：

- 工程报告回答“发生了什么”。
- AI 分析回答“这通常意味着什么、下一步怎么修”。
- AI 输出必须引用报告里的事实，不应凭空补全缺失数据。

## 报告是 AI 生成还是工程生成

基础报告必须由工程手段生成。

原因：

- 工程生成的报告稳定、可测试、可在没有 AI 的环境里使用。
- 工程报告可以严格执行脱敏和字段白名单。
- 工程报告不会编造缺失信息。
- AI coding 需要的是可靠事实输入，而不是另一个不确定输出。

AI 可以在报告之上生成解释版报告，但它应该是第二层消费结果，不应该替代工程报告。

建议分成两类：

- 事实报告：工程生成，默认能力。
- 分析报告：AI 基于事实报告生成，可选能力。

## 只看记录的信息是否足够

只看原始事件记录不够。

原始记录是必要基础，但它通常太碎。人和 AI 都还需要一个归一化后的摘要，才能快速知道：

- 哪一步失败
- 失败前已经完成了哪些步骤
- 哪些信息缺失
- 应该优先检查 host、remote、网络、manifest 还是 shared

因此需要同时保留两种产物：

- 事件时间线：完整事实，用于深挖。
- 诊断报告：从时间线聚合出来，用于快速定位。

如果只保留报告，不保留事件，后续无法追溯细节。  
如果只保留事件，不生成报告，AI 和人都需要重复做整理工作。

## 加载结果可观测方案

可观测不是只收集报错。成功加载也需要记录，因为很多问题不会直接抛错，例如加载慢、使用了 fallback、命中了非预期 shared 版本、remoteEntry 被缓存复用、manifest 内容和 host 预期不一致。

### 成功事件要记录什么

成功事件应当记录：

- 本次 `traceId`。
- 请求的 `requestId`。
- 匹配到的 remote 名称。
- expose 名称。
- manifest URL 是否存在。
- manifest 是否 fetch 成功。
- manifest 是否来自缓存。
- remoteEntry URL。
- remoteEntry 类型。
- remoteEntry 是否新加载。
- remoteEntry 是否复用已有 global。
- remoteEntry init 是否完成。
- expose factory 是否获取成功。
- expose module 是否执行完成。
- shared 命中的 provider。
- shared 命中的版本。
- 是否使用 fallback。
- 是否发生 retry。
- 每个阶段耗时。
- 总耗时。
- 业务组件是否主动声明成功加载。

这些信息都必须是结构化字段，不能只写在字符串里。

### 成功报告

成功报告是加载链路的整理版，不是错误报告。它应包含：

- `traceId`
- `status: "success"`
- host 摘要
- remote 摘要
- expose 摘要
- shared 命中摘要
- 阶段耗时
- 是否缓存命中
- 是否 retry
- 是否 fallback
- 构建信息关联摘要

成功报告默认不一定需要 console 输出。建议由插件配置控制：

- `level: "error"` 只在失败时生成详细报告。
- `level: "summary"` 记录成功摘要和失败报告。
- `level: "verbose"` 记录完整成功和失败时间线。

### 成功但需要关注的信号

插件可以基于工程规则标记 warning，但不能改变加载结果：

- remoteEntry 加载耗时超过阈值。
- manifest 加载耗时超过阈值。
- 使用了 retry 后才成功。
- 使用了 fallback。
- shared 命中 provider 与预期不一致。
- shared 命中版本低于推荐版本。
- remote manifest 的 buildVersion 与预期不一致。
- expose 成功但来自非预期 remote。

这些 warning 应进入报告，供 AI 判断是否需要继续排查。

### AI 如何使用成功记录

AI 看到成功记录后，可以回答：

- 当前 MF 加载链路是否完整成功。
- 慢在 manifest、remoteEntry、init、shared 还是 expose。
- shared 实际用了谁。
- remote 是否来自预期地址和构建版本。
- 是否存在 fallback / retry / cache 复用。

因此，AI coding 不只在报错时使用诊断文件，也可以在“页面能跑但行为不对”时读取最近一次成功 trace。

### 业务组件成功加载事件

runtime-core 和 diagnostics plugin 可以自动判断技术层成功，但不能判断业务组件是否真正完成业务加载。因此需要给业务暴露一个固定接口，由业务组件在合适时机主动调用。

固定事件名：

- `component:business-loaded`

固定语义：

- 业务组件已经完成自身定义的成功加载。
- 这个事件由业务代码主动触发。
- 这个事件不是 React mount，也不是 expose factory 执行成功。
- 业务可以自定义什么时候调用，但事件名和基础字段必须固定。

建议 API：

```ts
diagnostics.markComponentLoaded({
  traceId,
  requestId: 'remote/Button',
  componentName: 'Button',
});
```

事件字段：

- `traceId`
- `requestId`
- `componentName`
- `phase: "component"`
- `eventName: "component:business-loaded"`
- `status: "success"`
- `timestamp`
- `source: "business"`

可选扩展字段：

- `reason`
- `duration`
- `metadata`

安全限制：

- `metadata` 必须经过用户自定义 sanitize。
- 不记录 props。
- 不记录接口响应体。
- 不记录用户输入。
- 不记录业务数据明细。

AI 看到这个事件后，才能判断：

- MF 技术加载成功。
- 组件挂载或渲染链路已完成。
- 业务组件声明自己已成功加载。

如果没有这个事件，AI 只能说“技术加载成功，但业务组件是否成功加载未声明”。

## 安全数据策略

允许记录：

- host 名称
- remote 名称
- expose 请求名
- shared 包名
- shared 版本约束
- 实际命中的 shared 版本
- remoteEntry 类型
- entryGlobalName
- 脱敏后的 URL
- 错误码
- 错误名称
- 脱敏后的错误消息
- 阶段耗时

禁止记录：

- cookie
- request headers
- authorization
- token
- secret
- session
- 完整 query
- hash
- remote 响应体
- 源码
- 模块执行结果
- 用户业务数据

URL 脱敏规则：

- 保留 protocol、host、pathname。
- 默认删除 query 和 hash。
- 对常见敏感字段做兜底过滤。
- 如果 URL 无法解析，按字符串做保守清洗。

## 能力形态和输出入口

可观测能力应以 runtime plugin 形式提供，形态类似 `@module-federation/retry-plugin`。runtime-core 只提供必要 hook、事件上下文和安全策略，不内置完整收集器，也不默认保存诊断数据。

建议新增独立插件：

- `@module-federation/diagnostics-plugin`

使用方式：

```ts
import { createInstance } from '@module-federation/runtime';
import { DiagnosticsPlugin } from '@module-federation/diagnostics-plugin';

const diagnostics = DiagnosticsPlugin({
  level: 'error',
  maxEvents: 100,
  onReport(report) {
    // 用户自行接入日志、监控或 AI coding 工具
  },
});

const mf = createInstance({
  name: 'host',
  remotes: [],
  plugins: [diagnostics.plugin],
});

diagnostics.getLatestReport();
diagnostics.getEvents();
```

### 输出从哪里拿

插件应提供多种可选输出入口，默认只在内存中保存：

- 插件 controller：`diagnostics.getEvents()`、`diagnostics.getLatestReport()`、`diagnostics.clear()`。
- 回调：`onEvent(event)`、`onReport(report)`。
- Node 本地文件：通过 `@module-federation/diagnostics-plugin/node` 的 `DiagnosticsPlugin` 显式开启后写 `.mf/diagnostics/events.jsonl` 和 `.mf/diagnostics/latest.json`。
- 浏览器只读全局入口：只有显式开启后才暴露，例如 `globalThis.__FEDERATION__.__DIAGNOSTICS__`。
- thrown error 附带最小报告 id 或摘要，但不把完整报告塞进错误字符串。

构建插件注入 runtime plugin 的场景不能拿到外部 controller，因此主要依赖 `onReport`、Node 文件或显式全局入口。

### AI 自动感知和读取流程

目标是让 AI coding 尽量不依赖用户手动复制完整报错。插件应在安全前提下给 AI 一个稳定的发现信号，再提供可读取的脱敏报告。

Node / SSR / build 场景：

- MF 加载失败时，console 打印固定格式的诊断提示。
- 提示中包含 `traceId` 和诊断文件路径。
- 插件写入 `.mf/diagnostics/latest.json`。
- 插件追加 `.mf/diagnostics/events.jsonl`。
- AI 从终端输出识别 `traceId`。
- AI 读取 `latest.json`。
- 如果 `latest.json` 不够，再按 `traceId` 去 `events.jsonl` 查完整事件时间线。

推荐 console 格式：

```txt
[Module Federation] Diagnostic report generated
traceId: mf-trace-xxx
latest: .mf/diagnostics/latest.json
events: .mf/diagnostics/events.jsonl
```

浏览器 dev 场景：

- MF 加载失败时，console 打印固定格式的诊断提示。
- AI 可以通过 CDP 或浏览器调试能力监听 console。
- 如果启用了只读全局入口，AI 可以按 `traceId` 调用 `getReport(traceId)`。
- 如果没有启用全局入口，console 只提示用户如何导出脱敏报告。

推荐 console 格式：

```txt
[Module Federation] Diagnostic report generated
traceId: mf-trace-xxx
Run: __FEDERATION__.__DIAGNOSTICS__.getReport("mf-trace-xxx")
```

浏览器 prod 场景：

- 默认不暴露全局报告入口。
- 默认不写浏览器持久存储。
- console 只输出最小错误码、`traceId` 和安全提示。
- 完整报告只能通过用户显式开启的导出接口、`onReport` 上传到用户自己的系统，或用户主动导出。
- AI 不应绕过页面安全边界读取完整报告。

prod 推荐 console 格式：

```txt
[Module Federation] Diagnostic report available
traceId: mf-trace-xxx
Ask the application owner to export the sanitized diagnostic report.
```

### 诊断文件分工

`.mf/diagnostics/latest.json` 是最近一次诊断报告。它是给人和 AI 快速读取的整理版结构，应包含：

- `traceId`
- host 摘要
- remote 摘要
- 失败阶段
- 错误码
- 初步责任方
- 脱敏后的关键上下文
- 建议检查项

`.mf/diagnostics/events.jsonl` 是完整事件流水。一行一个 JSON，用来保存多次加载、多阶段事件和同一 `traceId` 下的完整时间线。

AI 默认读取顺序：

- 先读 `latest.json`。
- 如果需要更多细节，再用 `traceId` 过滤 `events.jsonl`。

### runtime-core 需要补什么

runtime-core 只补底层能力：

- 增加或复用最小生命周期 hook，例如 `afterLoadRemote`、`afterLoadEntry`、`afterLoadShare`、`errorLoadShare`。
- 在主流程关键阶段暴露开始、成功、失败这类事实。
- 给 hook 补齐必要的基础上下文，例如 `requestId`、`remoteInfo`、`shareInfo`。
- 不在 runtime-core 里计算版本不匹配、missing provider、eager 边界这类诊断原因。
- 对有返回值语义的 hook 采用“未返回内容即不干预”的规则，让诊断插件可以安全旁听 `onLoad`、`errorLoadRemote` 这类已有 hook。
- 保证没有 diagnostics plugin 时行为完全不变。

runtime-core 不负责：

- 持久化报告。
- 对外暴露全局调试对象。
- 上传诊断数据。
- 生成 AI 分析结论。
- 保存完整事件历史。
- 组装 shared 诊断报告字段。

### 插件负责什么

diagnostics plugin 负责：

- 是否启用收集。
- 事件过滤级别。
- URL、错误消息和 stack 脱敏。
- 事件缓存上限。
- 报告聚合。
- 从 `beforeRequest`、`onLoad`、`afterLoadRemote`、`errorLoadRemote` 旁听 remote 加载开始、成功、失败和结束，且不返回内容。
- 从 `loadEntry`、`afterLoadEntry`、snapshot resolve hook 旁听 manifest、remoteEntry 这些阶段。
- 从 runtime hook 的基础上下文推导 shared / eager 具体原因。
- 输出到 callback、controller、Node 专用入口文件或显式全局入口。
- 用户自定义 sanitize 规则。

诊断插件可以注册 `errorLoadRemote` 这类已有 hook 做旁听，但必须遵守“不返回内容，不参与恢复”的约束。这样既能复用已有 hook，也不会影响 `@module-federation/retry-plugin` 或用户插件返回兜底结果。`loadEntryError`、`fetch` 这类更贴近重试控制的 hook 暂时不由 diagnostics plugin 接管。

`errorLoadShare` 目前只作为 shared 诊断观察 hook，不默认接入 retry-plugin。shared miss、版本不匹配、eager 边界通常不是临时网络错误，默认重试容易掩盖真实配置问题。后续如果要支持 shared retry，应该作为独立可选能力，由用户明确指定可重试条件。

## 安全配置和插件配置

不建议把所有可观测选项都放进 runtime-core 顶层 `observability`。更合理的边界是：

- `security.diagnostics`：安全策略，由 runtime-core 识别，作为所有诊断插件必须遵守的上限。
- `DiagnosticsPlugin(options)`：通用功能配置，由插件控制收集、内存输出、回调和浏览器显式读取。
- `@module-federation/diagnostics-plugin/node` 的 `DiagnosticsPlugin(options)`：Node 专用入口，额外提供本地文件输出。

建议的 `security.diagnostics`：

```ts
createInstance({
  name: 'host',
  security: {
    diagnostics: {
      enabled: false,
      console: true,
      browserGlobal: false,
      fileOutput: false,
      redactUrlQuery: true,
      redactUrlHash: true,
      maxErrorStackLines: 5,
      maxEvents: 100,
      redactKeys: ['token', 'secret', 'authorization', 'cookie', 'session'],
    },
  },
  plugins: [DiagnosticsPlugin()],
});
```

建议的插件配置：

```ts
DiagnosticsPlugin({
  level: 'error',
  maxEvents: 100,
  console: true,
  browser: {
    enabled: false,
    scope: 'host',
  },
  onReport(report) {},
});
```

建议的 Node 插件配置：

```ts
import { DiagnosticsPlugin } from '@module-federation/diagnostics-plugin/node';

DiagnosticsPlugin({
  level: 'error',
  maxEvents: 100,
  console: true,
  directory: '.mf/diagnostics',
  onReport(report) {},
});
```

规则：

- `security.diagnostics` 是上限，插件不能绕过。
- 插件可以选择更严格，但不能比 `security.diagnostics` 更宽。
- 如果 `security.diagnostics.enabled` 为 `false`，插件可以不收集，或只保留最小错误摘要。
- 如果 `browserGlobal` 为 `false`，插件不能暴露全局读取入口。
- 如果 `fileOutput` 为 `false`，插件不能写诊断文件。

这样既能满足用户选择性添加和定制，也能保证安全边界由核心配置统一约束。

## 运行时报错信息收集方案

运行时报错信息收集不是简单保存 `Error.message`。它需要把错误发生时的加载阶段、调用上下文和已知配置一起保存下来。

### 收集入口

第一批应覆盖这些入口：

- `loadRemote`
- `getRemoteModuleAndOptions`
- `getRemoteEntry`
- `loadEntryScript`
- `loadEntryNode`
- `Module.getEntry`
- `Module.init`
- `Module.get`
- `SharedHandler.loadShare`
- `SharedHandler.loadShareSync`
- `SharedHandler.initializeSharing`
- `SnapshotHandler.getManifestJson`

这些入口覆盖了 remote 解析、manifest 获取、remoteEntry 加载、remote 初始化、expose 获取和 shared 解析。

### 运行时报错事件字段

运行时报错事件应当至少包含：

- `traceId`
- `eventId`
- `timestamp`
- `phase`
- `status: "error"`
- `hostName`
- `hostId`
- `requestId`
- `remoteName`
- `remoteAlias`
- `remoteType`
- `entryGlobalName`
- `sanitizedUrl`
- `expose`
- `shareName`
- `shareScope`
- `requiredVersion`
- `availableVersions`
- `selectedVersion`
- `provider`
- `from`
- `lifecycle`
- `errorCode`
- `errorName`
- `errorMessage`
- `errorStack`
- `ownerHint`
- `retryable`

`errorStack` 默认只保留当前错误栈的前几行，并且必须经过脱敏。生产环境可以只保留 `errorName` 和 `errorMessage`。

### 错误分类规则

工程侧应提供确定性的分类规则：

- `RUNTIME-001`: remoteEntry 已加载但未注册到预期 global，优先指向 remote 产物或 `entryGlobalName` 配置。
- `RUNTIME-002`: remoteEntry 接口不完整，优先指向 remote 产物。
- `RUNTIME-003`: manifest 获取或解析失败，优先指向 manifest 地址、网络、manifest 内容结构。
- `RUNTIME-004`: host 无法匹配 remote，优先指向 host remotes 配置或请求 id。
- `RUNTIME-005`: 构建运行时同步消费 shared 失败，优先指向 eager / async boundary / shared 配置。
- `RUNTIME-006`: 纯运行时同步消费 shared 失败，优先指向调用方式或 shared 未就绪。
- `RUNTIME-008`: remoteEntry 资源加载失败，继续细分为 timeout、network、script execution、unknown。
- `RUNTIME-011`: manifest 中缺 remoteEntry URL，优先指向 remote manifest 产物。
- `RUNTIME-012`: shared getter 不可用，优先指向 `shared.import: false` 和 host 未提供对应依赖。

### 运行时报告生成

当错误发生时，工程代码应做三件事：

- 记录一条脱敏后的 `error` 事件。
- 把错误事件和同一 `traceId` 的前序事件聚合成事实报告。
- 保留现有错误码、错误文案和文档链接，避免破坏用户已有排查路径。

报告里不要写“AI 判断”。报告只写工程规则能确认的事实和初步分类。

### 存储策略

浏览器侧：

- 默认不启用。
- 启用后保存在实例内存中。
- 只有 `exposeGlobal: true` 时才暴露只读入口。
- 不写 localStorage、sessionStorage、IndexedDB。

Node 侧：

- 默认不启用详细事件。
- 启用后可以写 `.mf/diagnostics/events.jsonl` 和 `.mf/diagnostics/latest.json`。
- 文件写入失败不能影响运行。
- 文件内容必须脱敏。

## 构建信息收集方案

构建信息的目标不是记录完整构建产物，而是生成一份可以和运行时报错关联的最小摘要。

### 收集来源

第一批应从这些位置收集：

- Module Federation 插件原始配置摘要。
- manifest 输出。
- stats 输出。
- normalized remotes。
- normalized shared。
- exposes 映射。
- remoteEntry 文件名和类型。
- plugin version。
- bundler name。
- build version。

### 构建信息字段

构建摘要建议包含：

- `buildId`
- `name`
- `bundler`
- `pluginVersion`
- `buildVersion`
- `remoteEntry`
- `remoteEntryType`
- `publicPathMode`
- `remotes`
- `exposes`
- `shared`
- `manifestFile`
- `statsFile`

`shared` 只保留诊断必要字段：

- `name`
- `version`
- `requiredVersion`
- `singleton`
- `strictVersion`
- `eager`
- `shareScope`
- `import`

`remotes` 只保留：

- `name`
- `alias`
- `entry`
- `type`
- `shareScope`

`exposes` 只保留 expose key 和脱敏后的请求摘要，不记录源码内容。

### 禁止收集的构建信息

- 本地绝对路径。
- 环境变量。
- 源码内容。
- loader 完整参数。
- 插件完整 options 对象。
- 远端响应内容。
- 带 token 的 URL。
- 私有 registry token。

如果必须保留路径用于定位，只能保留相对项目根的路径，并需要确认不会泄露用户目录或内部机器信息。

### 构建信息产物

建议新增一个脱敏构建摘要产物：

- `.mf/diagnostics/build-info.json`

它应当可以由构建插件生成，也可以从 manifest / stats 中还原。生成失败不能影响构建。

运行时报错报告可以通过以下字段关联构建信息：

- host `name`
- remote `name`
- `buildVersion`
- `pluginVersion`
- `remoteEntry`
- manifest `id`

### 构建和运行时关联方式

运行时加载 remote 时，优先从 manifest 获取 remote 构建摘要。如果没有 manifest，只记录 remoteEntry 层面的摘要。

关联规则：

- host 侧报告记录 host 构建摘要。
- remote manifest 可用时，报告记录 remote 构建摘要。
- shared 报错时，报告同时列出 host 提供摘要和 remote 需求摘要。
- expose 报错时，报告关联 remote manifest 中的 exposes 摘要。

这样 AI coding 可以判断：

- host 是否配置了这个 remote。
- remote manifest 是否声明了这个 expose。
- host 和 remote 的 shared 版本条件是否能匹配。
- 运行时加载的 remoteEntry 是否来自预期构建。

## Roadmap

### Milestone 1: 前置任务，诊断验证 Demo 和最小闭环

状态：已完成。当前 demo、最小插件、运行时 hook、输出入口和验证测试已经形成第一阶段闭环。

这一步要先于完整能力建设。它的目标不是做展示页面，而是先建立一个稳定、可重复的验证场景，保证后续每一次加事件、加报告字段、加插件输出，都能在同一套 demo 和测试里验证成功、失败和脱敏结果。

实现边界：runtime-core 只负责主流程生命周期 hook，例如 remote 加载成功、失败、manifest / remoteEntry 基础状态和 shared 成功、失败；diagnostics plugin 负责整理事件、推导具体原因和最终加载结论，并输出报告。

#### Demo 验证场景

- [x] 新增或复用现有 runtime demo，建立一组专用 diagnostics host / remote 场景。
- [x] demo 支持正常加载 remote 组件，并能触发成功加载事件。
- [x] demo 支持 remoteEntry / manifest 地址错误场景。
- [x] demo 支持 remoteEntry globalName 或 expose 不存在场景。
- [x] demo 支持业务组件主动上报 `component:business-loaded`。
- [x] demo 支持 shared miss、shared 版本不匹配、eager 配置错误场景。
- [x] demo 提供稳定的按钮、路由或测试入口，方便 e2e 自动触发。
- [x] demo 默认不暴露诊断信息，只有显式开启 diagnostics plugin 时才输出。
- [x] demo 输出必须经过 URL 和错误信息脱敏。
- [x] demo 作为后续 Phase 的固定验收入口，不为单个实现临时造一次性测试。

#### 最小能力闭环

- [x] 定义最小 `security.diagnostics` 配置和默认关闭行为。
- [x] 定义最小事件数据结构。
- [x] 定义最小报告数据结构。
- [x] 在 runtime-core 增加最小 lifecycle hook 和必要上下文。
- [x] 新增最小 `DiagnosticsPlugin`，先只支持内存输出和回调输出。
- [x] 记录 `loadRemote` 成功和失败。
- [x] 记录 manifest 获取成功和失败。
- [x] 记录 remoteEntry 加载成功和失败。
- [x] 生成最近一次 in-memory report。
- [x] dev / Node 场景输出固定 console 提示，包含 `traceId`。
- [x] 确认没有 diagnostics plugin 时现有行为完全不变。
- [x] 确认 diagnostics 自身异常不会影响 MF 加载。
- [x] 补充默认关闭、显式开启、URL 脱敏、成功 trace、失败 trace / report 的测试。

#### Milestone 1 完成标准

- [x] demo 能稳定跑通一次成功加载。
- [x] demo 能稳定复现至少一种 remoteEntry / manifest 加载失败。
- [x] 成功和失败都能生成可读取的脱敏 report。
- [x] AI 或人能从 console 中拿到 `traceId`，再读取对应 report。
- [x] 默认不启用 diagnostics 时，demo 和现有测试行为不变。
- [x] 这一步完成后，再进入后续 Phase 0 - Phase 10 的完整能力建设。

### Phase 0: 安全边界和数据模型

- [ ] 定义 `security.diagnostics` 安全策略和默认值。
- [ ] 定义 `DiagnosticsPlugin` 插件配置和默认值。
- [ ] 定义事件字段白名单。
- [ ] 定义 URL 和错误消息脱敏规则。
- [ ] 定义事件时间线数据结构。
- [ ] 定义诊断报告数据结构。
- [ ] 定义运行时报错事件数据结构。
- [ ] 定义构建信息摘要数据结构。
- [ ] 明确浏览器和 Node 的存储边界。
- [ ] 明确运行时报错和构建信息的字段白名单。
- [ ] 明确运行时报错和构建信息的禁止字段。
- [ ] 明确插件配置不能绕过 `security.diagnostics`。
- [ ] 补充默认不开启、开启后脱敏的测试。

### Phase 1: runtime-core 事件 hook 底座

- [x] 在 runtime-core 中增加最小 lifecycle hook，供插件旁听主流程状态。
- [x] 复用 `onLoad`、`errorLoadRemote`，供 diagnostics plugin 观察 remote 加载，不影响 retry / fallback。
- [x] 给关键 hook 补齐 `phase`、`requestId`、`remoteInfo`、`shareInfo` 等必要上下文。
- [x] 记录 `loadRemote` 开始、成功、失败。
- [x] 记录 `loadRemote` complete 事件，用于统一收口成功和失败。
- [ ] 记录 remote 匹配结果。
- [x] 记录 manifest 获取开始、成功、失败。
- [x] 记录 remoteEntry 加载开始、成功、失败。
- [ ] 记录 remoteEntry init 开始、成功、失败。
- [ ] 记录 expose 获取开始、成功、失败。
- [ ] 记录阶段耗时和总耗时。
- [x] 记录 cache、retry、fallback 的基础结果标记。
- [x] 确认没有 diagnostics plugin 时行为完全不变。
- [x] 确认 lifecycle hook 失败不会影响 MF 加载。
- [x] 确认 diagnostics plugin 旁听 `errorLoadRemote` 时不接管返回路径。
- [x] 补充 runtime-core 单测。

### Phase 2: diagnostics plugin 输出能力

- [x] 新建 `@module-federation/diagnostics-plugin`。
- [x] 提供插件 controller：`getEvents()`、`getLatestReport()`、`clear()`。
- [x] 提供 `onEvent` 和 `onReport` 回调。
- [x] 支持内存输出。
- [x] 通过 Node 专用入口支持显式开启的 Node 本地文件输出。
- [x] 支持显式开启的浏览器只读全局入口。
- [x] 确认插件输出受 `security.diagnostics` 约束。
- [x] 补充插件配置和输出单测。

### Phase 3: 加载成功信息收集

- [x] 收集加载成功 summary。
- [ ] 收集 manifest 成功、缓存命中和耗时。
- [ ] 收集 remoteEntry 成功、新加载或复用已有 global。
- [ ] 收集 remoteEntry init 成功和耗时。
- [ ] 收集 expose factory 获取成功和耗时。
- [ ] 收集 expose module 执行成功和耗时。
- [ ] 收集 shared 命中的 provider、版本和 shareScope。
- [ ] 收集 retry / fallback / cache 标记。
- [x] 定义固定事件 `component:business-loaded`。
- [x] 提供 `markComponentLoaded` 业务调用接口。
- [x] 将业务组件成功加载事件关联到同一 `traceId`。
- [ ] 确认业务 metadata 经过 sanitize 后才能进入报告。
- [ ] 支持 `level: "summary"` 和 `level: "verbose"` 的成功记录策略。
- [x] 补充成功链路单测。

### Phase 4: 运行时报错信息收集

- [ ] 接入统一运行时报错事件记录。
- [ ] 收集错误码、错误名称、脱敏错误消息。
- [ ] 收集当前加载阶段和生命周期。
- [ ] 收集 host、remote、requestId、expose、shared 摘要。
- [ ] 对错误栈做脱敏和长度限制。
- [ ] 为 `RUNTIME-001` 增加 remoteEntry global 相关上下文。
- [ ] 为 `RUNTIME-003` 增加 manifest URL、remote 名称、解析阶段上下文。
- [ ] 为 `RUNTIME-004` 增加 host remotes 摘要和请求 id。
- [ ] 为 `RUNTIME-008` 增加 timeout、network、script execution 分类。
- [ ] 确认错误收集失败不会覆盖原始错误。
- [ ] 补充运行时报错收集单测。

### Phase 5: shared / eager 可观测

- [x] 记录 shared 解析开始。
- [x] 记录 host 当前提供的 shared 摘要。
- [x] 记录最终命中的 shared 提供方和版本。
- [x] 记录 shared miss。
- [x] 记录 eager 相关同步加载失败。
- [x] 标记 shared 问题的初步责任方。
- [x] 确认 `errorLoadShare` 只做诊断观察，不默认接入 retry-plugin。
- [x] 补充 shared、eager、strictVersion、singleton 场景测试。

### Phase 6: 构建信息收集

- [ ] 从构建插件配置生成脱敏配置摘要。
- [ ] 从 manifest / stats 生成脱敏构建摘要。
- [ ] 收集 bundler name、plugin version、build version。
- [ ] 收集 remoteEntry 文件名、类型和 publicPath 模式。
- [ ] 收集 remotes 摘要。
- [ ] 收集 exposes 摘要。
- [ ] 收集 shared 摘要。
- [ ] 生成 `.mf/diagnostics/build-info.json`。
- [ ] 确认构建信息生成失败不影响构建。
- [ ] 补充构建信息脱敏测试。

### Phase 7: 构建信息和运行时关联

- [ ] 在 manifest / stats 中确认已有字段是否足够。
- [ ] 补齐必要的 shared、exposes、remotes、插件版本、构建版本摘要。
- [ ] 运行时报告关联 remote manifest 信息。
- [ ] 构建侧错误也输出同一类诊断报告。
- [ ] shared 报错时同时展示 host 提供摘要和 remote 需求摘要。
- [ ] expose 报错时关联 remote manifest exposes 摘要。
- [ ] remoteEntry 报错时关联 remoteEntry 类型、globalName 和构建版本。
- [ ] 避免把本地绝对路径、源码、环境变量写入可导出报告。

### Phase 8: 报告生成

- [x] 从 trace 生成成功 summary。
- [ ] 从 trace 生成事实报告。
- [ ] 将现有 RUNTIME 错误接入报告。
- [ ] 将 `RUNTIME-001` 报告关联 remoteEntry globalName。
- [ ] 将 `RUNTIME-003` 报告关联 manifest URL 和 remote 名称。
- [ ] 将 `RUNTIME-004` 报告关联 host remotes 列表摘要。
- [ ] 将 `RUNTIME-005` / `RUNTIME-006` 报告关联 shared 和 eager 信息。
- [ ] 将 `RUNTIME-008` 报告区分网络、超时、执行失败。
- [ ] 保留原始错误码和现有文档链接。

### Phase 9: AI coding 入口

- [ ] 提供稳定的读取入口。
- [x] Node / SSR / build 场景输出固定格式 console 提示。
- [x] Node / SSR / build 场景写入 `.mf/diagnostics/latest.json`。
- [x] Node / SSR / build 场景追加 `.mf/diagnostics/events.jsonl`。
- [x] 浏览器 dev 场景输出可被 CDP 识别的固定格式 console 提示。
- [x] 浏览器 dev 场景支持显式开启的只读全局入口。
- [ ] 浏览器 prod 场景默认只输出最小错误码和 `traceId`。
- [ ] 浏览器 prod 场景完整报告只允许通过显式导出或用户自有系统获取。
- [ ] 明确 `latest.json` 和 `events.jsonl` 的格式和读取顺序。
- [x] 提供最近一次加载报告。
- [ ] 提供最近 N 次加载报告。
- [x] 支持按 `traceId` 读取成功或失败报告。
- [ ] 支持按 remote / expose / shared 查询最近加载记录。
- [ ] 提供脱敏导出方法。
- [x] Node 侧通过 Node 专用入口支持本地诊断文件。
- [x] 浏览器侧支持显式开启的内存读取。
- [ ] 给 AI 消费格式写示例。

### Phase 10: 文档和场景验证

- [ ] 文档说明如何开启安全可观测。
- [ ] 文档说明导出的报告不包含哪些敏感信息。
- [ ] 增加成功加载场景。
- [ ] 增加成功但 retry 后恢复场景。
- [ ] 增加成功但 fallback 生效场景。
- [ ] 增加成功但 shared 命中非预期 provider 场景。
- [x] 增加业务主动标记 `component:business-loaded` 场景。
- [ ] 增加 remote URL 错误场景。
- [ ] 增加 remoteEntry globalName 错误场景。
- [ ] 增加 manifest 缺字段场景。
- [ ] 增加 remoteEntry 自身执行错误场景。
- [ ] 增加 host 未提供 shared 场景。
- [ ] 增加 shared 版本不满足场景。
- [ ] 增加 eager 配错场景。

## 第一批建议落地范围

第一批就是 Milestone 1，不直接做完整闭环。

优先顺序是：

- 先做 diagnostics demo，确保后续改动都有固定验证入口。
- 再做最小安全配置、最小事件、最小报告和最小插件输出。
- 先覆盖 remote / manifest / remoteEntry 的成功和失败。
- 先保证默认关闭、显式开启、URL 脱敏、记录失败不影响加载。

第一批完成后，再接 shared / eager、构建信息关联、浏览器生产环境导出等更完整能力。这样可以先把可验证底座稳定下来，避免一开始把诊断逻辑和所有错误点耦合在一起。

## 验收标准

- 默认不开启时，现有行为不变。
- 有固定 demo 可以验证后续诊断能力。
- 开启后可以读取脱敏后的加载事件。
- 成功加载时可以读取加载 summary。
- 失败报告可以指出失败阶段。
- 报告不包含 query、hash、header、cookie、token、源码、remote 响应体。
- trace 逻辑异常不会影响 MF 加载。
- runtime-core 相关测试通过。
- 构建通过。
