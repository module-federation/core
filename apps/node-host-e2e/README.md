# Node federation tests

This Rstest suite consumes the actual webpack-built Node remotes. It checks a static local CommonJS import, an HTTP remote import, a dynamically registered remote with axios, and forced replacement of that remote.

Run from the repository root:

```sh
pnpm run e2e:node
```

The command builds the Rstest plugin and four remotes, then runs the tests. Rstest starts three static remote servers and closes them after the run. A separate webpack consumer reuses the demo host's configuration to verify `asyncStartup`. It does not start Express or webpack dev servers.

After building the remotes, rerun only the tests:

```sh
pnpm --filter node-host-e2e run e2e
```

The suite tests federation behavior rather than the demo host's HTTP response shape. The webpack host demo remains available in `apps/node-host`.
