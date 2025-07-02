# Webpack HMR Manual Demo

This example demonstrates manual Webpack Hot Module Replacement (HMR) implementation with custom update handling. It shows how to manually control the HMR process and implement custom update logic for specific modules.

## How It Works

- **Manual HMR Control**: Uses `module.hot.accept()` to manually handle module updates
- **Custom Update Logic**: Implements specific logic for handling different types of updates
- **Webpack Bundle**: Pre-built webpack bundle with HMR runtime included
- **Programmatic Updates**: Demonstrates programmatic module updates and state management

## Key Features

- ✅ Manual HMR accept handlers
- ✅ Custom update logic implementation
- ✅ Programmatic module replacement
- ✅ State preservation strategies
- ✅ Error handling for failed updates

## Files

- `index.js` - Pre-built webpack bundle with HMR runtime and demo logic
- `log-apply-result.js` - Utility for logging HMR update results
- `package.json` - Project configuration and scripts

## Usage

```bash
npm install
npm start    # Run the manual HMR demo
```

The demo will:
1. Load the webpack bundle with HMR runtime
2. Demonstrate manual module acceptance
3. Show custom update handling logic
4. Display results of HMR operations

## Technical Details

### Manual HMR Accept

The demo shows how to manually accept module updates:

```javascript
if (module.hot) {
  // Accept updates for specific modules
  module.hot.accept(['./module1', './module2'], function(updatedDependencies) {
    // Custom update logic here
    console.log('Updated dependencies:', updatedDependencies);
  });
  
  // Accept updates for current module
  module.hot.accept(function(err) {
    if (err) {
      console.error('Cannot apply HMR update:', err);
    }
  });
}
```

### Custom Update Handlers

Implements custom logic for different update scenarios:

- **Dependency Updates**: Handle updates to imported modules
- **Self Updates**: Handle updates to the current module
- **Error Recovery**: Graceful handling of update failures
- **State Migration**: Preserve and migrate state between updates

### HMR Runtime Integration

The webpack bundle includes:

- **HMR Runtime**: Core HMR functionality from webpack
- **Module Registry**: Tracking of loaded modules and dependencies
- **Update Application**: Logic for applying module updates
- **Error Handling**: Comprehensive error handling for update failures

## Manual vs Automatic HMR

### Manual HMR (This Example)

- **Explicit Control**: Manually specify which modules to accept
- **Custom Logic**: Implement specific update handling
- **Error Handling**: Custom error recovery strategies
- **State Management**: Manual state preservation and migration

### Automatic HMR (Standard)

- **Implicit Acceptance**: Webpack automatically handles updates
- **Default Behavior**: Standard update logic for most cases
- **Limited Control**: Less control over update process
- **Simpler Setup**: Easier to configure and use

## Update Flow

1. **Change Detection**: Webpack detects source file changes
2. **Module Rebuild**: Affected modules are rebuilt
3. **Update Notification**: HMR runtime receives update notification
4. **Accept Check**: Check if modules have accept handlers
5. **Custom Logic**: Execute custom update handling logic
6. **Module Replacement**: Replace old modules with new versions
7. **State Migration**: Preserve or migrate application state
8. **Error Recovery**: Handle any update failures gracefully

## Advanced Features

### Dispose Handlers

```javascript
if (module.hot) {
  module.hot.dispose(function(data) {
    // Cleanup logic before module replacement
    data.preservedState = currentState;
  });
}
```

### Status Handlers

```javascript
if (module.hot) {
  module.hot.addStatusHandler(function(status) {
    console.log('HMR Status:', status);
  });
}
```

### Error Handling

```javascript
if (module.hot) {
  module.hot.accept(function(err) {
    if (err) {
      console.error('HMR Error:', err);
      // Implement fallback logic
    }
  });
}
```

## Advantages

- **Fine-Grained Control**: Precise control over update behavior
- **Custom Logic**: Implement domain-specific update handling
- **Error Recovery**: Robust error handling and recovery
- **State Management**: Advanced state preservation strategies
- **Debugging**: Better visibility into HMR process

## Use Cases

- Applications requiring custom update logic
- Complex state management scenarios
- Development tools and frameworks
- Libraries that need HMR integration
- Advanced webpack configurations
- Debugging HMR issues and behavior
