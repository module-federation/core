# Module Federation Runtime Enhancements - Internal Technical Documentation

## Overview

PR #10524 introduces significant improvements to Module Federation runtime handling in Rspack, addressing runtime errors and optimizing bundle sizes through the "prevStartup wrapper" pattern and dependency hoisting.

## Background and Motivation

### The Problem
Rspack users encountered specific runtime errors with Module Federation:
1. **Runtime Initialization Errors**: `"should have __webpack_require__.f.consumes"` errors
2. **Federation Runtime Order Issues**: Federation dependencies weren't executing in proper order  
3. **Web Worker Compatibility**: Module Federation had issues with web worker environments
4. **Bundle Size Inefficiency**: When using `runtimeChunk: 'single'`, federation dependencies were duplicated across entry points (~70kb per entry)

### The Solution
PR #10524 introduces two complementary features:
1. **Startup Wrapper Pattern**: Ensures federation runtime dependencies execute before other modules
2. **Module Hoisting Optimization**: Moves container references to runtime chunks for better optimization

## Technical Architecture

### Core Components

#### 1. EmbedFederationRuntimeModule (`embed_federation_runtime_module.rs`)

The core runtime module that implements the "prevStartup wrapper" pattern:

```rust
// Generates JavaScript code that wraps the startup function
let result = format!(
  r#"var prevStartup = {startup};
var hasRun = false;
{startup} = function() {{
	if (!hasRun) {{
		hasRun = true;
{module_executions}
	}}
	if (typeof prevStartup === 'function') {{
		return prevStartup();
	}} else {{
		console.warn('[MF] Invalid prevStartup');
	}}
}};"#
);
```

**Key functionality:**
- Wraps the existing `__webpack_require__.startup` function
- Preserves original startup as `prevStartup`
- Uses `hasRun` flag to prevent double execution
- Executes federation dependencies before calling original startup
- Runs at stage 11 (after RemoteRuntimeModule at stage 10)

#### 2. EmbedFederationRuntimePlugin (`embed_federation_runtime_plugin.rs`)

Manages the injection and coordination of the runtime module:

```rust
// Runtime chunk detection logic
let has_runtime = chunk.has_runtime(&compilation.chunk_group_by_ukey);
let has_entry_modules = compilation.chunk_graph.get_number_of_entry_modules(chunk_ukey) > 0;
let is_enabled = has_runtime || has_entry_modules;
```

**Core responsibilities:**
- Adds `STARTUP` runtime requirements to federation-enabled chunks
- Injects `EmbedFederationRuntimeModule` into runtime chunks only  
- Handles explicit startup calls for entry chunks that delegate to runtime chunks
- Patches entry chunks without runtime by adding explicit startup calls

#### 3. HoistContainerReferencesPlugin (`hoist_container_references_plugin.rs`)

Implements module hoisting optimization for federation dependencies:

```rust
// Recursively collect referenced modules, excluding async blocks
if ty == "initial" {
  let parent_block = module_graph.get_parent_block(&conn.dependency_id);
  if parent_block.is_some() {
    continue; // Skip async dependencies
  }
}
```

**Key features:**
- Hoists three types of federation dependencies to runtime chunks:
  - Container entry dependencies
  - Federation runtime dependencies  
  - Remote dependencies (RemoteToExternalDependency and FallbackDependency)
- Supports `runtimeChunk: 'single'` configurations optimally
- Recursively collects referenced modules while excluding async dependencies
- Cleans up empty non-runtime chunks after hoisting

## Implementation Details

### Runtime Injection Mechanism

The system works through a two-stage process:

1. **Dependency Collection**: Federation dependencies are collected via hook system during compilation
2. **Runtime Injection**: During `runtime_requirement_in_tree` phase, the `EmbedFederationRuntimeModule` is injected into runtime chunks with a snapshot of collected dependencies

### Entrypoint Handling Strategy

The PR modifies how different chunk types are handled:

- **Runtime chunks with entries**: Natural startup handling by JavaScript plugin
- **Entry chunks without runtime**: Explicit startup calls are added via `render_startup` hook  
- **Startup call injection**: Adds `__webpack_require__.startup()` calls to entry chunks that delegate to runtime chunks

### Module Hoisting Logic

