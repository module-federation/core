# Webpack Custom HMR Demo

This example demonstrates a custom Webpack Hot Module Replacement (HMR) implementation with programmatic updates and automatic cache management. It shows how to build a custom HMR system that can apply multiple updates programmatically without relying on file system changes.

## How It Works

- **Custom HMR Runtime**: Implements custom HMR logic using webpack's module system
- **Programmatic Updates**: Applies multiple HMR updates in sequence without file changes
- **Automatic Cache Management**: Leverages Webpack's internal HMR mechanisms for automatic module updates and cache management.
- **Custom Update Content**: Generates update content programmatically for demonstration

## Key Features

- ✅ Custom HMR implementation
- ✅ Programmatic update application
- ✅ Integration with Webpack's HMR for cache and module management
- ✅ Multiple update iterations
- ✅ Custom update content generation
- ✅ Comprehensive error handling

## Files

- `src/index.js` - Main application with custom HMR logic and update definitions
- `src/custom-hmr-helpers.js` - Custom HMR helper functions and utilities
- `webpack.config.js` - Webpack configuration for custom HMR setup
- `package.json` - Project configuration with demo scripts

## Usage

```bash
npm install
npm run build              # Build the project
npm run demo:programmatic  # Run programmatic HMR demo
```

## Demo Scenarios

### Programmatic Demo
Runs 4 HMR updates in sequence:
1. **Update 1**: Updates both entrypoint modules with new messages and counter values
2. **Update 2**: Further updates to entrypoint modules with "hot reloaded" messages
3. **Update 3**: Updates entrypoint modules with "final update" messages
4. **Update 4**: Final update to the main index module that completes the demo

## Technical Details

### Custom HMR Runtime

The custom implementation includes:

```javascript
// Custom HMR accept handler
if (module.hot) {
  module.hot.accept(['./entrypoint1', './entrypoint2'], function() {
    console.log('[HMR] Entrypoint modules updated');
    // Custom update logic
  });
  
  module.hot.accept(function(err) {
    if (err) {
      console.error('[HMR] Error accepting updates:', err);
    }
  });
}
```

### Programmatic Update System

The demo programmatically applies updates:

1. **Update Definition**: Each update defines new module content and HMR manifest.
2. **HMR Trigger**: The `custom-hmr-helpers.js` script feeds this content to the Webpack HMR runtime.
3. **Automatic Cache Management**: Webpack's HMR runtime automatically handles module cache invalidation and updates based on the provided content.
4. **Dependency Resolution**: Webpack's HMR logic manages module dependencies during the update.
5. **State Preservation**: Application state can be maintained across updates if modules are designed to preserve or restore it (e.g., using `module.hot.data` or by re-initializing with existing data).

### Update Content Generation

Generates update content for different iterations:

```javascript
const customHMRChunks = [
  {
    manifestJsonString: JSON.stringify({ c: ['index'], r: [], m: [] }),
    chunkJsString: `exports.id = 'index';
