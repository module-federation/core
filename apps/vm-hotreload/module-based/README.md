# Module-Based Hot Reload Demo

This example demonstrates hot reloading using Node.js module system overrides and VM contexts. It intercepts the `require()` mechanism to create live bindings that automatically update when files change.

## How It Works

- **Module Override**: Overrides `Module._extensions['.js']` to intercept module loading
- **VM Context**: Uses Node.js `vm` module to execute code in isolated contexts
- **Live Bindings**: Creates getter-based exports that dynamically fetch from VM instances
- **File Watching**: Uses `chokidar` to watch for file changes and destroy VM instances

## Key Features

- ✅ True hot reloading without restart
- ✅ Fresh state on each reload (VM recreation)
- ✅ Automatic file watching
- ✅ Clean VM isolation
- ✅ Live getter-based exports

## Files

- `index.js` - Main demo runner with file watching and iteration logic
- `register-vm-loader.js` - Core hot reload implementation using VM contexts
- `entrypoint1.js` - Demo module 1 (simple state and functions)
- `entrypoint2.js` - Demo module 2 (simple state and functions)

## Usage

```bash
npm install
npm start
```

The demo will:
1. Load both entrypoint modules
2. Run 3 iterations, automatically modifying the greet messages
3. Show how modules are hot reloaded with fresh VM instances
4. Display live updates as files change

## Technical Details

### VM Context Approach

The `register-vm-loader.js` creates a custom module loader that:

1. **Intercepts Module Loading**: Overrides the default `.js` extension handler
2. **Creates VM Instances**: Runs module code in isolated VM contexts
3. **Provides Live Bindings**: Uses getters to dynamically access VM exports
4. **Manages Lifecycle**: Destroys and recreates VMs when files change

### Hot Reload Flow

1. File change detected by `chokidar`
2. VM instance destroyed via `destroyVM()`
3. Next property access triggers VM recreation with fresh state
4. New code executed in fresh VM context
5. Live bindings automatically reflect new exports

## Advantages

- **True Hot Reloading**: No application restart required
- **State Isolation**: Each module runs in its own VM context
- **Automatic Updates**: Live bindings update automatically
- **Clean Architecture**: Clear separation between loader and application logic

## Use Cases

- Development environments requiring fast iteration
- Applications with expensive startup costs
- Scenarios where fresh state on reload is acceptable
- Testing module isolation and hot reload mechanisms
