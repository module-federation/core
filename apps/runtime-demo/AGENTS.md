# Runtime Demo Agent Guide

This directory has a local copy of the MF skill at `./skills/mf/SKILL.md`.
When the user asks about Module Federation loading, shared dependencies,
observability reports, trace IDs, or the runtime demo, read that skill first.
For the showcase flow, use `./skills/mf/reference/observability.md`.

## Showcase Task

Use this flow when the user asks you to inspect the shared dependency loading
state in the runtime demo:

1. Start the demo from the repository root:

```bash
pnpm run app:runtime:dev
```

2. Open:

```text
http://localhost:3005/observability-showcase
```

3. Confirm the page renders the profile widget. This first view is loaded with
   `createInstance` from `runtime_remote2/ProfileCard`.

4. Click `Open Analytics Workspace`.

5. Confirm the route changes to:

```text
http://localhost:3005/observability-showcase/analytics
```

6. Confirm the page shows a limited analytics view instead of crashing. Do not
   treat the page copy as the root cause. This second view first tries to load
   `runtime_remote2/AnalyticsPanel` with `createInstance`, then the
   observability report shows `observability-customer-sdk` failed because the
   route asks for `^3.0.0` but only `2.1.0` is available.

7. Read the browser observability reports:

```js
window.__FEDERATION__.__OBSERVABILITY__.runtime_host.getReports({ limit: 20 });
window.__FEDERATION__.__OBSERVABILITY__.runtime_host.findReports({
  remote: 'runtime_remote2',
});
window.__FEDERATION__.__OBSERVABILITY__.runtime_host.findReports({
  shared: 'react',
});
window.__FEDERATION__.__OBSERVABILITY__.runtime_host.findReports({
  shared: 'observability-customer-sdk',
});
```

8. Answer with:

- which consumer loaded `ProfileCard`
- which consumer loaded `AnalyticsPanel`
- whether `react` was resolved
- whether `observability-customer-sdk` failed
- which version was required and which version was available
- why the page did not crash and what limited view was rendered

## Suggested User Prompt

```text
启动项目，访问 http://localhost:3005/observability-showcase，
确认首屏远程组件是否加载成功。
然后点击 Open Analytics Workspace，看下共享依赖加载情况。

请说明：
1. 首屏加载了哪个生产者的哪个 expose
2. 点击后路由加载了哪个生产者的哪个 expose
3. 第二个 expose 使用了哪些 shared
4. 哪个 shared 加载失败了，原因是什么
5. 页面为什么没有崩溃，显示了什么降级视图
6. 观测报告里有哪些关键证据
```
