# ErrorLoadRemote Hook Lifecycle Parameter Verification Report

## Summary

This report verifies the accuracy of the errorLoadRemote hook lifecycle parameter documentation. The documentation claims that the lifecycle parameter can be: `'beforeRequest'`, `'afterResolve'`, `'onLoad'`, or `'beforeLoadShare'`.

## Verification Results

### ✅ All documented lifecycle values are verified in source code:

1. **beforeRequest** - Found in `/src/remote/index.ts:341`
   - Triggered when the `beforeRequest` hook throws an error
   - Used for initial request processing failures

2. **afterResolve** - Found in `/src/plugins/snapshot/SnapshotHandler.ts:303`
   - Triggered when manifest loading fails (most common for network failures)
   - Used for remote entry resolution errors

3. **onLoad** - Found in `/src/remote/index.ts:258`
   - Triggered when module loading and execution fails
   - Used for runtime module errors during get() calls

4. **beforeLoadShare** - Found in `/src/shared/index.ts:324`
   - Triggered when shared dependency loading fails
   - Used for shared module initialization errors

## Implementation Analysis

### Parameter Structure
Each errorLoadRemote call includes these documented parameters:
- `id: string` - The module identifier being loaded
- `error: unknown` - The error that occurred
- `options?: any` - Optional configuration
- `from: 'build' | 'runtime'` - Source of the error
- `lifecycle: 'beforeRequest' | 'afterResolve' | 'onLoad' | 'beforeLoadShare'` - Stage where error occurred
- `origin: ModuleFederation` - The ModuleFederation instance

### Return Value Expectations by Lifecycle

1. **beforeRequest**: Should return `{id, options, origin}` to continue processing
2. **afterResolve**: Should return a manifest object or undefined to let error propagate
3. **onLoad**: Should return a module factory function or module exports object
4. **beforeLoadShare**: Should return RemoteEntryExports object with `{init, get}` methods

## Test Coverage

Created comprehensive tests to verify:

1. ✅ **Basic Type Validation** - Confirms hook exists and accepts correct parameters
2. ✅ **Documentation Accuracy** - Verifies all documented lifecycle values exist in source code
3. ✅ **Parameter Structure** - Validates that all documented parameters are passed
4. ✅ **Return Value Handling** - Tests appropriate return values for each lifecycle
5. ✅ **Source Code Analysis** - Confirms no additional undocumented lifecycle values exist

## Test Files Created

1. `errorLoadRemote-lifecycle.spec.ts` - Comprehensive integration tests with mock scenarios
2. `errorLoadRemote-lifecycle-simple.spec.ts` - Unit tests for type validation
3. `errorLoadRemote-documentation-validation.spec.ts` - Source code analysis tests

## Conclusion

**✅ The documentation is ACCURATE**

All four documented lifecycle parameter values (`beforeRequest`, `afterResolve`, `onLoad`, `beforeLoadShare`) are correctly implemented in the source code and match their documented behavior. The parameter structure and return value expectations also align with the implementation.

## Recommendations

1. The current documentation accurately reflects the implementation
2. The test suite provides comprehensive coverage for future regression testing
3. Any future changes to lifecycle values should update both documentation and tests
4. Consider adding more detailed examples for each lifecycle stage in the documentation

## Source Code Locations

- **Remote Handler**: `packages/runtime-core/src/remote/index.ts` (lines 258, 341)
- **Shared Handler**: `packages/runtime-core/src/shared/index.ts` (line 324)  
- **Snapshot Handler**: `packages/runtime-core/src/plugins/snapshot/SnapshotHandler.ts` (line 303)
- **Hook Definition**: `packages/runtime-core/src/remote/index.ts` (lines 109-125)