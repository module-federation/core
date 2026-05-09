# Single Capture

Navigate to a URL, collect logs + variables, tab auto-closes.

## Usage

```bash
node ../scripts/browser-capture.mjs "<url>" [timeout_ms] [--vars var1,var2,...] [--wait-until auto|domcontentloaded|networkidle|timeout] [--action-wait auto|networkidle|domcontentloaded|timeout|none] [--no-entries]
```

Default `auto`:
- Navigation phase prefers `domcontentloaded` (interaction/variable capture scenarios); pure log collection falls back to `networkidle`
- When not explicitly specified, `networkidle` uses a shorter wait ceiling to avoid being slowed down by polling-heavy pages

Increase timeout for slow pages or heavy SPAs:
```bash
node ../scripts/browser-capture.mjs "https://example.com/dashboard" 30000
```

Capture JavaScript variables:
```bash
node ../scripts/browser-capture.mjs "https://example.com" 20000 --vars __FEDERATION__,__NEXT_DATA__,featureFlags
```

Capture deep path variables:
```bash
node ../scripts/browser-capture.mjs "https://example.com" 20000 --vars __VMOK__.__INSTANCES__,window.__APP_STATE__.user
```

Performance-first capture (skip heavy entries and avoid long waits):
```bash
node ../scripts/browser-capture.mjs "https://example.com" 12000 --vars __VMOK__.__INSTANCES__ --action-wait none --no-entries
```

## Output format

```json
{
  "url": "https://example.com/dashboard",
  "capturedAt": "2026-03-20T10:00:05.123Z",
  "actionWait": "networkidle",
  "timings": {
    "navigateMs": 1832,
    "clickMs": null,
    "fillMs": null,
    "selectMs": null,
    "evalMs": null,
    "varsMs": 42,
    "totalMs": 2051
  },
  "total": 42,
  "errors": 3,
  "warns": 5,
  "variables": {
    "__FEDERATION__": {
      "exists": true,
      "value": { "runtime": "webpack" },
      "skippedPaths": [
        { "path": "__FEDERATION__.snapshotHandler.HostInstance", "reason": "circular", "circularRef": "__FEDERATION__.snapshotHandler" },
        { "path": "__FEDERATION__.moduleCache.init", "reason": "function", "detail": "init" }
      ]
    },
    "__NEXT_DATA__": { "exists": false, "skippedPaths": [] }
  },
  "entries": [
    { "t": "2026-03-20T10:00:01.234Z", "level": "error", "msg": "Cannot read properties of undefined (reading 'user')", "stack": "https://example.com/assets/app.js:1:84231" },
    { "t": "2026-03-20T10:00:02.100Z", "level": "warn",  "msg": "[HTTP] 404 Not Found — https://api.example.com/user/profile", "stack": null }
  ]
}
```

## Performance tips

- When only checking variables, add `--no-entries` to avoid excessive log volume.
- When a stable selector is available, prefer an exact CSS selector to reduce click retries.

## Log levels captured

- `error` / `warn` / `log` / `info` / `debug` — from `console.*`
- `error` — uncaught JS exceptions (includes stack trace when available)
- `warn` / `error` — HTTP 4xx / 5xx responses
- `error` — network failures (CORS, DNS, connection refused)
- `warn` / `error` — browser-native entries (CSP violations, deprecations)

## Variable serialization

Non-serializable values are handled gracefully:
- Circular references → `[Circular -> path]`
- Functions → `[Function: name]`
- Depth > 5 → `[max depth]`
- `skippedPaths` records every property that could not be fully serialized
