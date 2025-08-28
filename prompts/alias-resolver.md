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
   - Line 74: `RESOLVE_OPTIONS = { dependencyType: 'esm' }` - needs user's aliases
   - Line 177-180: Gets resolver but without proper alias configuration
   - Need to use `compilation.resolverFactory.get()` instead of direct resolver

2. **packages/enhanced/src/lib/sharing/ProvideSharedPlugin.ts**
   - Similar issues with hardcoded resolve options
   - Need to resolve aliases before determining shareKey

3. **packages/enhanced/src/lib/sharing/resolveMatchedConfigs.ts**
   - Centralized location for resolving shared module paths
   - Should resolve aliases here before matching

## Test Case Location
**packages/enhanced/test/configCases/sharing/share-with-aliases/**

This test currently FAILS because:
- app.js imports 'lib-a' and 'lib-b' (both aliased)
- webpack.config.js has:
  - `resolve.alias: { 'lib-a': 'lib-a-vendor' }`
  - `module.rules[0].resolve.alias: { 'lib-b': 'lib-b-vendor' }`
- Both lib-a-vendor and lib-b-vendor are configured as shared
- But Module Federation doesn't resolve aliases, so they're not shared

## Fix Requirements

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

## Implementation Strategy

### Step 1: Fix RESOLVE_OPTIONS in ConsumeSharedPlugin.ts
Replace hardcoded `{ dependencyType: 'esm' }` with proper resolver retrieval:

```javascript
// CURRENT (BROKEN):
const RESOLVE_OPTIONS = { dependencyType: 'esm' };
const resolver = compilation.resolverFactory.get('normal', RESOLVE_OPTIONS);

// FIXED:
// Let webpack merge user's resolve options properly
const resolver = compilation.resolverFactory.get('normal', { 
  dependencyType: 'esm',
  // resolverFactory.hooks.resolveOptions will merge user's aliases
});
```

### Step 2: Add Alias Resolution Helper
Create a helper function to resolve aliases before matching:

```javascript
async function resolveWithAlias(
  compilation: Compilation,
  context: string,
  request: string,
  resolveOptions?: ResolveOptions
): Promise<string> {
  return new Promise((resolve, reject) => {
    const resolver = compilation.resolverFactory.get('normal', resolveOptions || {});
    const resolveContext = {};
    
    resolver.resolve({}, context, request, resolveContext, (err, result) => {
      if (err) return resolve(request); // Fallback to original on error
      resolve(result || request);
    });
  });
}
```

### Step 3: Update Share Key Resolution
In `resolveMatchedConfigs.ts` or similar, resolve aliases before matching:

```javascript
// Before matching shared configs
const resolvedRequest = await resolveWithAlias(
  compilation,
  issuer,
  request,
  resolveOptions
);

// Then use resolvedRequest for matching
const shareKey = getShareKey(resolvedRequest, sharedConfig);
```

### Step 4: Handle Rule-Specific Aliases
Support both global and rule-specific aliases:

```javascript
// Get resolve options from matching rule if available
const matchingRule = getMatchingRule(request, compilation.options.module.rules);
const resolveOptions = matchingRule?.resolve || compilation.options.resolve;
```

### Step 5: Update Tests
Ensure share-with-aliases test passes after fix.

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
