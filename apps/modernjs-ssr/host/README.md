# Modern SSR removeRemote cache repro

This app contains a manual repro for checking whether a same-name remote can be
removed from SSR memory and loaded again from a different URL.

## Services

Start the three apps from the repository root:

```bash
pnpm --dir apps/modernjs-ssr/remote dev
pnpm --dir apps/modernjs-ssr/remote-new-version dev
pnpm --dir apps/modernjs-ssr/host dev
```

The host `dev` script starts Node with `--expose-gc`, so the repro page can
trigger GC before collecting memory snapshots.

Ports used by this repro:

- Host: `http://localhost:3050`
- Remote v1: `http://127.0.0.1:3051/static/mf-manifest.json`
- Remote v2: `http://127.0.0.1:3055/mf-manifest.json`

## Manual Repro

Open:

```text
http://localhost:3050/remove-remote-cache
```

The page runs the full flow once:

1. Register remote v1.
2. Snapshot memory before loading the remote.
3. Load `remote/Heavy` from v1.
4. Snapshot memory after loading v1.
5. Call `removeRemote('remote')`.
6. Snapshot memory after removal.
7. Trigger GC and snapshot memory again.
8. Wait 10s, 20s, and 30s, triggering GC before each delayed snapshot.
9. Register remote v2.
10. Load `remote/Heavy` from v2.
11. Snapshot memory after loading v2.

## What To Check

Check the table on the page. The most useful column is `heap MB`.

Expected remote result:

- `heavy version` is `v1`
- `reloaded heavy version` is `v2`
- `initial remote` points to `127.0.0.1:3051/static/mf-manifest.json`
- `reloaded remote` points to `127.0.0.1:3055/mf-manifest.json`

Expected memory shape:

- `after load` is higher than `before load`, because v1 loads a large payload.
- `after gc` or one of the delayed GC snapshots should be lower than
  `after removeRemote`.
- `after reload` is higher again, because v2 loads another large payload.

The raw JSON is also printed in `#remove-remote-cache-result` at the bottom of
the page.

## Split Step Repro

Use these routes when heap snapshots make the full route too heavy. Visit them
in order from the same host process:

```text
http://localhost:3050/remove-remote-cache/load-remote
http://localhost:3050/remove-remote-cache/remove-remote
http://localhost:3050/remove-remote-cache/register-new-remote
```

Each route returns one memory row and writes one heap snapshot:

- `load-remote`: registers remote v1, loads `remote/Heavy`, then snapshots
  memory.
- `remove-remote`: calls `removeRemote('remote')`, triggers GC, then snapshots
  memory. It does not register remote v2.
- `register-new-remote`: registers remote v2, loads `remote/Heavy`, then
  snapshots memory.

## Heap Snapshot Debugging

Heap snapshots are disabled by default because each snapshot pauses the process
and can use a large amount of memory. Enable them only when you need to inspect
what is retained after `removeRemote`.

Start the host with heap snapshots enabled:

```bash
MF_SSR_HEAP_SNAPSHOT=all \
MF_SSR_HEAP_SNAPSHOT_DIR=/tmp/mf-ssr-cache-probe \
pnpm --dir apps/modernjs-ssr/host dev
```

Then open:

```text
http://localhost:3050/remove-remote-cache
```

Each memory row will include a `heap snapshot` file path. The files are also
written to `MF_SSR_HEAP_SNAPSHOT_DIR`.

To reduce the number of files, pass a comma-separated label list instead of
`all`:

```bash
MF_SSR_HEAP_SNAPSHOT='before load,after gc,after delayed gc 30s' \
MF_SSR_HEAP_SNAPSHOT_DIR=/tmp/mf-ssr-cache-probe \
pnpm --dir apps/modernjs-ssr/host dev
```

Recommended snapshots to compare:

- `before load`: baseline before loading `remote/Heavy`
- `after load`: memory after loading remote v1
- `after gc`: memory after `removeRemote` and immediate GC
- `after delayed gc 30s`: memory after delayed GC
- `after reload`: memory after loading remote v2

Open the `.heapsnapshot` files in Chrome DevTools:

1. Open DevTools.
2. Go to the `Memory` tab.
3. Use `Load` to load the snapshot files.
4. Select the later snapshot and switch to `Comparison`.
5. Compare it against `before load`.
6. Search for `remote-heavy`, `remote-heavy-v2`, `Heavy`, or `remote/Heavy`.
7. Select retained objects and inspect `Retainers` to see what still references
   them.

When reporting retained memory, include:

- the two snapshot files being compared
- the top retained object names
- retained size
- the `Retainers` path for suspicious objects
- the table from `/remove-remote-cache`

## Fast Route

For repeated checks without the 10s/20s/30s wait, use:

```text
http://localhost:3050/remove-remote-cache-fast
```

This route runs the same load, remove, GC, and reload flow, but skips delayed
snapshots.

## Automated Checks

Run the Cypress check:

```bash
node tools/scripts/run-modern-e2e.mjs --mode=manifest
```

Run the local repeated-memory probe:

```bash
pnpm run probe:modern:ssr-gc -- --iterations=20 --max-growth-mb=20
```

The repeated probe starts one host process, runs the fast repro route multiple
times, and fails if heap usage keeps growing beyond the configured limit after
warmup.
