# Module Federation Chrome Devtools

## Ability

- Proxy online Module Federation remote module to local
- Let proxied remote module get hmr
- Inject the Chrome-specific observability runtime plugin from the Loading Trace
  tab, receive page events through `window.postMessage`, and export collected
  loading reports

https://module-federation.io/

## Embedded browsers without extension side panels

Build the popup variant from the repository root:

```sh
pnpm --filter @module-federation/devtools run build:devtool:popup
```

Load `packages/chrome-devtools/dist` as an unpacked extension in the embedded
browser. Replace or reload any previously loaded build, then reload the page
you want to inspect so the content scripts run. Click the extension icon while
that page is active to open the devtools popup.

This build omits the `sidePanel` permission, `side_panel`, and `devtools_page`.
It still requires Manifest V3 content scripts, a background service worker,
`storage`, `tabs`, and `scripting` APIs. Compatibility depends on the host browser's
implementation of those APIs. The popup closes when it loses focus; reopen it
from the target page to inspect that page again.

Both variants write to `dist`. To restore the Chrome side panel and DevTools
panel build, run `pnpm --filter @module-federation/devtools run build:devtool`.