exports.modules = {
  "./src/entrypoint1.js": (module, exports, __webpack_require__) => {
    console.log('🎉✨ HMR Update 1: Entrypoint 1 updated! 🚀🔥');
    module.exports = {
      getName: () => 'Entrypoint 1',
      greet: (name = 'World') => \`Hello \${name} from Entrypoint 1!\`,
      customUpdateApplied: true,
      updateMessage: 'Hello'
    };
  }
};
// ... runtime code`
  },
  // ... more updates
];
```

### Custom HMR Helpers

The `custom-hmr-helpers.js` provides:

- **In-Memory Update Provision**: Functions to supply HMR manifest and chunk content directly to the Webpack HMR runtime.
- **HMR Orchestration**: Logic to trigger and manage the HMR process using the provided in-memory updates.
- **Integration with Webpack HMR**: Relies on Webpack's `module.hot.check()` and the underlying HMR runtime for applying changes.
- **Error Handling**: Includes error handling for the custom update application process.

## HMR Update Flow

1. **Update Trigger**: Programmatic trigger from `index.js`.
2. **Content Preparation**: HMR manifest and chunk JavaScript strings are prepared.
3. **Runtime Patching (Temporary)**: `custom-hmr-helpers.js` temporarily makes the Webpack HMR runtime aware of these in-memory strings.
4. **HMR Check**: `module.hot.check(true)` is called.
5. **Webpack HMR Process**:
    - Webpack's HMR runtime reads the (in-memory) manifest.
    - It loads the (in-memory) update chunks.
    - It invalidates and updates modules in its cache.
    - It re-runs affected modules or their accepted dependencies.
6. **Accept Handler**: Custom `module.hot.accept` handlers in `index.js` or other modules are executed.
7. **State Preservation**: Application state can be maintained depending on how modules and HMR handlers are structured.
8. **Error Handling**: Failures in the HMR process are caught and logged.
9. **Runtime Cleanup**: In-memory patches to the HMR runtime are cleared after the update attempt.

## Advanced Features

### Leveraging Webpack's Automatic HMR Cache Management

This demo leverages Webpack's own HMR capabilities for automatic cache management. When `module.hot.check(true)` is called and new module code is provided (via the patched runtime in `custom-hmr-helpers.js`), Webpack's HMR logic:
- Automatically updates its internal module cache (`__webpack_require__.c` and `__webpack_require__.m`).
- Disposes of old modules.
- Executes new module code.
- Handles the accept/decline logic.

The updates are seamlessly integrated into Webpack's existing HMR lifecycle without manual cache manipulation.

### Custom Update Logic

The custom HMR helpers provide in-memory update content to Webpack's HMR runtime:

```javascript
// Example from custom-hmr-helpers.js
function applyHotUpdateFromStringsByPatching(__webpack_require__, manifestJsonString, chunkJsString) {
  // Patches Webpack's HMR runtime to use in-memory content
  // Triggers module.hot.check(true) for automatic updates
}
```

### Error Recovery

```javascript
try {
  applyHMRUpdate(updateContent);
} catch (error) {
  console.error('[HMR] Update failed:', error);
  // Implement fallback logic
  restorePreviousState();
}
```

## Configuration

### Webpack Setup

```javascript
module.exports = {
  mode: 'development',
  entry: './src/index.js',
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ],
  devServer: {
    hot: true
  }
};
```

### Custom HMR Options

- **Update Intervals**: Configure timing between updates
- **Error Handling**: Custom error recovery strategies
- **State Management**: Advanced state preservation
- **Logging**: Detailed logging of HMR operations

## Advantages

- **Full Control**: Complete control over HMR behavior
- **Programmatic Updates**: Apply updates without file changes
- **Custom Logic**: Implement domain-specific update handling
- **Testing**: Easy to test HMR scenarios programmatically
- **Debugging**: Detailed visibility into HMR process
- **Flexibility**: Adapt to specific application requirements

## Use Cases

- Custom development tools and frameworks
- Applications with complex update requirements
- Testing HMR behavior and edge cases
- Building HMR-enabled libraries and tools
- Advanced webpack plugin development
- Debugging and analyzing HMR performance

## Troubleshooting

### Common Issues

- **Module Not Accepted**: Ensure proper `module.hot.accept()` calls are in place for the modules being updated or their parents. If an update bubbles up to the top and isn't accepted, a full reload might be triggered by Webpack.
- **Webpack HMR Errors**: Check the browser console or Node output for errors originating from Webpack's HMR runtime. These can indicate issues with the update content, manifest, or the HMR process itself.
- **State Loss**: If state is not being preserved, ensure your HMR accept handlers correctly re-initialize or migrate state. For modules that self-accept or are re-required, they need to handle their own state. Webpack's HMR doesn't automatically preserve all state.
- **Incorrect Update Content**: Ensure the JavaScript strings for HMR chunks and the manifest JSON are correctly formatted and represent valid updates.

### Debug Tips

- Enable detailed HMR logging
- Check module cache state
- Verify update content generation
- Test error recovery scenarios
