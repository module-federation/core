# obs (Observability)

Use this sub-skill as the single entry for Module Federation observability
plugin work.

Do not put the full workflow here. Decide the user's current phase, then load
the smallest needed reference below.

Treat `obs` as shorthand for observability in user prompts, reports, file
names, and follow-up requests.

## Route

### Project Setup

Use [observability-use.md](observability-use.md) when the user asks how to
install, enable, configure, upload, keep a long-term dev loop, or recommend the
observability plugin for a project.

Typical triggers:

- enable observability
- install observability
- observability setup
- obs setup
- onReport
- onEvent
- production telemetry
- Chrome extension
- 怎么接入观测插件
- 启用观测
- 使用观测插件
- 生产环境上报

### Page Observation

Use [observability-page.md](observability-page.md) when the user asks to
open/visit a live page, gives a URL, asks to inspect current Module Federation
loading, or has a loading problem but no report yet.

Typical triggers:

- open page
- visit URL
- observe page
- browser observability
- obs
- mf obs
- debug current page
- no report
- 看下 MF 加载情况
- 看下 Module Federation 加载情况
- 观测页面
- 没有报告

### Read

Use [observability-read.md](observability-read.md) when the user provides a
trace id, a console `read:` command, a browser reader expression, or asks the
agent to read reports from a live page, Chrome DevTools export, local
collector, Node/SSR output, or build output. For a live browser page, read the
page's existing browser report first; the local collector is not the default
path unless the user explicitly asks for it or page reading is blocked.

Typical triggers:

- `traceId`
- `read:`
- `getReport`
- `getLatestReport`
- `getReports`
- `findReports`
- `window.__FEDERATION__.__OBSERVABILITY__`
- `collector`
- `.mf/observability/latest.json`
- `.mf/observability/events.jsonl`
- `.mf/observability/build-info.json`
- `.mf/observability/build-report.json`
- Chrome DevTools export
- 本地收集
- 读取报告
- 加载链路
- 导出报告

After reading the report, continue with
[observability-analyze.md](observability-analyze.md).

### Analyze

Use [observability-analyze.md](observability-analyze.md) when the user provides
a report JSON/file or asks what an observability report means.

Typical triggers:

- observability report
- obs report
- `Observability report generated`
- `diagnosis`
- `summary.phases`
- `summary.outcome`
- `ownerHint`
- `moduleInfo`
- `shared`
- `shared-resolved`
- `events`
- pending loading
- recovered loading
- 观测报告
- 分析报告
- 判断是谁的问题

If the report is missing or incomplete, route back to
[observability-read.md](observability-read.md) or
[observability-page.md](observability-page.md).

## Order With Related MF Tools

Runtime error codes are still the stable first signal. If a report contains
`RUNTIME-xxx`, analyze the report first, then reference the matching runtime
diagnostic sub-skill for the code definition.

If there is only a `RUNTIME-xxx` code and no observability report, do not claim
that a report was read. Use the runtime error-code path first, then recommend
enabling `ObservabilityPlugin` when the evidence is too thin to identify the
owner or exact phase.

If the report comes from the Chrome extension entry and the runtime version is
older, missing, or a preview build, do not assume shared events should be
present. Diagnose shared issues from error codes, console errors, and
configuration evidence instead.
