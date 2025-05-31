# Webpack Custom HMR Demo

This example demonstrates a custom Webpack Hot Module Replacement (HMR) implementation with programmatic updates and manual cache management. It shows how to build a custom HMR system that can apply multiple updates programmatically without relying on file system changes.

## How It Works

- **Custom HMR Runtime**: Implements custom HMR logic using webpack's module system
- **Programmatic Updates**: Applies multiple HMR updates in sequence without file changes
- **Manual Cache Management**: Manually manages module cache and dependencies
- **Custom Update Content**: Generates update content programmatically for demonstration

## Key Features

- ✅ Custom HMR implementation
- ✅ Programmatic update application
- ✅ Manual module cache management
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
npm run demo:file-based    # Run file-based HMR demo
```

## Demo Scenarios

### Programmatic Demo
Runs 4 HMR updates in sequence:
1. **Update 1**: Initial module loading
2. **Update 2**: Update both entrypoint modules with new messages
3. **Update 3**: Further updates to entrypoint modules
4. **Update 4**: Final update to main index module

### File-Based Demo
Standard webpack HMR with file watching and automatic updates.

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

1. **Update Definition**: Each update defines new module content
2. **Cache Management**: Manually clears and updates module cache
3. **Dependency Resolution**: Handles module dependencies correctly
4. **State Preservation**: Maintains application state across updates

### Update Content Generation

Generates update content for different iterations:

```javascript
const updates = {
  1: {
    'entrypoint1.js': {
      content: `module.exports = { message: "Update 1", applied: true };`
    },
    'entrypoint2.js': {
      content: `module.exports = { message: "Update 1", applied: true };`
    }
  },
  // ... more updates
};
```

### Custom HMR Helpers

The `custom-hmr-helpers.js` provides:

- **Module Cache Management**: Functions to clear and update module cache
- **Dependency Tracking**: Track and update module dependencies
- **Update Application**: Apply updates with proper error handling
- **State Migration**: Preserve state between updates

## HMR Update Flow

1. **Update Trigger**: Programmatic or file-based trigger
2. **Content Generation**: Generate new module content
3. **Cache Invalidation**: Clear affected modules from cache
4. **Module Replacement**: Replace modules with new content
5. **Dependency Update**: Update dependent modules
6. **Accept Handler**: Execute custom accept logic
7. **State Preservation**: Maintain application state
8. **Error Handling**: Handle any update failures

## Advanced Features

### Manual Cache Management

```javascript
// Clear module from cache
delete require.cache[require.resolve('./module')];

// Update module with new content
const newModule = require('./module');
```

### Custom Update Logic

```javascript
function applyCustomUpdate(moduleId, newContent) {
  // Custom logic for applying updates
  const module = require.cache[moduleId];
  if (module) {
    // Update module exports
    Object.assign(module.exports, newContent);
  }
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

- **Module Not Accepted**: Ensure proper `module.hot.accept()` calls
- **Cache Issues**: Verify manual cache management logic
- **Dependency Problems**: Check module dependency resolution
- **State Loss**: Implement proper state preservation

### Debug Tips

- Enable detailed HMR logging
- Check module cache state
- Verify update content generation
- Test error recovery scenarios
