# Rstest Federation Example E2E Design

## Goal

Add a real example application under `apps/` that continuously proves
`@module-federation/rstest` can execute Module Federation imports in Rstest's
Node test environment.

The example must be runnable on its own and must participate in the repository's
existing E2E CI selection. It complements, rather than replaces, the focused
unit, compiler, consumer, and integration coverage in `packages/rstest`.

## Architecture

Create one private workspace application:

```text
apps/rstest-federation-e2e/
├── package.json
├── rstest.config.ts
├── remote/
│   ├── build-remote.ts
│   ├── entry.js
│   ├── dynamic-value.js
│   └── static-value.js
└── tests/
    ├── dynamic-remote.test.ts
    └── static-remote.test.ts
```

The app's global setup builds an actual CommonJS Module Federation remote with
Rspack. The Rstest configuration consumes that remote through the documented
direct `federation({ name, remotes })` API from `@module-federation/rstest`.
It does not set Rstest's top-level `federation: true` option or duplicate the
Node runtime, library, remote type, or async-startup defaults.

The tests import the exposed module through both:

- a compiled static federated import from one exposure;
- a runtime dynamic `import()` from a different exposure.

These assertions exercise the real emitted container and Rstest worker runtime.
They do not mock the federation boundary.

The existing package integration fixture remains in place because it separately
proves interoperability with an existing `pluginModuleFederation(...)`
configuration and automatic remote discovery.

## CI Integration

The app owns an `e2e` package task and remains independently runnable through a
filtered Turbo command.

The existing Node E2E suite will include the new app rather than adding another
workflow. The app declares `@module-federation/rstest` as a workspace
dependency, so Turbo's affected graph selects the app and therefore the Node E2E
suite when the plugin changes.

The Node E2E runner will execute the new app's `e2e` task alongside the existing
Node federation E2E test task. No root task or duplicate orchestration layer will
be introduced.

The CI-selection tests will assert that an affected
`rstest-federation-e2e` app selects only the Node E2E suite.

## Error Handling and Cleanup

Global setup removes stale output before compilation and reports compiler
errors with Rspack diagnostics. Teardown removes generated remote output even
after test failures. The E2E test uses no ports or long-lived processes, so it
does not expand the Node suite's shutdown surface.

## Verification

Development follows a red-green cycle:

1. Add the CI-selection expectation before registering the new suite input and
   confirm it fails.
2. Add the app fixture and tests without the `federation(...)` plugin and confirm
   the filtered E2E command fails while resolving the remote imports.
3. Implement the minimum app and CI integration.
4. Run the app's filtered E2E task.
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
- Expanding the example into a user-facing demo with a server or UI.
