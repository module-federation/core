# Modern SSR cache review demo

Independent review directory. The previous demo, E2E entry and CI configuration
are unchanged. Review this locally before promoting it to the primary tests.

## Run

From the repository root, with the existing workspace dependencies and MF builds:

```sh
node apps/modernjs-ssr/modern-playground/start.cjs --memory
```

Open <http://127.0.0.1:3059/>. The old demo can continue using port 3058.
The launcher copies these checked-in Modern projects to a temporary build root,
executes Modern production builds, and starts their SSR hosts. It does not
construct HTML or inject a hand-written dashboard script.

- `console/`: Modern SSR route, loader and React controls, including iframe windows.
- `static/`: Modern MPA host with a statically consumed Remote A and independent B.
- `dynamic/`: Modern MPA host with runtime remote registration/loading.
- `remote/`, `remote-b/`: Modern providers, built into separate v1/v2 releases.
- `config.ts`: shared Modern configuration; each project has `modern.config.ts`.
- `start.cjs`, `console-server.cjs`: process orchestration and Modern production
  serving. Control API requests pass through Modern's bypass to a local control
  service, keeping the console responsive while either host is draining.

The versioned asset server represents a CDN. Remote components and their manifests
are built by Modern with the MF plugin. The Node control service and traffic
worker reuse the existing acceptance harness; they do not render the console.
The console and the two tested SSR applications run in separate processes.

## What to try

1. The console itself displays server-rendered PID/time evidence. The left/right
   frames show actual Modern host pages. Change BPM on the old page, update to v2,
   and compare the new SSR version while the old page retains its client state.
2. Use “查看真实 HTML” to inspect a freshly fetched server response. The provider
   version and loader module identity help distinguish SSR cache reuse/reload.
3. Select the dynamic host. Load the palette in the browser, then register it for
   SSR and inspect the raw HTML containing “Choose a mood.”.
4. Start the traffic experiment. A held loader keeps the update in draining;
   twelve new Node requests target A/B, and an additional real iframe opens while
   draining. Default release is automatic. Select B with manual release to see
   an unaffected entry complete before the static A update finishes.
5. The memory tab samples only the selected host PID, can request GC, perform
   twenty updates, and generate an explicit heap snapshot. No periodic heap
   sampling occurs. Queue counters include the iframe; Node result counts do not.

Fault presets intentionally produce queue-full or timeout 503 responses. A failed
iframe response stays visible; the UI does not fabricate a stale-page fallback.
If a background tab misses draining, it reports that instead of claiming blocking.

Manual debugger startup:

```sh
node apps/modernjs-ssr/modern-playground/start.cjs --debug
```

Attach via `chrome://inspect` to ports 9230 (static) / 9231 (dynamic). This also
enables GC. The console PID and load-generator PID are excluded from host samples.

## Independent validation

```sh
node apps/modernjs-ssr/modern-playground/e2e.cjs
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

### Current verification

- `node apps/modernjs-ssr/modern-playground/e2e.cjs`: passed (three Cypress
  scenarios, static/dynamic real HTTP admission, queue-full/timeouts and twenty
  memory updates). Log: `/tmp/modern-new-e2e-final.log`.
- `pnpm exec prettier --check apps/modernjs-ssr/modern-playground`: passed.
- `git diff --check`: passed.
- The real update-window screenshot was visually inspected. It shows hydrated
  content with BPM changed to 125 through a real click after the queued response.

Initial startup attempts exposed omitted required coordinator fields/onReady in
this demo's Modern server options; those options were supplied. The first browser
run also exposed missing page initialization between isolated Cypress tests;
each scenario now opens the console explicitly. These were demo setup errors,
not framework fixes.

The existing full SSR suite/CI wrapper, other framework suites and dependency
reinstallation were skipped: this isolated candidate was explicitly requested
for local review before replacing existing tests, and no runtime/dependency or
old test files changed in this addition. No publishing or changeset is needed.
