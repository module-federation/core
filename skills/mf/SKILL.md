---
name: mf
description: "All-in-one Module Federation skill. Use when the user asks anything about MF — concepts, configuration, runtime API, shared dependencies, type errors, runtime error code troubleshooting, observability/obs, slow builds, Bridge integration, or adding MF to an existing project."
argument-hint: <sub-command | natural-language-query> [args...]
allowed-tools: Read Glob Bash(node *) Bash(npx tsc*) Bash(npx mf dts*) Bash(curl *) WebFetch Write Edit AskUserQuestion
---

# MF — Module Federation All-in-One Skill

## Step 1: Identify the sub-skill

Parse `$ARGUMENTS` and map to a reference file in the `reference/` directory (same directory as this file):

| Sub-command (case-insensitive) | Aliases | Reference file |
|---|---|---|
| `docs` | `doc`, `help`, `?` | `reference/docs.md` |
| `context` | `ctx`, `info`, `status` | `reference/context.md` |
| `module-info` | `module`, `remote`, `manifest` | `reference/module-info.md` |
| `integrate` | `init`, `setup`, `add` | `reference/integrate.md` |
| `type-check` | `types`, `ts`, `dts` | `reference/type-check.md` |
| `shared-deps` | `shared`, `deps`, `singleton` | `reference/shared-deps.md` |
| `perf` | `performance`, `hmr`, `speed` | `reference/perf.md` |
| `config-check` | `config`, `plugin`, `exposes` | `reference/config-check.md` |
| `bridge-check` | `bridge`, `sub-app` | `reference/bridge-check.md` |
| `runtime-error` | `runtime-code`, `runtime-008`, `runtime-001`, `remote-entry` | `reference/runtime-error.md` |
| `observability` | `obs`, `observe`, `trace`, `traceId`, `report`, `observability`, `debug-loading`, `telemetry`, `runtime-007`, `moduleInfo`, `snapshot` | `reference/observability.md` |

**If no explicit sub-command is found**, detect intent from the full input:

If the input contains an observability report, `traceId`, console `read:` command,
`.mf/observability` file path, or asks how to observe, debug, trace, inspect, or
upload Module Federation loading data, or uses `obs` as shorthand for
observability, choose `reference/observability.md` even
when the same input also contains a `RUNTIME-xxx` code.

| Signal in input | Reference file |
|---|---|
| Question about MF concepts, API, configuration options | `reference/docs.md` |
| "integrate", "add MF", "setup", "scaffold", "new project" | `reference/integrate.md` |
| "type error", "TS error", "@mf-types", "dts", "typescript" | `reference/type-check.md` |
| "shared", "singleton", "duplicate", "antd", "transformImport" | `reference/shared-deps.md` |
| "slow", "HMR", "performance", "build speed", "ts-go" | `reference/perf.md` |
| "plugin", "asyncStartup", "exposes key", "config" | `reference/config-check.md` |
| "bridge", "sub-app", "export-app", "createRemoteAppComponent" | `reference/bridge-check.md` |
| "RUNTIME-001", "RUNTIME-008", "runtime error code", "remote entry load failed", "ScriptNetworkError", "ScriptExecutionError", "container missing", "window[remoteEntryKey]" | `reference/runtime-error.md` |
| "obs", "mf obs", "Observability report generated", "console.error", "traceId", "read:", "diagnosis", "ownerHint", "summary.phases", ".mf/observability", "build-report.json", "latest.json", "RUNTIME-007", "moduleInfo", "remote snapshot", "global snapshot", "snapshot match", "observability", "observe MF", "debug MF loading", "trace loading", "loading report", "open page and inspect MF", "visit URL and observe MF", "看下 MF 加载情况", "telemetry", "onReport", "onEvent", "production report", "upload observability" | `reference/observability.md` |
| "manifest", "remoteEntry URL", "module info", "publicPath" | `reference/module-info.md` |
| "context", "what is configured", "MF role", "bundler" | `reference/context.md` |

If still ambiguous, show the user the sub-command table above and ask them to pick.

## Step 2: Load and execute the reference

Read the matched file from the `reference/` directory (same directory as this SKILL.md).

Execute all instructions in that file, passing the remaining arguments (everything after the sub-command token, or the full `$ARGUMENTS` if intent-detected) as `ARGS`.
