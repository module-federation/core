# Rstest Federation Example E2E Design

## Goal

Add real example applications under `apps/` that continuously prove
`@module-federation/rstest` can execute Module Federation imports in Rstest's
Node test environment.

The example pair must follow the repository's create-module-federation Rsbuild
template shape, be runnable on its own, and participate in the existing E2E CI
selection. It complements, rather than replaces, the focused unit, compiler,
consumer, and integration coverage in `packages/rstest`.

## Architecture

Create two private vanilla TypeScript Rsbuild workspace applications:

```text
apps/rstest-federation-remote/
├── module-federation.config.ts
├── package.json
├── rsbuild.config.ts
└── src/
    ├── dynamic-value.ts
    ├── index.ts
    └── static-value.ts

apps/rstest-federation-host/
├── module-federation.config.ts
├── package.json
├── rsbuild.config.ts
├── rstest.config.ts
├── src/
│   └── index.ts
└── tests/
    ├── dynamic-remote.test.ts
    └── static-remote.test.ts
```

Both apps use `rsbuild.config.ts` and federation option modules modeled after
the repository's `provider-rsbuild-ts` and `consumer-rsbuild-ts` templates. The
remote builds through Rsbuild's Node environment to a real CommonJS federation
container. The host declares the remote in one shared federation options object
consumed by both its Rsbuild config and its Rstest config.

The Rstest configuration consumes those options through the documented direct
`federation(options)` API. It does not set Rstest's top-level
`federation: true` option or duplicate host runtime, library, remote type, or
async-startup defaults.

Rstest is the E2E runner. The example does not use Playwright, Cypress, or a
browser automation layer.

The host application source imports the remote through both:

- a compiled static federated import from one exposure;
- a runtime dynamic `import()` from a different exposure.

The tests call those host application functions and assert distinct literal
results. They exercise the real Rsbuild-emitted container and Rstest worker
runtime without mocking the federation boundary.

The existing package integration fixture remains in place because it separately
proves interoperability with an existing `pluginModuleFederation(...)`
configuration and automatic remote discovery.

## CI Integration

The remote owns a `build` task and the host owns an `e2e` task. The host declares
the remote as a workspace dependency so Turbo builds the real remote first.
The pair remains independently runnable through a filtered Turbo command.

The existing Node E2E suite will include both apps rather than adding another
workflow. The host declares `@module-federation/rstest` as a workspace
dependency, so Turbo's affected graph selects it and therefore the Node E2E
suite when the plugin changes.

The Node E2E runner will execute the host's `e2e` task through its ordinary
Turbo dependency graph before the existing server-based Node federation
topology. No root task or duplicate workflow will be introduced.

The CI-selection tests will assert that either affected Rstest federation app
selects only the Node E2E suite.

## Error Handling and Cleanup

Rsbuild cleans its output directory before building and reports compiler
diagnostics on failure. The E2E test uses no ports or long-lived processes, so
it does not expand the Node suite's shutdown surface.

## Verification

Development follows a red-green cycle:

1. Add the CI-selection expectation before registering the new suite input and
   confirm it fails.
2. Add the Rsbuild app pair and tests without the Rstest `federation(...)`
   plugin and confirm the filtered E2E command fails while resolving the remote
   imports.
3. Add the minimum Rstest plugin configuration and CI integration.
4. Run the host's filtered E2E task through Turbo so the remote builds first.
5. Run `@module-federation/rstest` build, test, and lint.
6. Run the repository's Node E2E local-CI job.
7. Run the full `build-and-test` local-CI job because the PR adds a publishable
   package and changes shared CI selection inputs.

After pushing, wait for the current-head GitHub checks and a qualifying review
before merging PR #4920.

## Non-goals

- Browser-mode UI coverage; Rstest federation compatibility is a Node/JSDOM
  runtime feature and browser behavior remains unchanged.
- Replacing package-local tests with the example app.
- Adding a new E2E workflow or root-level Turbo task.
- Adding React, HTML, a browser server, or UI-only assertions; vanilla
  create-rsbuild-style apps are sufficient for this Node integration.
- Adding Playwright or Cypress coverage for this example.
