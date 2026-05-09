# Sub-skill: perf

Check Module Federation local development performance configuration: detect whether recommended performance optimization options are enabled to alleviate slow HMR and slow build speed.

## Step 1: Collect MFContext

Read and follow the instructions in `./context.md`, passing ARGS as the project root.

## Step 2: Run performance check script

Serialize MFContext to JSON and pass it to the check script:

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
  2. Switch to `ts-go` for significantly faster type generation

## Step 3: ts-go migration (interactive)

After presenting the DTS recommendation, ask the user:

> "Would you like me to automatically try switching to `ts-go` and verify compatibility?"

If the user confirms, execute the following steps in order:

1. **Backup** — copy the current generated type output directory (e.g. `@mf-types/`) to a timestamped backup path such as `@mf-types.bak.<timestamp>/`

2. **Configure** — set `dts.generateTypes.compilerInstance = "tsgo"` in the Module Federation config

3. **Install** — install the required package using the project's package manager from MFContext:
   ```bash
   pnpm add @typescript/native-preview --save-dev
   ```

4. **Regenerate** — run:
   ```bash
   npx mf dts
   ```

5. **Verify** — diff the newly generated type output against the backup:
   - If the output is **identical**: inform the user that `ts-go` is compatible and the switch is safe; offer to remove the backup
   - If the output **differs**: revert the config change, restore the backup, and explain clearly what differs (e.g. missing declarations, changed signatures) so the user can decide whether the difference is acceptable

Webpack projects do not show Rspack-specific entries to avoid irrelevant suggestions.
