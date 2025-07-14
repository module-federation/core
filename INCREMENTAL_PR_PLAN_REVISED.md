# Revised Incremental PR Plan for packages/enhanced Changes

## Overview
Based on a detailed diff analysis, this document provides a more accurate breakdown of changes into focused, incremental PRs. Each PR represents a distinct feature, fix, or refactor that can be merged independently.

## Updated PR Sequence

### PR 1: Runtime Safety Fixes
**Size**: Tiny (~2 files)
**Risk**: Low
**Type**: Fix
**Feature**: Add defensive checks to prevent runtime errors

**Files to include**:
- `src/lib/container/runtime/EmbedFederationRuntimeModule.ts` (add `typeof prevStartup === 'function'` check)
- `src/lib/startup/StartupHelpers.ts` (add `typeof __webpack_require__.x === "function"` check)

**Why first**: These are independent safety fixes that improve stability without any dependencies.

---

### PR 2: Hook Renaming and Cleanup
**Size**: Small (~6 files)
**Risk**: Medium (potential breaking change)
**Type**: Refactor
**Feature**: Rename container hooks for clarity and consistency

**Files to include**:
- `src/lib/container/ContainerPlugin.ts` (rename hooks, add `addRemoteDependency`)
- `src/lib/container/runtime/FederationRuntimePlugin.ts`
- `src/lib/container/runtime/FederationModulesPlugin.ts`
- `src/lib/container/runtime/EmbedFederationRuntimePlugin.ts`
- `src/lib/container/RemoteModule.ts` (use new hook)

**Changes**:
- `addContainerEntryModule` → `addContainerEntryDependency`
- `addFederationRuntimeModule` → `addFederationRuntimeDependency`
- Add new `addRemoteDependency` hook

**Implementation with backward compatibility**:
```javascript
compiler.hooks.addContainerEntryDependency = new SyncHook([...]);
compiler.hooks.addContainerEntryModule = compiler.hooks.addContainerEntryDependency; // deprecated
```

---

### PR 3: Enhanced HoistContainerReferencesPlugin
**Size**: Medium (~3 files)
**Risk**: Medium
**Type**: Feature/Fix
**Feature**: Improve module hoisting for runtime chunks

**Files to include**:
- `src/lib/container/HoistContainerReferencesPlugin.ts` (complete rewrite)
- `test/compiler-unit/container/HoistContainerReferencesPlugin.test.ts` (new tests)
- Related test fixtures

**Depends on**: PR 2 (needs renamed hooks)

**Key improvements**:
- Separate handling for container, federation, and remote dependencies
- Better support for `runtimeChunk: 'single'` configuration
- Proper remote module hoisting

---

### PR 4: Basic Share Filtering - Include/Exclude by Version
**Size**: Medium (~12 files)
**Risk**: Low
**Type**: Feature
**Feature**: Filter shared modules by version constraints

**Files to include**:
- `src/lib/sharing/utils.ts` (add `testRequestFilters`, `addSingletonFilterWarning`)
- `src/lib/sharing/ConsumeSharedPlugin.ts` (add version-based filtering)
- `src/lib/sharing/ProvideSharedPlugin.ts` (add version-based filtering)
- `src/schemas/sharing/ConsumeSharedPlugin.json` (add include/exclude schema)
- `src/schemas/sharing/ConsumeSharedPlugin.ts`
- `src/schemas/sharing/ConsumeSharedPlugin.check.ts`
- `src/schemas/sharing/ProvideSharedPlugin.json`
- `src/schemas/sharing/ProvideSharedPlugin.ts`
- `src/schemas/sharing/ProvideSharedPlugin.check.ts`
- `test/unit/sharing/utils-filtering.test.ts` (new)
- `test/configCases/sharing/share-multiple-versions-include/*` (new)
- `test/configCases/sharing/share-multiple-versions-exclude/*` (new)

**API**:
```javascript
shared: {
  react: {
    include: { version: "^18.0.0" },
    exclude: { version: "17.x" }
  }
}
```

---

### PR 5: Request Pattern Filtering
**Size**: Small (~8 files)
**Risk**: Low
**Type**: Feature
**Feature**: Filter shared modules by request patterns

**Files to include**:
- `src/lib/sharing/ConsumeSharedPlugin.ts` (add request pattern support)
- `src/lib/sharing/ProvideSharedPlugin.ts` (add request pattern support)
- Update schemas for request patterns
- `test/configCases/sharing/prefix-share-filter/*` (new)
- Related unit tests

**Depends on**: PR 4 (builds on filtering infrastructure)

**API**:
```javascript
shared: {
  "@scope/*": {
    include: { request: /^@scope\/[^\/]+$/ }
  }
}
```

---

### PR 6: Fallback Version Support
**Size**: Small (~6 files)
**Risk**: Low
**Type**: Feature
**Feature**: Add fallback version checking for filters

