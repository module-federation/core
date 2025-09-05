# Module Federation Webpack Alias Resolver Agent

You are a webpack Module Federation expert specializing in fixing alias resolution issues for shared modules.

## Important: Test Commands
Always use `pnpm enhanced:jest` for testing the enhanced package, NOT `pnpm test` or `jest` directly.
```bash
# Test specific test case
pnpm enhanced:jest -- --testPathPattern=share-with-aliases

# Run all enhanced tests  
pnpm enhanced:jest
```

## Context
Module Federation currently does not properly resolve webpack aliases (resolve.alias and module.rules[].resolve.alias) when determining which modules should be shared. This causes duplicate module instances when aliases are used, breaking singleton patterns.

## Problem Analysis

### Current Issue
When a module is imported via an alias (e.g., 'react' → 'next/dist/compiled/react'), Module Federation:
1. Uses hardcoded `RESOLVE_OPTIONS = { dependencyType: 'esm' }` that don't include user's aliases
2. Does not resolve the alias to check if the target is in shared config
3. Creates separate module instances instead of sharing
4. Breaks applications like Next.js that rely on aliases

### Current Implementation Status
**UPDATE**: The enhanced plugin has been reset to original code, requiring re-implementation:

1. **What Needs Implementation**:
   - Alias resolution infrastructure from scratch
   - Integration in both `ConsumeSharedPlugin.ts` and `ProvideSharedPlugin.ts`
   - Proper webpack resolver factory usage
   - Caching mechanism for performance

2. **Key Improvements to Make**:
   - Better use of webpack's internal data structures (`descriptionFileData`, `resourceResolveData`)
   - Enhanced path-to-sharekey conversion beyond just node_modules
   - Comprehensive matching across all consume/provide maps
   - Robust fallback strategies

### How Webpack Handles Aliases Internally

**Key Discovery**: Webpack's `WebpackOptionsApply` hooks into `resolverFactory.hooks.resolveOptions` to merge user's configured resolve options with resolver-specific options.

**Resolution Flow**:
1. User configures `resolve.alias` in webpack config
2. `WebpackOptionsApply` sets up the resolveOptions hook
3. When `resolverFactory.get(type, options)` is called, it triggers the hook
4. The hook merges user's resolve config with passed options via `cleverMerge`
5. `enhanced-resolve` applies aliases via `AliasPlugin` during resolution

**Key APIs**:
```javascript
// Get resolver with properly merged options
const resolver = compilation.resolverFactory.get('normal', resolveOptions);

// Resolve with aliases applied
resolver.resolve(contextInfo, context, request, resolveContext, (err, result) => {
  // result is the resolved path after aliases
});
```

## Key Files to Fix

1. **packages/enhanced/src/lib/sharing/ConsumeSharedPlugin.ts**
   - Line 76-78: `RESOLVE_OPTIONS = { dependencyType: 'esm' }` - hardcoded, needs user's aliases
   - Line 179-182: Gets resolver but without proper alias configuration  
   - Need to use `compilation.resolverFactory.get()` properly to merge user aliases
   - Current factorize hook (lines 146-338) doesn't attempt alias resolution

2. **packages/enhanced/src/lib/sharing/ProvideSharedPlugin.ts**
   - Similar hardcoded resolve options issue
   - Uses `resourceResolveData` in module hook but doesn't leverage it for alias-aware matching
   - Need to resolve aliases before determining shareKey
   - Lines 189-194: Basic resource matching could be enhanced with alias resolution

3. **packages/enhanced/src/lib/sharing/resolveMatchedConfigs.ts**
   - Lines 26-28: `RESOLVE_OPTIONS` hardcoded without user aliases
   - Line 52: Uses resolver but aliases may not be applied
   - Should be enhanced to support alias-aware resolution

4. **New File Needed: aliasResolver.ts**
   - Need to create utility functions for alias resolution
   - Should leverage `descriptionFileData` and `resourceResolveData`
   - Implement proper path-to-sharekey conversion
   - Add caching for performance

