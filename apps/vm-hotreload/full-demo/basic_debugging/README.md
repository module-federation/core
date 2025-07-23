# HMR Basic Debugging with Callback Providers

This HMR debugging tool has been refactored to use configurable update providers instead of requiring a backend API. This makes it much more flexible and easier to test.

## Overview

Instead of fetching updates from a fixed backend endpoint, the system now uses configurable "update providers" - functions that can be swapped out to provide updates from any source.

## Quick Start

```javascript
const {
  setUpdateProvider,
  createQueueUpdateProvider,
  createCallbackUpdateProvider,
} = require('./src/index.js');

// Option 1: Use a queue of predefined updates
const updates = [/* your update objects */];
const queueProvider = createQueueUpdateProvider(updates);
setUpdateProvider(queueProvider);

// Option 2: Use a custom callback function
const callbackProvider = createCallbackUpdateProvider(async (currentHash) => {
  // Your custom logic here
  return { update: myUpdateObject };
});
setUpdateProvider(callbackProvider);
```

## Available Update Providers

### 1. Default Provider
Returns no updates (used when no provider is configured).

```javascript
const provider = createDefaultUpdateProvider();
```

### 2. Queue Provider
Serves updates from a predefined array, one at a time.

```javascript
const updates = [
  {
    manifest: { h: 'abc123', c: ['index'], r: ['index'], m: ['./src/index.js'] },
    script: '/* your updated module code */',
    originalInfo: { updateId: 'update-001', webpackHash: 'abc123' }
  }
];
const provider = createQueueUpdateProvider(updates);
```

### 3. Callback Provider
Uses a custom async function to generate updates dynamically.

```javascript
const provider = createCallbackUpdateProvider(async (currentHash) => {
  // Custom logic to determine if update is needed
  if (shouldUpdate()) {
    return { update: generateUpdate() };
  }
  return { update: null };
});
```

### 4. Custom Providers
You can create any custom provider that returns the expected format:

```javascript
async function myCustomProvider() {
  // Your custom logic
  return {
    update: updateObject || null
  };
}

setUpdateProvider(myCustomProvider);
```

## Force Update Mode

The system supports "force mode" which allows you to apply updates even when no actual update data is available. This is useful for:

- **Testing HMR infrastructure** - Verify the update mechanism works
- **Debugging module reloading** - Force reinstall current modules to test reload behavior  
- **Development workflows** - Trigger reloads without changing code

### Using Force Mode

#### Manual Force Update
```javascript
// Manually trigger a force update
await forceUpdate();
```

#### Force Apply with Custom Data
```javascript
// Force apply even with empty/null data
await applyUpdates(null, true);

// Force apply with partial update (manifest will be auto-populated)
const partialUpdate = {
  update: {
    manifest: { h: 'test', c: [], r: [], m: [] }, // Empty arrays get populated
    script: 'console.log("Custom force update");',
    originalInfo: { updateId: 'custom-force', webpackHash: 'test' }
  }
};
await applyUpdates(partialUpdate, true);
```

#### Force Polling
```javascript
// Start polling in force mode - applies updates even when none available
const interval = await startUpdatePolling(3000, true);
```

#### Force Demo Run
```javascript
// Run demo with force mode
await runDemo(true);
```

### How Force Mode Works

1. **No Early Return**: When `force=true`, the function won't exit early for empty updates
2. **Auto-Generated Updates**: If no update data exists, creates a minimal update from current webpack state
3. **Manifest Population**: Empty manifest arrays are populated with current webpack module information:
   - `c` (chunks): From `__webpack_require__.hmrS_readFileVm`
   - `r` (removed): From `__webpack_require__.hmrS_readFileVm` 
   - `m` (modules): From `__webpack_require__.c`
4. **Full Reinstall**: Forces the HMR system to reinstall current modules

## Update Object Format

Updates should follow this structure:

```javascript
{
  manifest: {
    h: 'webpack-hash',      // Webpack hash
    c: ['chunk-names'],     // Chunk names
    r: ['chunk-names'],     // Removed chunks
    m: ['module-ids']       // Module IDs
  },
  script: 'module-code',    // The actual updated module code
  originalInfo: {
    updateId: 'unique-id',  // Unique update identifier
    webpackHash: 'hash'     // Webpack hash
  }
}
```

## Examples

See `example-usage.js` for complete examples including:
- Queue-based updates
- Callback-based updates  
- File-based updates
- Custom provider patterns

## Running

```bash
# Build and run with webpack
npm run start

# Run directly with Node.js (for testing)
npm run dev

# Run examples
node example-usage.js
```

## API Reference

### Configuration Functions
- `setUpdateProvider(provider)` - Set the active update provider
- `getUpdateProvider()` - Get the current update provider

### Provider Factories
- `createDefaultUpdateProvider()` - Creates default (no-op) provider
- `createQueueUpdateProvider(updates)` - Creates queue-based provider
- `createCallbackUpdateProvider(callback)` - Creates callback-based provider

### Core Functions
- `fetchUpdates()` - Fetch updates using current provider
- `applyUpdates(updatesData, force=false)` - Apply fetched updates (with optional force mode)
- `startUpdatePolling(intervalMs, force=false)` - Start polling for updates (with optional force mode)
- `forceUpdate()` - Manually trigger a force update to reinstall current modules

### Utility Functions
- `incrementCounter()` - Demo counter function
- `getCounter()` - Get current counter value
- `runDemo()` - Run the demo application

## Benefits

1. **No Backend Required**: Test and develop without setting up a backend server
2. **Flexible Testing**: Easily inject test updates for unit testing
3. **Custom Sources**: Connect to any update source (files, databases, APIs, etc.)
4. **Better Isolation**: Each test can use its own update provider
5. **Easier Debugging**: Step through update logic without network calls
6. **Force Mode Support**: Test HMR infrastructure and force module reloads without actual updates
7. **Comprehensive Testing**: Verify update mechanisms work even with empty/partial data

## Migration from Backend Version

The old backend-based system has been completely replaced. If you have existing code that used the backend API, you can create a callback provider that makes the HTTP calls:

```javascript
const backendProvider = createCallbackUpdateProvider(async (currentHash) => {
  const response = await fetch(`http://localhost:3000/api/updates?currentHash=${currentHash}`);
  return await response.json();
});
setUpdateProvider(backendProvider);
``` 
