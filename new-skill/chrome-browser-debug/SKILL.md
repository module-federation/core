---
name: chrome-browser-debug
description: Given a URL, navigate to it in the user's Chrome and capture browser diagnostics via Chrome DevTools Protocol — including console logs (errors/warns/info), JavaScript variable values, and network request details (status codes, payloads, failures). Use this skill whenever the user wants to inspect what's happening inside a browser page "frontend bugs, white screens, JS exceptions, API call failures, CORS errors, or wants to read a specific variable/state from the running page." Also trigger when user says things like "帮我看看报错", "页面崩了", "浏览器有错误", "前端报错了", "看看这个接口返回了什么", "帮我查一下这个变量的值". Always attempt to capture diagnostics before asking the user to copy-paste errors manually.
---

# chrome-browser-debug

Navigate to a URL in the user's running Chrome, collect all console logs and errors, return structured JSON for analysis.

Uses the user's existing Chrome session — cookies and auth state are preserved. Works for localhost and production URLs alike.

## Prerequisites

- **Node.js 21+** — required for built-in WebSocket
- **Chrome with remote debugging** — one-time setup, see `references/setup.md`

Chrome must be running with remote debugging enabled:

```bash
curl -s http://localhost:9222/json/version
```

If this fails, ask the user to relaunch Chrome with `--remote-debugging-port=9222`.

## Workflow

### Step 1 — Verify Chrome is reachable

```bash
curl -s http://localhost:9222/json/version
```

- Returns JSON → proceed
- Connection refused → follow `references/setup.md` to relaunch Chrome with remote debugging

### Step 2 — Capture

Choose mode based on whether interaction is needed:

- **No interaction needed** (just navigate + collect) → follow `references/single-capture.md`
- **Interaction needed** (click buttons, open modals, etc.) → follow `references/long-chain.md`

Performance defaults:
- 默认使用 `auto` 等待策略：交互步骤优先 `domcontentloaded`，仅在“交互后立刻抓变量/执行 eval”时等待 `networkidle`
- 对隐式 `networkidle` 增加等待上限，避免被长轮询页面拖满整个超时时间
- 用户只要变量/状态值时优先加 `--no-entries`

### Step 3 — Analyze the output

**Structure your analysis as:**
1. **Error summary** — count by level
2. **Critical errors first** — entries with stack traces, most recent first
3. **Patterns** — repeated errors or sequences pointing to root cause
4. **HTTP / network failures** — API issues, CORS, 404s
5. **Recommended fixes** — concrete, tied to specific log entries

### Step 4 — Offer follow-up

- Re-run with a longer timeout if logs seem cut off
- Re-run after the user takes a specific action to capture interaction errors

## Reference files

- `references/setup.md` — one-time Chrome setup
- `references/single-capture.md` — single capture usage + output format
- `references/long-chain.md` — long-chain usage (click, tabId, DOM dump)