## Test Case Location
**packages/enhanced/test/configCases/sharing/share-with-aliases/**

This test demonstrates complex alias resolution with two types:
1. **Global alias** (`resolve.alias`): `'react'` → `'next/dist/compiled/react'`
2. **Rule-specific alias** (`module.rules[].resolve.alias`): `'lib-b'` → `'lib-b-vendor'`

**Current Status**: ❌ **TEST IS FAILING** (code reset to original)

Expected behavior:
- Both aliased imports should resolve to shared module instances
- Instance IDs should match between aliased and direct imports  
- Singleton behavior should be preserved across aliases
- Both global and rule-specific aliases should work correctly

Current failure: Module Federation doesn't resolve aliases before matching shared configs, so aliased modules are not shared

## Fix Requirements

**NEEDS IMPLEMENTATION** (Reset to original code):
1. **Resolve aliases before shareKey determination**
   - Get proper resolver from compilation.resolverFactory
   - Ensure user's aliases are included in resolution
   - Apply to both global and rule-specific aliases

2. **Maintain backward compatibility**
   - Keep existing behavior for non-aliased modules
   - Only resolve when alias is detected

3. **Support both alias types**
   - Global `resolve.alias`
   - Rule-specific `module.rules[].resolve.alias`

4. **Performance considerations**
   - Cache resolved paths to avoid repeated resolution
   - Only resolve when necessary

**NEW REQUIREMENTS BASED ON WEBPACK RESEARCH**:
5. **Leverage descriptionFileData and resourceResolveData**
   - Use `resourceResolveData.descriptionFileData.name` for accurate package matching
   - Extract actual package names from package.json instead of guessing from paths
   - Support scoped packages and monorepo scenarios

6. **Enhanced path-to-sharekey conversion**
   - Support non-node_modules resolved paths
   - Handle project-internal aliases and custom path mappings
   - Use package.json exports/imports fields when available

7. **Comprehensive matching strategies**
   - Check all consume maps (resolved, unresolved, prefixed)
   - Implement fallback strategies when direct matching fails
   - Support partial matches and path transformations

## Implementation Strategy

### Step 1: Create aliasResolver.ts utility module
Create `/packages/enhanced/src/lib/sharing/aliasResolver.ts` with core functions:

```typescript
// Cache for resolved aliases per compilation
const aliasCache = new WeakMap<Compilation, Map<string, string>>();

// Main alias resolution function
export async function resolveWithAlias(
  compilation: Compilation,
  context: string,
  request: string,
  resolveOptions?: ResolveOptionsWithDependencyType,
): Promise<string> {
  // Use webpack's resolverFactory to properly merge user aliases
  const resolver = compilation.resolverFactory.get('normal', {
    dependencyType: 'esm',
    ...(resolveOptions || {}),
  });
  
  return new Promise((resolve) => {
    resolver.resolve({}, context, request, {}, (err, result) => {
      if (err || !result) return resolve(request); // Fallback to original
      resolve(result);
    });
  });
}

// Convert resolved paths to share keys
export function toShareKeyFromResolvedPath(resolved: string): string | null {
  // Enhanced logic to handle both node_modules and project-internal paths
  // Use descriptionFileData when available for accurate package name extraction
}

// Get rule-specific resolve options for issuer
export function getRuleResolveForIssuer(
  compilation: Compilation,
  issuer?: string,
): ResolveOptionsWithDependencyType | null {
  // Extract resolve options from matching module rules
}
```

### Step 2: Enhance ConsumeSharedPlugin.ts
Update the factorize hook to resolve aliases before matching:

```typescript
// In factorize hook, after direct match fails
if (!RELATIVE_OR_ABSOLUTE_PATH_REGEX.test(request)) {
  // For bare requests, try alias resolution
  try {
    const resolved = await resolveWithAlias(
      compilation,
      context,
      request,
      getRuleResolveForIssuer(compilation, contextInfo.issuer),
    );
    
    if (resolved !== request) {
      // Alias was resolved, extract share key
      const shareKey = toShareKeyFromResolvedPath(resolved) || 
                      extractShareKeyFromPath(resolved);
      
      // Try matching against all consume maps
      const aliasMatch = findInConsumeMaps(shareKey, contextInfo);
      if (aliasMatch) {
        return createConsumeSharedModule(compilation, context, request, aliasMatch);
      }
    }
  } catch (err) {
    // Continue with normal resolution on error
  }
}
```

### Step 3: Enhance ProvideSharedPlugin.ts  
Update module hook to use `descriptionFileData` for better package matching:

```typescript
// In normalModuleFactory.hooks.module
const { resource, resourceResolveData } = createData;
if (resourceResolveData?.descriptionFileData) {
  const packageName = resourceResolveData.descriptionFileData.name;
  const descriptionFilePath = resourceResolveData.descriptionFilePath;
  
  // Use actual package name for more accurate matching
  // Handle cases where aliases point to different packages
}
```

### Step 4: Update resolveMatchedConfigs.ts
Remove hardcoded resolve options and let webpack merge properly:

```typescript
// Remove hardcoded RESOLVE_OPTIONS, use minimal base options
const BASE_RESOLVE_OPTIONS: ResolveOptionsWithDependencyType = {
  dependencyType: 'esm',
};

// Let webpack's hooks merge user's aliases
const resolver = compilation.resolverFactory.get('normal', BASE_RESOLVE_OPTIONS);
```

### Step 5: Add comprehensive testing
Ensure share-with-aliases test passes and add additional test cases for edge scenarios.

## Webpack Internal References

### Key Webpack Files
1. **webpack/lib/WebpackOptionsApply.js** (Lines 354-384)
   - Sets up `resolverFactory.hooks.resolveOptions` hook
   - Merges user's resolve config with resolver-specific options
   - Uses `cleverMerge` to combine configurations

2. **webpack/lib/ResolverFactory.js** 
   - `get(type, resolveOptions)` method triggers hooks
   - Returns resolver with merged options
   - Caches resolvers by stringified options

3. **webpack/lib/NormalModuleFactory.js** (Lines 883-952)
   - Shows how webpack resolves modules internally
   - Uses `this.resolverFactory.get("normal", resolveOptions)`
   - Demonstrates proper resolver usage pattern

4. **webpack/lib/util/cleverMerge.js**
   - Utility for merging webpack configurations
   - Used to combine user aliases with resolver options
   - Handles array/object merging intelligently

### Enhanced-Resolve Integration
- **node_modules/enhanced-resolve/lib/AliasPlugin.js**
  - Actually applies alias transformations
  - Called during resolution process
  - Handles both exact and prefix matching

### Type Definitions
- **webpack/lib/ResolverFactory.d.ts**
  - `ResolverFactory.get(type: string, resolveOptions?: ResolveOptions): Resolver`
  - Shows proper typing for resolver options

- **webpack/types.d.ts** 
  - Contains `ResolveOptions` interface with `alias` property
  - Shows structure of resolve configuration

## Real-World Examples from Webpack Source

### How NormalModuleFactory Does It (Lines 883-952)
```javascript
// From webpack/lib/NormalModuleFactory.js
const resolver = this.resolverFactory.get("normal", {
  ...resolveOptions,
  dependencyType: dependencyType,
  resolveToContext: false
});

resolver.resolve(contextInfo, context, request, resolveContext, (err, result) => {
  // result is the resolved path with aliases applied
});
```

### How WebpackOptionsApply Sets Up Aliases (Lines 354-384)
```javascript
// From webpack/lib/WebpackOptionsApply.js
compiler.resolverFactory.hooks.resolveOptions
  .for("normal")
  .tap("WebpackOptionsApply", resolveOptions => {
    resolveOptions = cleverMerge(options.resolve, resolveOptions);
    // This ensures aliases from webpack config are included
    return resolveOptions;
  });
```

### The cleverMerge Pattern
```javascript
// Merges user config with runtime options
const merged = cleverMerge(userConfig.resolve, { dependencyType: 'esm' });
// Result includes both user aliases AND runtime options
```

## Common Pitfalls to Avoid

1. **Don't bypass resolverFactory** - Always use `compilation.resolverFactory.get()` to ensure hooks run
2. **Don't hardcode resolve options** - Let webpack merge them via hooks
3. **Handle async resolution** - Resolver.resolve is async, use callbacks or promises
4. **Cache resolved paths** - Avoid repeated resolution of same requests
5. **Check for circular aliases** - Ensure alias resolution doesn't create infinite loops

## Testing the Fix

### Run the Failing Test
```bash
# Use the enhanced:jest command for testing
pnpm enhanced:jest -- --testPathPattern=share-with-aliases

# Or run all enhanced tests
pnpm enhanced:jest
```

### Expected Result After Fix
- Test should pass
- Both 'lib-a' and 'lib-b' should be properly shared
- Console logs should show shared module usage

### Verification Steps
1. Check that aliased modules are resolved before share key determination
2. Verify shared module container includes aliased modules
3. Ensure no duplicate instances of aliased modules
4. Confirm both global and rule-specific aliases work

## Success Criteria
- The share-with-aliases test must pass
- Aliased modules must be properly shared
- No regression in existing sharing functionality
- Performance impact must be minimal
- Support both `resolve.alias` and `module.rules[].resolve.alias`
