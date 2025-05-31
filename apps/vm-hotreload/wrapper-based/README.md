# Wrapper-Based Hot Reload Demo

This example demonstrates hot reloading using VM contexts with wrapper functions. Each module detects whether it's running in a VM context and behaves accordingly, providing clean separation between hot reload logic and module code.

## How It Works

- **Context Detection**: Modules check `global.__IN_VM_CONTEXT__` to determine execution environment
- **Dual Mode**: Modules export either direct functions (in VM) or live getters (in main context)
- **VM Wrapper**: Main context creates and manages VM instances with proper Node.js globals
- **File Watching**: Uses `chokidar` to detect changes and trigger VM recreation

## Key Features

- ✅ Self-contained module hot reload logic
- ✅ Clean separation of concerns
- ✅ Proper Node.js global handling in VM
- ✅ Automatic state management
- ✅ Live getter-based exports

## Files

- `index.js` - Main demo runner with file watching and iteration logic
- `entrypoint1.js` - Self-contained hot reloadable module with VM detection
- `entrypoint2.js` - Self-contained hot reloadable module with VM detection

## Usage

```bash
npm install
npm start
```

The demo will:
1. Load both entrypoint modules in wrapper mode
2. Run 3 iterations, automatically modifying the greet messages
3. Show how modules hot reload themselves when files change
4. Demonstrate state preservation and live updates

## Technical Details

### Wrapper Pattern

Each module follows this pattern:

```javascript
const isInVM = global.__IN_VM_CONTEXT__;

if (isInVM) {
  // In VM context: define state and exports normally
  const state = { /* ... */ };
  module.exports = { /* direct functions */ };
} else {
  // Not in VM: export live getters that delegate to VM
  let vmInstance = null;
  function createVM() { /* create VM with proper context */ }
  function getVM() { /* lazy VM creation */ }
  function destroyVM() { /* cleanup VM instance */ }
  
  // Export live getters
  module.exports = {
    get property() { return getVM().property; },
    destroyVM
  };
}
```

### VM Context Setup

The wrapper creates proper Node.js context:

```javascript
const context = {
  require,
  module: { exports: {} },
  exports: {},
  __filename: filename,
  __dirname: path.dirname(filename),
  global: { __IN_VM_CONTEXT__: true }
};
```

### Hot Reload Flow

1. File change detected by `chokidar`
2. `destroyVM()` called on affected modules
3. VM instance set to `null`
4. Next property access triggers `getVM()`
5. New VM created with updated file content
6. Fresh code executed in new VM context

## Advantages

- **Self-Contained**: Each module manages its own hot reload logic
- **Clean Separation**: Clear distinction between VM and main context code
- **Proper Globals**: VM context includes all necessary Node.js globals
- **Flexible**: Easy to add hot reload to existing modules
- **Testable**: Can test both VM and wrapper modes independently

## Use Cases

- Modules that need to be hot reloadable in isolation
- Development environments with complex module dependencies
- Applications requiring fine-grained hot reload control
- Testing VM context behavior and module isolation