```rust
// Module collection with type filtering
for (dependency_id, connection) in module_graph.get_outgoing_connections(&module.identifier()) {
    if ty == "initial" {
        let parent_block = module_graph.get_parent_block(&dependency_id);
        if parent_block.is_some() {
            continue; // Skip async block dependencies
        }
    }
    // Recursively collect referenced modules
}
```

## Configuration and Integration

### Automatic Activation

The runtime wrapping activates automatically when using Module Federation:

```javascript
// Basic configuration - runtime wrapping is automatic
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'myApp',
      // your federation config
    })
  ]
};
```

### Hoisting Optimization

For maximum bundle size benefits, enable runtime chunking:

```javascript
module.exports = {
  optimization: {
    runtimeChunk: 'single' // Enables federation dependency hoisting
  },
  plugins: [
    new ModuleFederationPlugin({
      // your config
    })
  ]
};
```

## Performance Impact

### Error Prevention
- Eliminates `"should have __webpack_require__.f.consumes"` errors
- Ensures federation dependencies execute before dependent modules
- Improves web worker compatibility

### Bundle Size Optimization
- **~70kb reduction per entry point** when using `runtimeChunk: 'single'` with multiple entries
- Achieved through intelligent federation dependency hoisting to shared runtime chunks
- Eliminates duplication of federation runtime code across entry points

### Runtime Performance
- Controlled initialization order prevents race conditions
- Single `hasRun` flag prevents duplicate execution overhead
- Minimal runtime overhead from startup wrapper

## Supporting Infrastructure

### New Dependency Types
- **FederationRuntimeDependency**: New dependency type for tracking runtime dependencies
- **FederationModulesPlugin**: Hook-based communication system between plugins

### Hook System Integration
The plugins communicate via a sophisticated hook system:
- `addContainerEntryDependency`: Tracks container entry dependencies
- `addFederationRuntimeDependency`: Tracks federation runtime dependencies  
- `addRemoteDependency`: Tracks remote dependencies

## Files Added/Modified

### New Files
- `/crates/rspack_plugin_mf/src/container/embed_federation_runtime_module.rs` - Core runtime module
- `/crates/rspack_plugin_mf/src/container/embed_federation_runtime_plugin.rs` - Plugin coordination
- `/crates/rspack_plugin_mf/src/container/hoist_container_references_plugin.rs` - Module hoisting
- `/crates/rspack_plugin_mf/src/container/federation_runtime_dependency.rs` - Dependency type
- `/crates/rspack_plugin_mf/src/container/federation_modules_plugin.rs` - Hook system

### Modified Files  
- Various configuration and binding files to support the new plugins
- `Cargo.toml` dependencies updated for new functionality

## Testing Strategy

### Error Case Testing
- Tests for the specific `"should have __webpack_require__.f.consumes"` error scenario
- Web worker compatibility tests
- Various chunk splitting configurations

### Optimization Testing
- Bundle size measurements with different entry point configurations
- Performance benchmarks for startup time
- Memory usage analysis for runtime overhead

## Future Enhancements

1. **Advanced Hoisting Strategies**: Analyze usage patterns to optimize hoisting decisions
2. **Dynamic Federation Loading**: Load federation dependencies on-demand based on usage
3. **Cross-Chunk Deduplication**: Further optimize shared federation code across chunks
4. **Enhanced Web Worker Support**: Additional optimizations for web worker environments

## Debugging and Troubleshooting

### Common Issues
1. **Initialization Order Problems**: Check that federation dependencies are properly collected
2. **Bundle Size Regressions**: Verify `runtimeChunk: 'single'` is configured for hoisting
3. **Web Worker Errors**: Ensure federation runtime is properly initialized in worker context

### Debug Information
- Monitor startup wrapper execution order
- Check federation dependency collection during compilation
- Verify chunk graph connections for hoisted modules

## Migration Notes

### Backward Compatibility
- All changes are backward compatible with existing Module Federation configurations
- No configuration changes required for basic error fixes
- Optional `runtimeChunk: 'single'` for bundle size optimization

### Upgrade Benefits
- Immediate error resolution for `"should have __webpack_require__.f.consumes"` issues
- Automatic startup ordering improvements
- Optional bundle size optimization with minimal configuration

## References

- **Issue**: web-infra-dev/rspack#7417 (Original runtime error report)
- **PR**: web-infra-dev/rspack#10524 (Implementation)
- **Related**: Module Federation runtime initialization patterns