# Vendored `react-server-dom-webpack` diffs

This directory captures diffs between our vendored copy and the published npm tarball.

## What’s checked in

- `rsdw-vendored-vs-npm-19.2.0.functional.diff`
  - The **intentional** patches we rely on (exports, loaders, action registry, plugin/node-register changes).
  - Kept small enough to be reviewable in PRs.

## How to regenerate a full diff locally

From the repo root:

```bash
tmpdir="$(mktemp -d)"
cd "$tmpdir"
npm pack react-server-dom-webpack@19.2.0
tar -xzf react-server-dom-webpack-19.2.0.tgz
cd - >/dev/null
diff -ruN "$tmpdir/package" "packages/react-server-dom-webpack" || true
```

