# Bridge SSR V1 acceptance demo

Rsbuild demo for application-level Bridge SSR in both directions:

- React 18 host → Vue 3 remote
- Vue 3 host → React 18 remote

Contract details: [Bridge SSR guide](../website-new/docs/en/guide/bridge/ssr.mdx).

Run from the repository root:

```bash
pnpm run e2e:bridge:ssr
pnpm run e2e:bridge:ssr:production
```

These suites cover no-JS HTML, single-copy transport, hydration, deep routes, navigation, CSR revisits after consumption, multiple instances, and browser-bundle exclusion of server-only renderers.
