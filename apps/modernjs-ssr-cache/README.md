# Modern SSR cache review demo

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
