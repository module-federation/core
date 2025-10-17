# Runtime Initialization Fix for Module Federation

## Problem

The Module Federation runtime must be initialized **before** any chunk loading happens. However, different webpack runtime environments (jsonp, worker, etc.) initialize chunk loading at different stages, creating a timing issue.

### Error Symptoms

```
TypeError: Cannot read properties of undefined (reading 'consumes')
    at __webpack_require__.f.consumes
```

This error occurs when chunks try to access `__webpack_require__.federation.bundlerRuntime.consumes` before the federation runtime has been loaded.

## Root Cause

### Execution Order Issue

1. **webpack.js loads** - Sets up runtime modules in stage order
2. **Chunk loading modules initialize** (stage 10 for jsonp) - Sets up chunk loading handlers
3. **Already-loaded chunks are processed** - `chunkLoadingGlobal.forEach(webpackJsonpCallback)`
4. **Chunks try to use consumes** - Calls `__webpack_require__.f.consumes`
5. **ERROR**: `bundlerRuntime` is undefined because federation entry hasn't loaded yet!
6. **Startup is called** (too late) - Would load federation entry if it got this far

### Why Different Stages Are Needed

Different webpack runtime environments use different stages:

| Runtime Module | Stage | Purpose |
|---|---|---|
| FederationRuntimeModule | `STAGE_NORMAL - 1` (-1) | Initial federation config |
| **EmbedFederationRuntimeModule** | `STAGE_NORMAL - 2` (-2) | **Federation entry loading** |
| JsonpChunkLoadingRuntimeModule | `STAGE_ATTACH` (10) | JSONP chunk loading |
| WorkerChunkLoadingRuntimeModule | `STAGE_ATTACH` (10) | Worker chunk loading |
| StartupChunkDependenciesRuntimeModule | `STAGE_TRIGGER` (20) | Startup dependencies |

## Solution

### Strategy: Load Federation Entry at Earliest Stage

The `EmbedFederationRuntimeModule` now:

1. **Runs at stage -2** (`STAGE_NORMAL - 2`) - Earlier than ANY chunk loading module
2. **Loads federation entry immediately** - Not wrapped in startup hook
3. **Sets up bundlerRuntime** - Before chunks are processed
4. **Wraps startup hook** - For container entry loading

### Code Changes

**packages/enhanced/src/lib/container/runtime/EmbedFederationRuntimeModule.ts**

```typescript
constructor(containerEntrySet) {
  // Run at the earliest stage to load federation entry before ANY chunk loading
  // This ensures bundlerRuntime is available for all runtime environments (jsonp, worker, etc.)
  super('embed federation', RuntimeModule.STAGE_NORMAL - 2);
  // ...
}

override generate() {
  const result = Template.asString([
    // IMMEDIATE EXECUTION: Load federation entry right now
    `console.log('[EmbedFederation] Requiring federation entry immediately...');`,
    `${initRuntimeModuleGetter};`, // Loads federation entry
    `console.log('[EmbedFederation] Federation entry loaded, bundlerRuntime is now available');`,

    // THEN: Set up startup hook wrapper
    `var prevStartup = ${RuntimeGlobals.startup};`,
    `${RuntimeGlobals.startup} = function() { /* ... */ };`,
  ]);
  return result;
}
```

### Execution Flow (Fixed)

1. **Stage -2**: EmbedFederationRuntimeModule runs
   - Immediately requires federation entry
   - Sets up `__webpack_require__.federation.bundlerRuntime`
2. **Stage -1**: FederationRuntimeModule runs
   - Sets up federation config
3. **Stage 10**: Chunk loading modules run
   - Set up `__webpack_require__.f.consumes` (uses bundlerRuntime ✓)
   - Process already-loaded chunks (chunks can use consumes ✓)
4. **Stage 20+**: Startup and other modules run
5. **End**: `__webpack_require__.x()` is called
   - Runs our startup wrapper
   - Calls prevStartup() which loads container entry

## Testing

### Local Testing Script

Run Next.js e2e tests locally:

```bash
# Development mode
node tools/scripts/run-next-e2e.mjs --mode=dev

# Production mode
node tools/scripts/run-next-e2e.mjs --mode=prod

# Both modes
node tools/scripts/run-next-e2e.mjs --mode=all
```

### Runtime Tests

```bash
# Runtime e2e tests
node tools/scripts/run-runtime-e2e.mjs --mode=dev
```

### What to Check

1. **No errors in browser console** - Especially `Cannot read properties of undefined (reading 'consumes')`
2. **Federation entry loads first** - Check logs:
   ```
   [EmbedFederation] Requiring federation entry immediately...
   FederationRuntimePlugin: embedding runtime
   FederationRuntimePlugin: initialized ... runtime entry
   [EmbedFederation] Federation entry loaded, bundlerRuntime is now available
   ```
3. **Chunks load successfully** - No chunk loading errors
4. **Remote modules work** - Can load federated modules

## Stage Reference

Webpack runtime module stages (from webpack source):

```typescript
RuntimeModule.STAGE_NORMAL = 0;
RuntimeModule.STAGE_BASIC = 5;
RuntimeModule.STAGE_ATTACH = 10;
RuntimeModule.STAGE_TRIGGER = 20;
```

Our stages:
- `STAGE_NORMAL - 2` = **-2** (EmbedFederationRuntimeModule)
- `STAGE_NORMAL - 1` = **-1** (FederationRuntimeModule)
- `STAGE_BASIC` = **5**
- `STAGE_ATTACH` = **10** (Chunk loading modules)
- `STAGE_TRIGGER` = **20** (Startup dependencies)

## Related Files

- `packages/enhanced/src/lib/container/runtime/EmbedFederationRuntimeModule.ts` - Main fix
- `packages/enhanced/src/lib/container/runtime/EmbedFederationRuntimePlugin.ts` - Plugin that adds the module
- `packages/enhanced/src/lib/container/runtime/FederationRuntimeModule.ts` - Federation config module
- `tools/scripts/run-next-e2e.mjs` - Local Next.js e2e test script
- `tools/scripts/run-runtime-e2e.mjs` - Local runtime e2e test script
