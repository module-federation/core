# Webpack HMR Demo

This example demonstrates standard Webpack Hot Module Replacement (HMR) functionality. It shows how webpack's built-in HMR system can automatically update modules in the browser without full page reloads.

## How It Works

- **Webpack Dev Server**: Uses webpack-dev-server with HMR enabled
- **Hot Module Replacement**: Webpack's built-in HMR runtime handles module updates
- **Automatic Updates**: Changes to source files trigger automatic browser updates
- **State Preservation**: Module state can be preserved across updates

## Key Features

- ✅ Standard webpack HMR implementation
- ✅ Browser-based hot reloading
- ✅ Automatic change detection
- ✅ Built-in webpack tooling
- ✅ Production-ready approach

## Files

- `webpack.config.js` - Webpack configuration with HMR setup
- `src/index.js` - Main application entry point
- `src/entrypoint1.js` - Demo module 1
- `src/entrypoint2.js` - Demo module 2
- `dist/` - Built output directory

## Usage

```bash
npm install
npm run build    # Build the project
npm run serve    # Start webpack dev server with HMR
```

Then open your browser to the displayed URL (typically `http://localhost:8080`) to see the HMR demo in action.

## Development Workflow

1. Start the webpack dev server with `npm run serve`
2. Open the application in your browser
3. Edit any source file in the `src/` directory
4. Watch as changes are automatically reflected in the browser
5. Notice how module state is preserved during updates

## Technical Details

### Webpack Configuration

The `webpack.config.js` includes:

- **HMR Plugin**: `webpack.HotModuleReplacementPlugin()`
- **Dev Server**: Configured with `hot: true`
- **Entry Points**: Multiple entry points for demonstration
- **Output**: Configured for development builds

### HMR Runtime

Webpack automatically injects HMR runtime code that:

1. **Establishes WebSocket Connection**: Connects to webpack dev server
2. **Receives Update Notifications**: Gets notified when files change
3. **Downloads Updated Modules**: Fetches new module code
4. **Applies Updates**: Replaces old modules with new ones
5. **Handles Dependencies**: Updates dependent modules as needed

### Module Update Flow

1. Source file modified and saved
2. Webpack detects change and rebuilds affected modules
3. Dev server sends update notification via WebSocket
4. HMR runtime downloads updated module chunks
5. Old modules replaced with new versions
6. Application continues running with updated code

## Configuration Options

### Basic HMR Setup

```javascript
module.exports = {
  mode: 'development',
  devServer: {
    hot: true,
    open: true
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
};
```

### Advanced HMR Options

- **Accept Handlers**: Custom logic for handling module updates
- **Dispose Handlers**: Cleanup logic before module replacement
- **Error Handling**: Graceful handling of update failures
- **State Preservation**: Maintaining application state across updates

## Advantages

- **Industry Standard**: Uses webpack's proven HMR implementation
- **Browser Integration**: Works seamlessly in web browsers
- **Tooling Support**: Excellent IDE and debugging support
- **Production Ready**: Can be configured for production builds
- **Ecosystem**: Large ecosystem of HMR-compatible tools and libraries

## Use Cases

- Web application development
- React, Vue, Angular applications
- CSS and styling development
- Frontend component development
- Any webpack-based project requiring fast iteration
