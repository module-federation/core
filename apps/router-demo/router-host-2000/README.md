# Router federation tests

Run from the repository root:

```sh
pnpm run test:router:federation
```

Turbo builds the host, six remotes, and their workspace dependencies, then runs the host's Rstest tests. The remotes are test dependencies in `package.json`, so their source changes invalidate the test cache.

The tests render the host's `App` with `@rstest/browser-react` and load real HTTP remotes through Module Federation. They cover React 17, React 18, React 19, Vue, props and refs, remote navigation, memory routing, browser history, error boundaries, and state across updates and remounts.

Rstest Browser Mode runs these component tests in Chromium. It shares the host's federation options, with eager React shares for the test entry. Global setup serves the remote build outputs and closes the static servers after the run. No host dev server or Cypress runner is needed. Playwright supplies Rstest's browser engine.

After building the remotes, rerun the tests with:

```sh
pnpm --filter host run test
```

Nested-route tests render at the requested URL, and history tests use the browser's history API. These component tests do not check a web server's history fallback or standalone HTML bootstrap.

To run all router demos interactively:

```sh
pnpm run app:router:dev
```
