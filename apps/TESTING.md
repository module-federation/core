# App tests

Run these commands from the repository root with Node 24 and pnpm 10.28.0.

| Suite | Command | Test boundary |
| --- | --- | --- |
| Node federation | `pnpm run test:node:federation` | Built local and HTTP remotes, runtime registration, replacement, and a webpack consumer |
| Router | `pnpm run test:router:federation` | Rendered host with real React and Vue remotes in Rstest Browser Mode |
| Runtime | `pnpm run test:runtime:federation` | Rendered host, real remotes, retry/error fixtures, observability, and build metadata |
| Manifest | `pnpm run test:manifest:federation` | Rendered components, webpack/Rspack providers, assets, and preloading |
| Bundle size example | `pnpm run test:bundle-size` | The exposed `HelloWorld` component |

Browser suites use `@rstest/browser-react` to render components and Testing Library-style queries and interactions. Playwright supplies Chromium for Rstest; the tests do not navigate a standalone application with `page.goto()`.

Router, runtime, and manifest tests serve built remote assets in global setup. Turbo declares remote build dependencies so changes to a remote invalidate its consumers' tests.

Next.js and Modern.js SSR, data-loader, and shared-tree-shaking integration suites retain Cypress. They are outside this migration. Metro retains its native Maestro tests. The existing Rstest federation example remains on Rstest.

`patches/@rstest__browser@0.12.3.patch` makes Rstest respect `defaultPrevented` on browser error events. Tests activate suppression for an exact expected error message only while asserting the error UI. Federation's script-error listener still receives the event, and unrelated errors still fail the suite. Remove this patch when the installed Rstest version handles prevented errors.
