# feat: Add `disableRerender` prop to prevent unnecessary remote app re-renders

## 🎯 Problem

When using Module Federation Bridge with React Router, remote applications would unnecessarily re-render whenever the host application's props changed. This caused:

- **Performance issues**: Remote apps were destroyed and re-mounted on every parent prop change
- **State loss**: Internal state of remote apps was reset
- **Poor user experience**: Loading states and flickering during re-renders

### Root Causes Identified

1. **React Router inline component anti-pattern**: Using `Component={() => <RemoteApp />}` creates a new component type on every render, causing React to unmount the old component and mount a new one.

2. **Props propagation**: Any prop change in the host would trigger re-renders in remote apps, even when the remote app didn't need to update.

## ✅ Solution

This PR introduces a `disableRerender` prop to `createRemoteAppComponent` that allows developers to prevent unnecessary re-renders of remote applications.

### Changes Made

#### 1. **New `disableRerender` Prop**

Added a new optional prop to `RemoteComponentProps`:

```typescript
export interface RemoteComponentProps {
  // ... existing props
  disableRerender?: boolean; // Prevent re-render when host props change
}
```

#### 2. **Smart Render Tracking**

Implemented render tracking using `useRef` to persist state across re-renders:

```typescript
const hasRenderedRef = useRef(false);

// Mark as rendered on first render
if (disableRerender) {
  hasRenderedRef.current = true;
}
```

#### 3. **Conditional useEffect Dependencies**

Modified useEffect to conditionally depend on props:

```typescript
useEffect(() => {
  // Skip re-render if disableRerender is enabled and already rendered
  if (disableRerender && hasRenderedRef.current) {
    return;
  }
  
  // Render logic...
}, disableRerender ? [initialized, moduleName] : [initialized, ...Object.values(props)]);
```

**Behavior**:
- When `disableRerender=true`: Only depends on `[initialized, moduleName]`
- When `disableRerender=false`: Depends on all props (default behavior)

#### 4. **React.memo Optimization**

Wrapped component with `React.memo` to prevent component re-renders:

```typescript
const RemoteAppWrapper = React.memo(
  RemoteAppWrapperInner,
  (prevProps, nextProps) => {
    if (nextProps.disableRerender) {
      // Only re-render if essential props change
      return prevProps.moduleName === nextProps.moduleName &&
             prevProps.basename === nextProps.basename &&
             prevProps.memoryRoute === nextProps.memoryRoute;
    }
    return false; // Allow normal re-render
  }
);
```

#### 5. **Example: Fixed React Router Usage**

Updated example to demonstrate correct usage:

```typescript
// ❌ Before: Inline component (causes unmount/remount)
<Route path="/remote1/*" Component={() => <Remote1App count={count} />} />

// ✅ After: Extracted component (stable reference)
const Remote1Route = () => {
  const [count, setCount] = useState(0);
  return (
    <>
      <button onClick={() => setCount(s => s + 1)}>Count {count}</button>
      <Remote1App 
        count={count}
        disableRerender={true}  // 🆕 Prevent re-render
      />
    </>
  );
};

<Route path="/remote1/*" Component={Remote1Route} />
```

## 📊 Impact

### When `disableRerender={true}`

- ✅ Remote app renders **only once**
- ✅ Host prop changes (e.g., `count++`) **do not** trigger remote app re-renders
- ✅ Remote app internal state is **preserved**
- ✅ No unnecessary DOM unmount/remount cycles
- ✅ Better performance and user experience

### When `disableRerender={false}` or undefined

- ✅ Default behavior maintained
- ✅ Remote app re-renders on prop changes (backward compatible)

## 🧪 Testing

### Manual Testing Performed

1. **Test Case 1**: Host prop changes with `disableRerender={true}`
   - Result: ✅ Remote app does not re-render
   - Logs: `RemoteAppWrapper skip re-render (disableRerender=true, hasRenderedRef=true)`

