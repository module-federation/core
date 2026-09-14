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

nx build modern-js-plugin

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
