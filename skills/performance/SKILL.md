---
name: mf-perf
description: Check Module Federation local development performance configuration: detect whether recommended performance optimization options are enabled to alleviate slow HMR and slow build speed.
argument-hint: [project-root]
allowed-tools: Bash(node *)
---

**Step 1**: Call the `mf-context` Skill (pass `$ARGUMENTS`) to collect MFContext.

**Step 2**: Serialize MFContext to JSON and pass it to the check script via the `--context` argument:

```bash
node scripts/performance-check.js --context '<MFContext-JSON>'
```

Provide recommendations for each item in the output `results` and `context.bundler.name`:

**PERF · info — `dev.disableAssetsAnalyze`** (applies to all projects)
- Disabling bundle size analysis during local development significantly improves HMR speed
- Add to the Rsbuild config:
  ```js
  dev: { disableAssetsAnalyze: true }
  ```

**PERF · info — Rspack `splitChunks` optimization** (shown only when `bundler.name` is `rspack` or `rsbuild`)
- Setting `splitChunks.chunks` to `"async"` reduces initial bundle size and speeds up first-screen loading
- Add to the build config:
  ```js
  output: { splitChunks: { chunks: 'async' } }
  ```

**PERF · info — TypeScript DTS optimization** (shown only when `typescript` dependency is detected)
- If type generation (DTS) is the main bottleneck, options include:
  1. Temporarily disable DTS: set `dts: false` in the `@module-federation/enhanced` config
  2. Use `ts-go` instead of `tsc` to speed up type checking

Webpack projects do not show Rspack-specific entries to avoid irrelevant suggestions.
