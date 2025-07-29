# Module Federation Runtime Hooks - Actual vs Documented Behavior

## Executive Summary

After extensive runtime verification and code analysis, I've discovered significant discrepancies between the documented hook behavior and actual runtime implementation. Many hooks have incorrect signatures, undocumented parameters, and misleading descriptions about when they're called.

## 1. Hook Signature Discrepancies

### ❌ beforeInit
**Documented**: `{ userOptions, options, origin, shareInfo }`  
**Actual**: `{ userOptions, options, origin, shareInfo }` ✅ (Correct, but called during `formatOptions`, not plugin registration)

### ⚠️ init
**Documented**: `{ options, remote }`  
**Actual**: `{ origin, options }` - NO `remote` parameter!  
**When Called**: During `formatOptions()`, NOT during initialization as name implies

### ✅ beforeRequest
**Documented**: `{ id, origin }`  
**Actual**: `{ id, origin }` (Correct)

### ❌ afterResolve
**Documented**: `{ id, expose, remote, entry }`  
**Actual**: `{ id, expose, remote, entry, idWithoutVersion, version, entryType }`  
**Missing in Docs**: `idWithoutVersion`, `version`, `entryType`

### ⚠️ onLoad
**Documented**: `{ id, expose, remote, entry, remoteInfo }`  
**Actual**: Also includes `module` and `error` fields in certain cases  
**Critical Issue**: Return value is IGNORED despite being AsyncHook

### ❌ loadShare
**Documented**: Returns `void | false`  
**Actual**: Hook exists but is NEVER called in normal module federation flow!  
**Reality**: Only used in very specific edge cases, not general shared module loading

### ❌ beforeLoadShare
**Documented**: `{ pkgName, version, shareInfo }`  
**Actual**: `{ pkgName, shareInfo, shared, origin }` - NO `version` parameter!

## 2. Actual Hook Execution Order

Based on runtime tracing with test applications:

```
1. beforeInit (during formatOptions, not initialization)
2. init (also during formatOptions)
3. beforeRequest (when loadRemote is called)
4. afterResolve (after module path resolution)
5. onLoad (after module loads)
6. beforeLoadShare (when shared dependencies are needed)
```

**Note**: `loadShare` is almost never called in practice!

## 3. Undocumented Hooks Discovered

Through runtime analysis, these hooks exist but are not documented:

- `createScript` - Custom script loading
- `fetch` - Custom fetch implementation
- `getModuleFactory` - Internal use
- `beforeInitContainer` - Container initialization
- `initContainer` - Container setup
- `loadEntryError` - Error handling for entry loading
- `resolveShare` - Share resolution logic
- `initContainerShareScopeMap` - Share scope initialization

## 4. Hook Type Behavior

### Waterfall Hooks (data flows through chain)
- ✅ `beforeInit` - Correctly passes modified data
- ✅ `beforeRequest` - Correctly passes modified data
- ✅ `afterResolve` - Correctly passes modified data
- ✅ `beforeLoadShare` - Correctly passes modified data

### Regular Hooks (fire-and-forget)
- ❌ `init` - Documented as having return value, but it's ignored
- ❌ `onLoad` - Return value is ignored despite async nature
- ⚠️ `loadShare` - Async but rarely called

## 5. Critical Issues Found

1. **Misleading Hook Names**: `init` is called during option formatting, not initialization
2. **Missing Parameters**: Documentation missing several parameters that hooks actually receive
3. **Wrong Return Types**: Several hooks document return values that are ignored
4. **Phantom Hooks**: `loadShare` is documented as commonly used but rarely executes
5. **No Error Documentation**: Error handling behavior is completely undocumented
6. **Mutation Persistence**: Mutations between different hook types don't persist as expected

## 6. Proof from Runtime

Test plugin output shows:
```javascript
// beforeInit receives:
{ userOptions: {...}, options: {...}, origin: ModuleFederation, shareInfo: {...} }

// init receives (NO remote!):
{ origin: ModuleFederation, options: {...} }

// afterResolve receives (extra fields!):
{ 
  id: "runtime_remote/button",
  expose: "./button", 
  remote: {...},
  entry: "http://...",
  idWithoutVersion: "runtime_remote/button",
  version: "0.0.0",
  entryType: "global"
}

// beforeLoadShare receives (NO version!):
{
  pkgName: "react",
  shareInfo: {...},
  shared: {...},
  origin: ModuleFederation
}
```

## 7. Recommendations

1. **Update Documentation**: Fix all hook signatures to match actual implementation
2. **Rename Hooks**: `init` should be `afterFormatOptions` or similar
3. **Document Internal Hooks**: Either document or explicitly mark as internal
4. **Fix Return Values**: Either use return values or document they're ignored
5. **Add Examples**: Show real-world usage, especially for rarely-used hooks
6. **Error Handling**: Document how errors propagate through hooks

## Conclusion

The Module Federation hook system works, but the documentation is significantly out of sync with the implementation. Developers relying on the docs will encounter unexpected behavior, missing parameters, and hooks that don't work as described. This verification proves that a comprehensive documentation update is urgently needed.