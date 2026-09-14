# modernjs-ssr

## Running Demo

- host: [localhost:3050](http://localhost:3050/)
- remote: [localhost:3051](http://localhost:3051/)
- nested-remote: [localhost:3052](http://localhost:3052/)
- dynamic-remote: [localhost:3053](http://localhost:3053/)
- dynamic-nested-remote: [localhost:3054](http://localhost:3054/)
- remote-new-version: [localhost:3055](http://localhost:3055/)
- dynamic-remote-new-version: [localhost:3056](http://localhost:3056/)
- another_remote: [localhost:3057](http://localhost:3057/)

## How to start the demos ?

```bash
# Root directory
pnpm i

pnpm exec turbo run build --filter=@module-federation/modern-js

pnpm run app:modern:dev

open http://localhost:3050/
```

## Debugging SSR Cache Tests

Start the remote fixtures:

```bash
cd /Users/bytedance/outter/core

pnpm exec turbo run dev \
  --filter=modernjs-ssr-dynamic-nested-remote \
  --filter=modernjs-ssr-dynamic-remote \
  --filter=modernjs-ssr-dynamic-remote-new-version \
  --filter=modernjs-ssr-nested-remote \
  --filter=modernjs-ssr-remote \
  --filter=modernjs-ssr-remote-new-version \
  --filter=modernjs-ssr-another-remote \
  --concurrency=20
```

Start the SSR host in a separate terminal with Node Inspector and heap snapshots:

```bash
cd /Users/bytedance/outter/core/apps/modernjs-ssr/host

MF_SSR_HEAP_SNAPSHOT=all \
MF_SSR_HEAP_SNAPSHOT_DIR=/tmp/mf-ssr-cache-probe \
TS_NODE_COMPILER=typescript-compiler \
node --inspect=9230 --expose-gc \
  ./node_modules/@modern-js/app-tools/bin/modern.js dev
```

Use `chrome://inspect` with `localhost:9230`, then visit:

- `http://localhost:3050/remove-remote-cache`
- `http://localhost:3050/remove-remote-cache?update=1`
- `http://localhost:3050/remove-remote-shared-cache`
- `http://localhost:3050/remove-remote-shared-cache?load=1`
- `http://localhost:3050/remove-remote-shared-cache?remove=another_remote`

## Production SSR cache update demo

The new update API has a separate manual mode using the same production fixture
as the E2E suite. Run from the repository root (Node 24, pnpm 10.28.0):

```bash
pnpm install --frozen-lockfile
pnpm exec turbo run build --filter=@module-federation/modern-js-v3
pnpm --filter modernjs-ssr-cache-updates run demo
```

Wait for the printed demo URL, then open <http://127.0.0.1:3058/__demo>.
The command builds the host and immutable v1/v2 providers before starting the
production server. It keeps running until Ctrl+C; no separate remote terminals
are needed. Assets use port 3059, alongside the existing 3050–3057 demos.

1. Open the SSR page and click its v1 counter to verify hydration.
2. In the control page, choose **Update to v2**. Inspect the actual update result,
   mode, timings and server status. The PID and listening port stay unchanged.
3. Reload the embedded SSR page (a new request) to see v2, then click its counter.
4. Keep an old SSR tab open before updating: it retains its hydrated v1 code and
   continues to work because both releases' assets remain available.
5. Switch back to v1 to repeat the update without restarting the server.

This mixed-consumption fixture demonstrates **whole-application rebuilds**,
not selective entry updates. The three static artifact E2E variants separately
verify selective updates and unrelated-entry traffic:

```bash
pnpm --filter modernjs-ssr-cache-updates exec node e2e/static.cjs
```

Use `SSR_CACHE_DEMO_PORT` and `SSR_CACHE_ASSET_PORT` to override the ports.
For Node Inspector, replace the demo command with:

```bash
node --inspect=9231 --expose-gc apps/modernjs-ssr/cache-updates/e2e/production.cjs --demo
```

To experience the published MF preview instead of workspace MF, prefix the demo
command with `SSR_CACHE_PACKAGES_ROOT=/absolute/path/to/installed-packages`.
See [the package setup and E2E documentation](./cache-updates/README.md#verify-published-packages).
Temporary build directories are printed and retained for inspection. This is a
local loopback-only demo; its update endpoints are not a production admin API.