**Files to include**:
- `src/lib/sharing/ConsumeSharedPlugin.ts` (add fallbackVersion logic)
- `src/lib/sharing/ProvideSharedPlugin.ts` (add fallbackVersion logic)
- Schema updates for fallbackVersion
- Unit tests for fallback version
- Integration tests

**Depends on**: PR 4

**API**:
```javascript
shared: {
  react: {
    include: { 
      version: "^18.0.0",
      fallbackVersion: "^17.0.0"
    }
  }
}
```

---

### PR 7: nodeModulesReconstructedLookup Feature
**Size**: Medium (~10 files)
**Risk**: Low
**Type**: Feature
**Feature**: Enable path reconstruction for node_modules resolution

**Files to include**:
- `src/lib/sharing/utils.ts` (add `extractPathAfterNodeModules`)
- `src/lib/sharing/ConsumeSharedPlugin.ts` (add two-stage lookup)
- `src/lib/sharing/ProvideSharedPlugin.ts` (add two-stage lookup)
- Schema updates for nodeModulesReconstructedLookup
- `test/configCases/sharing/share-deep-module/*` (new)
- Related unit tests

**Depends on**: PR 4 (uses filtering infrastructure)

---

### PR 8: SharePlugin - Unified API
**Size**: Medium (~8 files)
**Risk**: Low
**Type**: Feature
**Feature**: New SharePlugin that combines consume and provide

**Files to include**:
- `src/lib/sharing/SharePlugin.ts` (add schema validation)
- `src/index.ts` (export SharePlugin)
- `src/schemas/sharing/SharePlugin.json` (new)
- `src/schemas/sharing/SharePlugin.ts` (new)
- `src/schemas/sharing/SharePlugin.check.ts` (new)
- `test/unit/sharing/SharePlugin.test.ts`
- `test/compiler-unit/sharing/SharePlugin.test.ts` (new)

**Depends on**: PR 4-7 (passes through all filtering options)

---

### PR 9: Enhanced Layer Support
**Size**: Small (~6 files)
**Risk**: Low
**Type**: Feature/Fix
**Feature**: Improve layer handling and issuerLayer fallback

**Files to include**:
- `src/lib/sharing/ConsumeSharedModule.ts` (layer parameter)
- `src/lib/sharing/ConsumeSharedFallbackDependency.ts` (layer support)
- `src/lib/sharing/resolveMatchedConfigs.ts` (issuerLayer priority)
- `src/lib/sharing/utils.ts` (createLookupKeyForSharing)
- Layer-specific tests
- Unit tests for issuerLayer fallback (PR #3893)

---

### PR 10: Module Exports and API Surface
**Size**: Tiny (~3 files)
**Risk**: Low
**Type**: Feature
**Feature**: Export internal modules for advanced usage

**Files to include**:
- `src/index.ts` (add ConsumeSharedModule, ProvideSharedModule exports)
- Declaration file updates
- Documentation

---

### PR 11: Comprehensive Test Suite
**Size**: Large (test-only)
**Risk**: None
**Type**: Test
**Feature**: Additional test coverage and edge cases

**Files to include**:
- Remaining test files not included in feature PRs
- `test/helpers/webpack.ts`
- Additional unit test coverage
- Edge case tests

**Depends on**: All feature PRs

---

### PR 12: Package Updates and Cleanup
**Size**: Small
**Risk**: Low
**Type**: Chore
**Feature**: Update dependencies and final cleanup

**Files to include**:
- `package.json`
- `pnpm-lock.yaml`
- `.cursorrules` (editor configuration file)
- `src/scripts/compile-schema.js` (if needed)

## Key Insights from Analysis

1. **Runtime Safety Fixes** are completely independent and should go first
2. **Hook Renaming** is a prerequisite for the hoisting improvements
3. **Share Filtering** can be broken into smaller pieces:
   - Version filtering (core functionality)
   - Request pattern filtering (builds on version)
   - Fallback version support (enhancement)
   - nodeModulesReconstructedLookup (separate feature)
4. **Layer Support** improvements are somewhat independent but share some utilities
5. **Test files** are well-organized and can be included with their respective features

## Dependency Graph

```
PR 1 (Runtime Fixes) ──────────────────> (Independent)

PR 2 (Hook Renaming) ──────────────────> PR 3 (Hoisting)

PR 4 (Version Filter) ──┬──> PR 5 (Request Filter)
                        ├──> PR 6 (Fallback Version)
                        └──> PR 7 (nodeModules Lookup) ──> PR 8 (SharePlugin)

PR 9 (Layer Support) ──────────────────> (Semi-independent)

PR 10 (Exports) ───────────────────────> (Independent)

All Feature PRs ───────────────────────> PR 11 (Tests) ──> PR 12 (Cleanup)
```

## Benefits of This Revised Plan

1. **Clearer Separation**: Each PR has a distinct purpose
2. **Reduced Risk**: Smaller, focused changes are easier to review and test
3. **Flexibility**: Some PRs can be developed in parallel
4. **Progressive Enhancement**: Each filtering feature builds on the previous
5. **Early Wins**: Runtime fixes and hook renaming can be merged quickly