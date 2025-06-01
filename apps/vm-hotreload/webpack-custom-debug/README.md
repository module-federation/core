# Webpack Force Reload Demo

This example demonstrates a **force reload mechanism** using Webpack's Hot Module Replacement (HMR) system to simulate an application reboot without killing the Node.js process. It shows how to trigger module re-installation from original source files using empty HMR updates.

## How It Works

The force reload mechanism works by:

1. **Creating Empty HMR Updates**: Generates HMR updates with no new module content
2. **Triggering Module Re-installation**: Uses Webpack's HMR system to invalidate existing modules
3. **Resetting Application State**: Modules are re-instantiated from their original source files
4. **Preserving Process**: Achieves application restart behavior without killing the Node.js process

## Key Features

- ✅ Force reload mechanism using empty HMR updates
- ✅ Module re-installation from original files
- ✅ Application state reset without process termination
- ✅ Integration with Webpack's HMR system
- ✅ In-memory HMR runtime injection
- ✅ Comprehensive error handling

## Files

- `src/index.js` - Main demo application with HMR functionality
- `src/dashboard.js` - Dashboard module for complex demo
- `src/analytics.js` - Analytics module for complex demo
- `src/utils/` - Utility modules (Logger, DataManager, Metrics)
- `src/components/` - Component modules (UserInterface, DataVisualization)
- `src/custom-hmr-helpers.js` - In-memory HMR runtime and helper functions
- `webpack.config.js` - Webpack configuration with code splitting and HMR setup
- `package.json` - Project configuration with demo scripts

## Usage

```bash
npm install
npm run demo                 # Builds and runs the force reload demo
```

## Demo Flow

The demo runs through these steps:

1. **Initial State**: Shows modules in their original state
   - Entrypoint 1: counter = 0
   - Entrypoint 2: counter = 100

2. **State Modification**: Increments counters to demonstrate runtime changes
   - Entrypoint 1: counter = 3 (after 3 increments)
   - Entrypoint 2: counter = 102 (after 2 increments)

3. **Force Reload**: Triggers an empty HMR update that causes module re-installation
   - Creates HMR update with no new module content
   - Webpack re-installs modules from original source files

4. **Reset State**: Demonstrates complete state reset
   - Entrypoint 1: counter = 0 (back to original)
   - Entrypoint 2: counter = 100 (back to original)
   - New creation timestamps show fresh module instances

## Technical Details

### Force Reload Mechanism

The force reload creates an empty HMR update that triggers module re-installation:

```javascript
function createForceReloadUpdate() {
  return {
    manifestJsonString: JSON.stringify({
      c: ['index'], // chunks to update
      r: [], // removed chunks
      m: ['./src/dashboard.js', './src/analytics.js'] // modules to update
    }),
    chunkJsString: `exports.id = 'index';
exports.ids = null;
exports.modules = {}; // Empty - forces reload from original files
exports.runtime = /******/ function (__webpack_require__) {
  /******/ /* webpack/runtime/getFullHash */
  /******/ (() => {
    /******/ __webpack_require__.h = () => 'force-reload-${Date.now()}';
    /******/
  })();
  /******/
};`
  };
}
```

### HMR Accept Handler

The main application sets up HMR acceptance:

```javascript
if (module.hot) {
  module.hot.accept(['./dashboard', './analytics'], function() {
    console.log('[HMR] Modules updated - refreshing references');
    dashboard = require('./dashboard.js');
    analytics = require('./analytics.js');
  });
}
```

### In-Memory HMR Runtime

The `custom-hmr-helpers.js` provides:

- **Runtime Injection**: Patches Webpack's HMR runtime to support in-memory updates
- **Chunk Loading**: Custom chunk loading that reads from memory instead of filesystem
- **Update Application**: Orchestrates the HMR process using provided in-memory content
```

## Use Cases

This force reload mechanism is useful for:

- **Development Server Restarts**: Simulate server restarts without downtime
- **Configuration Reloading**: Reset application state after config changes
- **Memory Cleanup**: Clear accumulated state and start fresh
- **Testing Initialization**: Verify application startup behavior
- **State Reset**: Return to clean initial state during development

## Requirements

- Node.js
- npm or yarn
- Webpack with HMR support