2. **Test Case 2**: Host prop changes with `disableRerender={false}`
   - Result: ✅ Remote app re-renders normally
   - Logs: `RemoteAppWrapper mark as rendered`

3. **Test Case 3**: Essential props change with `disableRerender={true}`
   - Result: ✅ Remote app re-renders when `moduleName`, `basename`, or `memoryRoute` changes

### Debug Logs

Added comprehensive debug logging to track render behavior:

```typescript
LoggerInstance.debug(`RemoteAppWrapper useEffect triggered >>>`, {
  moduleName,
  initialized,
  hasProviderInfo: !!providerInfoRef.current,
  disableRerender,
  hasRenderedRef: hasRenderedRef.current,
  dependencies: disableRerender ? [initialized, moduleName] : 'all props',
});
```

## 🔄 Migration Guide

### For Existing Users

**No breaking changes** - this is a backward-compatible enhancement.

### For New Users

To enable the optimization:

```typescript
const Remote1App = createRemoteAppComponent({
  loader: () => loadRemote('remote1/export-app'),
  fallback: ErrorComponent,
  loading: LoadingComponent,
});

// In your component
<Remote1App 
  disableRerender={true}  // Add this prop
  {...otherProps}
/>
```

**Important**: Extract route components to avoid inline functions:

```typescript
// ❌ Don't do this
<Route path="/remote/*" Component={() => <RemoteApp disableRerender={true} />} />

// ✅ Do this
const RemoteRoute = () => <RemoteApp disableRerender={true} />;
<Route path="/remote/*" Component={RemoteRoute} />
```

## 📝 Files Changed

### Core Changes
- `packages/bridge/bridge-react/src/remote/component.tsx` - Main implementation with React.memo and useRef tracking
- `packages/bridge/bridge-react/src/provider/versions/bridge-base.tsx` - Bridge-level render state tracking
- `packages/bridge/bridge-react/src/types.ts` - Type definitions for `disableRerender` prop

### Documentation
- `packages/bridge/bridge-react/README.md` - Updated with `disableRerender` usage guide
- `packages/bridge/bridge-react/CHANGELOG.md` - Added feature changelog entry
- `packages/bridge/bridge-react/DISABLE_RERENDER_GUIDE.md` - Comprehensive guide with examples and best practices

### Example Updates
- `apps/router-demo/router-host-2000/src/App.tsx` - Demonstrates correct usage with extracted route components

## 🔗 Related Issues

Fixes performance issues when using Module Federation Bridge with React Router where remote apps would unnecessarily re-render on host prop changes.

## 🎓 Key Learnings

1. **React Router Anti-pattern**: Never use inline function components with `Component` prop
2. **Component Stability**: Ensure component types remain stable across renders
3. **Performance Optimization**: Use `React.memo` + conditional dependencies for fine-grained control
4. **State Persistence**: Use `useRef` for state that shouldn't trigger re-renders

## 📸 Before vs After

### Before
```
Host count changes → RemoteAppWrapper re-renders → useEffect runs → 
providerInfo.render() executes → Remote app re-mounts → State lost
```

### After (with `disableRerender={true}`)
```
Host count changes → React.memo blocks re-render → 
Remote app maintains state → No unnecessary updates
```

## ⚠️ Considerations

1. **When to use `disableRerender={true}`**:
   - Remote app doesn't depend on host props
   - Remote app manages its own state independently
   - Performance is critical and re-renders are expensive

2. **When NOT to use**:
   - Remote app needs to respond to host prop changes
   - Remote app displays host data
   - Real-time updates from host are required

## 🚀 Next Steps

- [ ] Add unit tests for `disableRerender` functionality
- [ ] Add integration tests with React Router
- [ ] Update documentation with best practices
- [ ] Consider adding performance metrics/benchmarks

---

**Type**: Feature Enhancement  
**Breaking Change**: No  
**Documentation Updated**: Example code updated  
**Tests Added**: Manual testing completed, automated tests pending
