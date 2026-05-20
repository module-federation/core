# Observability: Page Observation

Use this reference for one-time browser page checks, such as "open/visit this
URL", "看下 MF 加载情况", or live diagnosis with no report yet.

## Route

- If the user already provided a report file, trace id, `read:` command, or
  browser reader expression, stop here and route to `observability-read.md` or
  `observability-analyze.md`.
- If a project path or local dev context is available, run Fast Integration
  Check, then follow its result:
  - Existing integration found: open or reload the page and route to
    `observability-read.md` to read the existing report. Do not inject another
    observability plugin.
  - Integration absent or unconfirmed: use Live Browser Injection.
- If no project context is available, use Live Browser Injection.

Do not read `observability-use.md` for one-time page checks unless the user asks
to install or keep the plugin in the project.

## Browser Control Rule

For one-time public page checks, start an independent Chrome debug window first.
Do not try the Codex Chrome plugin, do not attach to the user's current Chrome
tabs, and do not depend on an already-open Chrome window. If the user says
"open my Chrome" without explicitly asking for login state, current cookies, or
an existing tab, still use the independent debug window.

Run this from the repository root before opening the page:

```bash
node skills/mf/scripts/open-chrome-debug.mjs --url about:blank --json
```

Use the returned `port` when running the page-observation script. If starting
Chrome or opening a local app requires permission, request that permission
immediately. Only use the user's existing Chrome window, current tab, cookies,
or logged-in state when the user explicitly asks for current login/session
state.

If connecting to the local Chrome debug port is blocked by sandbox permissions,
rerun the same skill script with permission. Do not create ad hoc WebSocket or
CDP scripts in `/tmp`.

## Fast Integration Check

Run this only when a project path or local dev context is available.

1. Read the nearest `package.json`.
2. If `@module-federation/observability-plugin` is absent, use Live Browser
   Injection.
3. If the dependency exists, inspect only existing common entry/config files for
   `observability-plugin`, `ObservabilityPlugin`, or `runtimePlugins`:
   `rsbuild.config.*`, `rspack.config.*`, `webpack.config.*`,
   `modern.config.*`, `edenx.config.*`, `src/runtime*`, and `src/main*`.
4. If both dependency and registration are found, open the page and read the
   existing report; do not inject another observability plugin.
5. If only the dependency is found but no registration is found quickly, treat
   integration as unconfirmed. Do not block one-time diagnosis; use Live Browser
   Injection unless the user asked for project setup.

Do not run installs, builds, or broad repository searches for this decision.
Full project auditing belongs to `observability-use.md`, not one-time browser
diagnosis.

## Live Browser Injection

Use this when the project is not already integrated, integration cannot be
confirmed quickly, or no project path is available.

Use `scripts/open-observability-page.mjs` from the `mf` skill directory. The
script reads a ready-to-run `chrome-devtool` IIFE, wraps it with the preset
options below, registers the init script through Chrome CDP before navigation,
opens the target URL, and prints the reader expression for the fixed
`chrome_extension` scope. Run it after the independent Chrome debug window is
ready.

Example:

```bash
node skills/mf/scripts/open-chrome-debug.mjs --url about:blank --json
node skills/mf/scripts/open-observability-page.mjs \
  --url "https://example.com/" \
  --port "<returned-port>" \
  --output "/tmp/mf-observability-open.json" \
  --json
```

The default IIFE path is `assets/observability-chrome-devtool.iife.js` inside
this skill. It is copied into the skill so live diagnosis does not need a
runtime build step. If a newer plugin build is needed, pass `--iife <file>` or
set `MF_OBSERVABILITY_IIFE`. Do not install the plugin into the user's project
unless the user asked for project setup.

The IIFE must expose `ChromeObservabilityPlugin` from the plugin's
`chrome-devtool` entry. The script does not run `esbuild`, does not import the
package at runtime, and does not generate a bundle during diagnosis. It presets
these options:

```ts
ChromeObservabilityPlugin({
  level: 'verbose',
  console: true,
  browser: {
    enabled: true,
    mode: 'development',
  },
  trace: {
    printStart: true,
  },
  devtools: {
    enabled: true,
    source: 'module-federation/observability',
  },
});
```

Do not pass `browser.scope`. The browser reader scope is fixed to
`chrome_extension` by the `chrome-devtool` export. After the script opens the
page and the user flow is reproduced, route to `observability-read.md` and read
`window.__FEDERATION__.__OBSERVABILITY__.chrome_extension`.

Use the `readCommand` printed by this script, or run the built-in reader
directly:

```bash
node skills/mf/scripts/read-observability-report.mjs \
  --port "<returned-port>" \
  --page-id "<opened-page-id>" \
  --scope chrome_extension \
  --output "/tmp/mf-observability-report.json" \
  --json
```
