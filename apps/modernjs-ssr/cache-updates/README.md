# Modern SSR cache E2E

This private application owns the SSR cache end-to-end regression suite. It builds
real host/provider applications, starts HTTP servers on ephemeral ports, tests
browser hydration with Cypress, and checks update/admission/resource behavior.

```sh
pnpm install --frozen-lockfile
pnpm exec turbo run build --filter=@module-federation/modern-js-v3
pnpm run e2e:modern:ssr:cache
```

The standard `pnpm run e2e:modern:ssr` entry runs the existing manifest/legacy-cache checks and
this suite. The Modern SSR GitHub workflow and local CI runner use that same entry.
Affected detection includes this private package and its compiler-selection hook.
By default it tests **workspace MF code**, fixed Modern previews from this package,
and the workspace's Rspack override. A regression in a new MF change must therefore
fail this suite instead of accidentally testing an older published MF package.

- `e2e/static.test.cjs`: three native compiled artifact modes cover scoped updates,
  independent-entry traffic, unrelated module/shared identity, and failure recovery.
  This test originated in the companion Modern SSR owner suite.
- `e2e/release.cy.cjs`: current and delayed old HTML hydration and click behavior.
- `e2e/production.cjs`: real production HTTP, streams, loader/actions, cancellation,
  queue limits, reentry, dynamic registration and repeated whole-app rebuilds.
  The mixed-consumption fixture intentionally uses whole-application mode.
- `e2e/production-fixture.cjs`: isolated real host/provider builds and immutable
  v1/v2 assets. Generated files never overwrite the checked-in application.

The default soak uses 70 updates and eight concurrent requests per update. For
release acceptance use `SSR_CACHE_PRODUCTION_CYCLES=300`. Post-GC heap must remain
within the fixture's +8 MiB budget after warm-up, with stable instance/binding
counts and idle request counters. This catches the reproduced renderer retention
regression; it does not certify arbitrary business code or infinite uptime.

Temporary fixture paths and metrics are printed and retained for diagnosis;
servers are closed after the test. Tests do not configure an external supervisor
or CDN retention policy. Exact previous results and boundaries are recorded in
[`VALIDATION.md`](../../../../tools/ssr-cache/VALIDATION.md).

### Verify published packages

For release acceptance, install packages into an independent directory without
workspace links. The accepted combination is:

```json
{
  "private": true,
  "packageManager": "pnpm@10.28.0",
  "dependencies": {
    "@module-federation/modern-js-v3": "0.0.0-feat-mf-ssr-clear-cache-20260914081229",
    "@modern-js/app-tools": "0.0.0-canary-20260914082926",
    "@modern-js/runtime": "0.0.0-canary-20260914082926",
    "@modern-js/prod-server": "0.0.0-canary-20260914082926",
    "@modern-js/server-core": "0.0.0-canary-20260914082926",
    "@rspack/core": "npm:@rspack-canary/core@2.2.3-canary-ba52386c-20260916132656",
    "react": "19.2.8",
    "react-dom": "19.2.8",
    "typescript": "5.9.3"
  },
  "pnpm": {
    "overrides": {
      "@rspack/core": "npm:@rspack-canary/core@2.2.3-canary-ba52386c-20260916132656"
    }
  }
}
```

Run `pnpm install --registry=https://registry.npmjs.org/` there, then from this
repository's installed test workspace:

```sh
SSR_CACHE_PACKAGES_ROOT=/absolute/path/to/installed-packages SSR_CACHE_PRODUCTION_CYCLES=300 pnpm run e2e:modern:ssr:cache
```

Published mode resolves the production server, MF adapter, compiler, CLI, runtime
and React from the independent installation. The production test writes
`packages.json` beside its metrics, containing exact versions and real paths. The
local repository supplies only test tooling/Cypress and the compiler-selection
hook, not the tested implementation.

The native static artifact test is versioned in this E2E application. `e2e/static.cjs`
uses a temporary dependency layout to run it against either workspace MF or the
independent published installation. No external Modern source checkout is required.

### Manual local experience

Run `pnpm run demo:modern:ssr` after the package build above. The unified
playground uses separate production static/dynamic hosts, real iframe previews
and a separate Node traffic process. `demo:modern:ssr:memory` enables GC, while
`demo:modern:ssr:debug` enables Inspector for both hosts.

See [the parent README](../README.md) for the walkthrough and manual commands.
`e2e/playground.cjs` runs the same application and checked-in Cypress scenarios,
then asserts real admission and memory behavior. It is part of the standard E2E
entry. Existing lifecycle/soak tests remain independent regression coverage.
