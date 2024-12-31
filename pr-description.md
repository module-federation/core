## Description

This pull request enhances the module sharing functionality in the `enhanced` package by implementing comprehensive layer support. The changes focus on improving the module federation layer system with better type safety, configuration validation, and test coverage.

### Key Changes

1. **Layer Support in Sharing Plugins**
   - Added layer-specific module loading capabilities in `ConsumeSharedModule`
   - Implemented layer context handling in `ConsumeSharedPlugin`
   - Enhanced `ProvideSharedPlugin` with layer-aware module sharing
   - Updated `SharePlugin` to support layer-based configurations

2. **Configuration Schema Updates**
   - Added new properties for layer support:
     - `layer`: Specifies the target layer for the module
     - `issuerLayer`: Defines the layer from which the module is requested
     - `requiredLayer`: Specifies layer requirements for module resolution
   - Enhanced type safety and validation for all layer-related configurations

3. **Test Infrastructure**
   - Added comprehensive test cases for layer-based module sharing
   - Implemented layer-specific loaders for testing different scenarios
   - Added test coverage for both layered and unlayered sharing configurations

### Example Configuration

```js
new SharePlugin({
  shareScope: 'default',
  shared: {
    react: {
      singleton: true,
    },
    'explicit-layer-react': {
      request: 'react/index2',
      import: 'react/index2',
      shareKey: 'react',
      singleton: true,
      issuerLayer: 'differing-layer',
      layer: 'explicit-layer',
    },
    // ... other configurations
  },
}),
```

### Technical Implementation Details

* [`ConsumeSharedModule.ts`]: Added layer resolution support with new properties
* [`ConsumeSharedPlugin.ts`]: Updated to handle layer-specific requests
* [`package.json`]: Added new Jest command for enhanced testing
* Added schema validation for new layer-related properties

## Note
Runtime module aspects will be updated in a future PR. This PR focuses on compiler mechanics for module layers.

## Types of changes

- [ ] Docs change / refactoring / dependency upgrade
- [ ] Bug fix (non-breaking change which fixes an issue)
- [x] New feature (non-breaking change which adds functionality)

## Checklist

- [x] I have added tests to cover my changes
- [x] All new and existing tests passed
- [ ] I have updated the documentation 
