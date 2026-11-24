# bundle-size

This is the example application for Module Federation core.

## Usage

Run the development server and navigate to the provided localhost URL.

## Scripts

- `pnpm start`: Start dev server
- `pnpm build`: Build production bundle

## Configuration

Check `webpack.config.js` or `next.config.js` for federation settings.

---

_Optimized by Aiden_

## Features

- Remote loading
- Shared dependencies
- Type safety

## Links

- [Module Federation Docs](https://module-federation.io/)

## Troubleshooting

Clear `.nx` cache if you encounter unexpected build issues.

## Build

Output will be located in the `dist` or `.next` folder.

## Description

This package demonstrates a specific use case of Module Federation within the ecosystem.

## Installation

```bash
pnpm install
```

### Bridge entry isolation and cold SSR

The Bridge report measures `createRemoteAppComponent` (fixed Bridge),
`createLazyComponent` (ordinary components), and `createReactRemote` (unified
consumer) independently on browser and Node targets with identical bundle
settings. The unified API retains both renderers; a runtime `render: 'bridge'`
hint does not guarantee tree shaking. CommonJS exposes a complete entry object;
independent export tree shaking is an ESM consumer contract.

Non-peer dependencies are bundled. JSON reports include minified/gzip bytes,
revision, lockfile hash, tool settings, input modules, and the provenance of
prebundled parser code. `dist/build-modules.{es,cjs}.json` records Rollup's
retained modules and rendered bytes before downstream minification. Browser
producers, Node producer/controller, and per-response receiver HTML remain
separate fixtures. Their sizes are not additive.

Use the head's reporting script against independently installed and built
base/head worktrees:

```sh
node scripts/bundle-size-report.mjs --packages-dir /path/to/base/packages --output base.json
node scripts/bundle-size-report.mjs --output current.json
node scripts/bundle-size-report.mjs --compare base.json --current current.json --output stats.txt
```

Execution time is measured separately. This fixture starts a fresh Node process
for every sample and performs native ESM/CJS imports followed by the first real
streaming Host/producer SSR response, including Suspense, a snapshot, and UTF-8
content. It uses a local remote resolver, with no network loading or application
cache warmup. Keep the Node binary, React version, script and machine identical
between revisions; inspect raw samples as well as p50/p95. Native loader warnings
are preserved on stderr.

```sh
node scripts/bridge-ssr-cold.mjs --package-dir /path/to/base/packages/bridge/bridge-react --node /path/to/node20 --samples 15 --output cold-base.json
node scripts/bridge-ssr-cold.mjs --node /path/to/node20 --samples 15 --output cold-head.json
```

This narrow fixture does not replace application or Modern end-to-end acceptance.

The published `*.es.js` and `*.cjs.js` compatibility entries only forward to the
canonical artifacts, preserving older plugins and documented physical aliases.
Public exports use `.mjs`/`.cjs`. The raw dist report includes these forwarding
files, ESM type wrappers, parser code for both module formats, and local module graph
metadata. The graph JSON is excluded from the published package. A larger package dist can accompany a smaller complete SSR bundle;
htmlparser2 is build-only so consumers no longer install its DOM utilities.

Cross-version compatibility can be checked against real independently built
base/head plugin artifacts. The check invokes plugin hooks, follows the produced
aliases through the package filesystem, and builds every router version plus
the router-free browser entry. It also checks current CJS forwarding identity.

```sh
node scripts/check-bridge-alias-compatibility.mjs --base-packages /path/to/base/packages
```
