# Investigation: Webpack Runtime Wrappers in CJS Output

## Problem Summary

The `packages/sdk` package uses Rslib with `bundle: false` for both ESM and CJS formats, yet the CJS output files (`*.cjs`) include webpack runtime wrappers/preambles:

```javascript
"use strict";
// The require scope
var __webpack_require__ = {};

/************************************************************************/
// webpack/runtime/define_property_getters
(() => {
__webpack_require__.d = (exports, definition) => {
	for(var key in definition) {
        if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
            Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
        }
    }
};
})();
// ... more webpack runtime code
```

This is undesirable for library code that should be clean, readable, and directly consumable.

## Current Configuration

**File**: `packages/sdk/rslib.config.ts`

```typescript
{
  format: 'cjs',
  autoExtension: true,
  syntax: 'es2021',
  bundle: false,
  outBase: 'src',
  shims: {
    cjs: {
      'import.meta.url': false,
    },
  },
}
```

## Findings

### 1. Related GitHub Issue (#869)

- **Issue**: [web-infra-dev/rslib#869](https://github.com/web-infra-dev/rslib/issues/869)
- **Status**: Closed (completed)
- **Fix**: PR [#1042](https://github.com/web-infra-dev/rslib/pull/1042) - Bumped Rsbuild to 1.4.0-beta.2
- **Scope**: Fixed `__webpack_exports__` and `__WEBPACK_EXTERNAL_MODULE_` prefixes in **ESM outputs**
- **Note**: The fix specifically addressed ESM outputs, not CJS runtime wrappers (`__webpack_require__`)

### 2. Version Analysis

The repository uses:
- `@rslib/core`: Various versions (0.9.x, 0.12.x)
- `@rsbuild/core`: 2.0.0-beta.2, 2.0.0-beta.3

The SDK package doesn't explicitly declare `@rslib/core` in its `package.json`, suggesting it's inherited from the workspace root.

### 3. Configuration Patterns in Repo

All packages with similar CJS configurations show the same pattern:
- `bundle: false`
- `format: 'cjs'`
- `shims.cjs['import.meta.url']: false` (in some packages)

**No packages in the repo currently avoid webpack runtime wrappers in CJS output.**

### 4. Rslib/Rsbuild Documentation

- `bundle: false` enables bundleless mode where files are transpiled individually
- In bundleless mode, `autoExternal` has no effect
- No documented configuration option exists to prevent webpack runtime wrappers in CJS output
- The webpack runtime wrapper is injected by Rspack's internal mechanism for CJS format

## Root Cause

The webpack runtime wrapper (`__webpack_require__`) is injected by Rspack when generating CJS output, even with `bundle: false`. This is part of Rspack's module system implementation and is not configurable through standard Rslib options.

## Recommendations (Ranked by Risk)

### Option 1: Upgrade Rslib/Rsbuild (LOW RISK) ⭐ RECOMMENDED

**Action**: Upgrade to latest Rslib/Rsbuild versions that may include fixes for CJS runtime wrappers.

**Steps**:
1. Check latest Rslib version: `pnpm info @rslib/core versions --json`
2. Update `package.json` dependencies
3. Test CJS output after upgrade
4. If issue persists, proceed to Option 2

**Risk**: Low - Version upgrades are generally safe and may include fixes
**Effort**: Low - Simple dependency update
**Maintenance**: Low - Uses official solution

### Option 2: Rspack Configuration Hook (MEDIUM RISK)

**Action**: Use `tools.rspack` hook to modify Rspack configuration and attempt to disable runtime injection.

**Implementation**:
```typescript
// packages/sdk/rslib.config.ts
export default defineConfig({
  // ... existing config
  tools: {
    rspack: (config: any) => {
      // Attempt to disable webpack runtime for CJS outputs
      if (config.output?.library?.type === 'commonjs-module') {
        // Try to minimize runtime injection
        config.optimization = config.optimization || {};
        config.optimization.runtimeChunk = false;
        // Disable module concatenation which may require runtime
        config.optimization.concatenateModules = false;
      }
      return config;
    },
  },
});
```

**Risk**: Medium - May affect build behavior or break functionality
**Effort**: Low - Simple config addition
**Maintenance**: Medium - May need updates if Rspack API changes

**Note**: This approach is experimental and may not fully resolve the issue.

### Option 3: Post-Build Transform Script (LOW-MEDIUM RISK)

**Action**: Create a post-build script to strip webpack runtime wrappers from CJS files.

**Implementation**:
```typescript
// scripts/strip-webpack-runtime.ts
import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

async function stripWebpackRuntime(dir: string) {
  const files = await readdir(dir, { recursive: true });
  
  for (const file of files) {
    if (file.endsWith('.cjs')) {
      const filePath = join(dir, file);
      let content = await readFile(filePath, 'utf-8');
      
      // Remove webpack runtime preamble
      // Pattern: from "use strict"; to end of webpack runtime blocks
      content = content.replace(
        /"use strict";\s*\/\/ The require scope\s*var __webpack_require__ = \{\};\s*\/\*[\s\S]*?\*\/\s*\(\(\) => \{[\s\S]*?\}\)\(\);/g,
        '"use strict";'
      );
      
      // Remove remaining webpack runtime function definitions
      content = content.replace(
        /\/\/ webpack\/runtime\/[\s\S]*?\(\(\) => \{[\s\S]*?\}\)\(\);/g,
        ''
      );
      
      // Clean up multiple blank lines
      content = content.replace(/\n{3,}/g, '\n\n');
      
      await writeFile(filePath, content, 'utf-8');
    }
  }
}

const distPath = join(process.cwd(), 'dist');
stripWebpackRuntime(distPath).catch(console.error);
```

**Update package.json**:
```json
{
  "scripts": {
    "build": "rslib build && node scripts/strip-webpack-runtime.js",
    "postbuild": "node scripts/strip-webpack-runtime.js"
  }
}
```

**Risk**: Low-Medium - May break if webpack runtime format changes
**Effort**: Medium - Requires regex pattern matching and testing
**Maintenance**: Medium - Needs updates if Rspack output format changes

### Option 4: Separate CJS-Only Build (MEDIUM RISK)

**Action**: Create a separate build configuration that uses a different tool (e.g., `tsc` or `swc`) for CJS output only.

**Implementation**:
1. Keep ESM build with Rslib
2. Add separate CJS build using `tsc` or `swc` directly
3. Configure `package.json` exports to use different sources

**Risk**: Medium - Maintains two build systems
**Effort**: High - Requires new build configuration
**Maintenance**: High - Two build systems to maintain

### Option 5: Externalize Node Modules (LOW RISK, LIMITED EFFECT)

**Action**: Ensure all Node.js built-ins and dependencies are properly externalized.

**Current config already has**:
```typescript
output: {
  externals: [/@module-federation\//, 'isomorphic-rslog'],
}
```

**Enhancement**: Add more explicit externalization:
```typescript
output: {
  externals: [
    /@module-federation\//,
    'isomorphic-rslog',
    /^node:/,
    'path',
    'fs',
    'vm',
    'url',
    // ... other Node.js built-ins used
  ],
}
```

**Risk**: Low - Safe configuration change
**Effort**: Low - Simple config update
**Effectiveness**: Limited - May reduce but not eliminate runtime wrappers

## Recommended Approach

1. **First**: Try Option 1 (upgrade Rslib/Rsbuild) - check if newer versions fix CJS runtime wrappers
2. **If upgrade doesn't help**: Implement Option 3 (post-build transform) as it's the most reliable workaround
3. **Monitor**: Track Rslib/Rspack issues for official CJS runtime wrapper fixes

## Testing Strategy

After implementing any solution:

1. Build the package: `cd packages/sdk && pnpm build`
2. Inspect output: `head -50 dist/node.cjs`
3. Verify functionality: Import and use the CJS module in a test
4. Check CI: Ensure build pipeline still works
5. Compare file sizes: Ensure transform doesn't break code

## Related Issues to Monitor

- [Rslib Issue #869](https://github.com/web-infra-dev/rslib/issues/869) - ESM output fix (closed)
- [Rspack PR #10508](https://github.com/web-infra-dev/rspack/pull/10508) - External module render enhancement
- Future Rslib/Rspack releases for CJS runtime wrapper fixes

## Conclusion

The webpack runtime wrapper in CJS output is a known limitation when using Rslib with `bundle: false`. While ESM outputs were fixed in Rsbuild 1.4.0-beta.2, CJS outputs still include runtime wrappers. The most practical solution is a post-build transform script (Option 3) until an official fix is available.
