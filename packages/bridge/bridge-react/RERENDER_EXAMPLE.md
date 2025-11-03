# Bridge React Rerender Functionality

This document demonstrates the new rerender functionality that solves the performance issue described in [GitHub Issue #4171](https://github.com/module-federation/core/issues/4171).

## Problem

Previously, when a host component rerendered and passed new props to a remote component, the entire remote app would be recreated instead of just rerendering, causing performance issues.

## Solution

The new rerender functionality provides two approaches:

### 1. Automatic Efficient Rerender (Default)

By default, the bridge now uses React state management to efficiently update props without recreating the React root:

```tsx
// Remote App (no changes needed for basic optimization)
export default createBridgeComponent({
  rootComponent: App,
});
```

```tsx
// Host App
function HostApp() {
  const [count, setCount] = React.useState(0);
  
  return (
    <>
      <button onClick={() => setCount(s => s + 1)}>Count {count}</button>
      <Remote1App props={{ message: 'Hello', count }} />
    </>
  );
}
```

**Result**: Clicking the button now efficiently updates the remote component without recreating the entire React tree.

### 2. Custom Rerender Function

For advanced use cases, you can provide a custom rerender function:

```tsx
// Remote App with custom rerender logic
export default createBridgeComponent({
  rootComponent: App,
  rerender: (props) => {
    // Custom rerender logic
    console.log('Efficiently updating with new props:', props);
    
    // You can implement custom state management here
    // For example, updating a global store or context
    updateGlobalStore(props);
  },
});
```

## Performance Benefits

- **Before**: Every prop change triggered `root.render()`, recreating the entire component tree
- **After**: Prop changes use React state updates or custom rerender logic, maintaining component state and improving performance

## Backward Compatibility

The implementation is fully backward compatible:
- Existing code continues to work without changes
- The automatic optimization is applied by default
- Custom rerender functions are optional

## API Reference

### ProviderFnParams Interface

```tsx
interface ProviderFnParams<T> {
  rootComponent: React.ComponentType<T>;
  render?: (App: React.ReactElement, id?: HTMLElement | string) => RootType | Promise<RootType>;
  createRoot?: (container: Element | DocumentFragment, options?: CreateRootOptions) => Root;
  defaultRootOptions?: CreateRootOptions;
  
  // New: Optional custom rerender function
  rerender?: (props: T) => void;
}
```

### BridgeComponentInstance Interface

```tsx
interface BridgeComponentInstance {
  render: (info: RenderParams) => Promise<void>;
  destroy: (info: DestroyParams) => void;
  
  // New: Optional rerender method
  rerender?: (props: any) => void;
}
```

## Implementation Details

1. **State Management**: The bridge now uses a `StatefulBridgeWrapper` component with React state to manage props
2. **Efficient Updates**: When props change, the system uses `setState` instead of `root.render()`
3. **Custom Logic**: If a `rerender` function is provided, it's called instead of the default state update
4. **Fallback**: If rerender is not available, the system falls back to the original behavior for compatibility

This solution addresses the core performance issue while maintaining full backward compatibility and providing flexibility for advanced use cases.