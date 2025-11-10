# `disableRerender` Feature Guide

## Overview

The `disableRerender` prop is a performance optimization feature that prevents unnecessary re-renders of remote applications when host component props change. This is particularly useful for remote apps that:

- Manage their own state independently
- Don't need to respond to host prop changes
- Are standalone applications with their own routing
- Have expensive rendering operations

## Quick Start

### Basic Example

```tsx
import { createRemoteAppComponent } from '@module-federation/bridge-react';

const RemoteApp = createRemoteAppComponent({
  loader: () => loadRemote('remote1/export-app'),
  fallback: ErrorComponent,
  loading: LoadingComponent,
});

function HostApp() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      {/* Host state changes won't trigger RemoteApp re-render */}
      <button onClick={() => setCount(c => c + 1)}>
        Count: {count}
      </button>
      
      <RemoteApp 
        disableRerender={true}  // ⭐ Enable optimization
      />
    </div>
  );
}
```

## How It Works

### Three-Layer Protection

The `disableRerender` feature implements a three-layer protection mechanism:

#### Layer 1: React.memo (Component Level)

```tsx
const RemoteAppWrapper = React.memo(
  RemoteAppWrapperInner,
  (prevProps, nextProps) => {
    if (nextProps.disableRerender) {
      // Only re-render if essential props change
      return prevProps.moduleName === nextProps.moduleName &&
             prevProps.basename === nextProps.basename &&
             prevProps.memoryRoute === nextProps.memoryRoute;
    }
    return false;
  }
);
```

**What it does:**
- Prevents the component function from re-executing
- Only allows re-render if `moduleName`, `basename`, or `memoryRoute` changes
- Blocks all other prop changes from triggering re-renders

#### Layer 2: Conditional useEffect Dependencies

```tsx
const hasRenderedRef = useRef(false);

useEffect(() => {
  // Early return if already rendered
  if (disableRerender && hasRenderedRef.current) {
    return;
  }
  
  // Render logic...
  
  if (disableRerender) {
    hasRenderedRef.current = true;
  }
}, disableRerender ? [initialized, moduleName] : [initialized, ...Object.values(props)]);
```

**What it does:**
- When `disableRerender=true`: Only depends on `[initialized, moduleName]`
- When `disableRerender=false`: Depends on all props (default behavior)
- Uses `useRef` to persist render state across re-renders
- Prevents calling `providerInfo.render()` after first render

#### Layer 3: Bridge-Level State Tracking

```tsx
// In bridge-base.tsx
const renderStateMap = new Map<HTMLElement, { hasRendered: boolean }>();

async render(info: RenderParams) {
  const disableRerender = (propsInfo as any)?.disableRerender;
  const renderState = renderStateMap.get(dom);
  
  // Skip render if already rendered
  if (disableRerender && renderState?.hasRendered) {
    return;
  }
  
  // Render logic...
  
  if (disableRerender) {
    renderStateMap.set(dom, { hasRendered: true });
  }
}
```

**What it does:**
- Tracks render state at the bridge provider level
- Prevents calling `root.render()` after first render
- Avoids creating new component definitions and JSX elements
- Provides final protection even if layers 1 and 2 are bypassed

### Why Three Layers?

Each layer protects against different scenarios:

1. **React.memo** → Prevents component re-render from parent updates
2. **useEffect** → Prevents calling bridge render when component does re-render
3. **Bridge-level** → Prevents actual DOM updates even if render is called

## React Router Integration

### ⚠️ Critical: Component Stability

When using `disableRerender` with React Router, you **must** extract route components to avoid inline functions:

### ❌ Incorrect (Causes Remounting)

```tsx
<Routes>
  {/* This creates a new component type on every render */}
  <Route 
    path="/remote/*" 
    Component={() => <RemoteApp disableRerender={true} />} 
  />
</Routes>
```

**Problem:**
- `Component={() => ...}` creates a new function on every render
- React sees it as a different component type
- Old component unmounts, new component mounts
- All state is lost, including `hasRenderedRef`

### ✅ Correct (Stable Reference)

```tsx
// Extract to a named component
const RemoteRoute = () => {
  return <RemoteApp disableRerender={true} />;
};

<Routes>
  <Route path="/remote/*" Component={RemoteRoute} />
</Routes>
```

### ✅ With Local State

```tsx
const RemoteRoute = () => {
  const [localCount, setLocalCount] = useState(0);
  
  return (
    <div>
      {/* Local state that doesn't affect remote app */}
      <button onClick={() => setLocalCount(c => c + 1)}>
        Local: {localCount}
      </button>
      
      <RemoteApp 
        disableRerender={true}
        basename="/remote"
      />
    </div>
  );
};

<Route path="/remote/*" Component={RemoteRoute} />
```

## Decision Matrix

### When to Use `disableRerender={true}`

| Scenario | Use disableRerender? | Reason |
|----------|---------------------|---------|
| Remote app is a standalone SPA | ✅ Yes | No need to respond to host changes |
| Remote app manages its own routing | ✅ Yes | Independent navigation state |
| Remote app has expensive renders | ✅ Yes | Performance optimization |
| Remote app displays static content | ✅ Yes | No need for updates |
| Remote app uses WebSocket/polling | ✅ Yes | Updates come from server, not host |
| Remote app displays host data | ❌ No | Needs to update when data changes |
| Remote app has controlled inputs from host | ❌ No | Must respond to prop changes |
| Remote app needs real-time host updates | ❌ No | Defeats the purpose |
| Remote app is a form with host defaults | ❌ No | Needs initial prop values |

### Edge Cases to Consider

#### 1. Initial Props Still Apply

```tsx
// ✅ These initial props will be used
<RemoteApp 
  disableRerender={true}
  userId={123}           // Applied on first render
  theme="dark"           // Applied on first render
/>

// Later, changing these props won't update the remote app
// The remote app will continue using userId=123 and theme="dark"
```

#### 2. Essential Props Still Trigger Re-render

```tsx
// These props WILL trigger re-render even with disableRerender={true}
<RemoteApp 
  disableRerender={true}
  moduleName="remote1/app"  // Changing this triggers re-render
  basename="/app"           // Changing this triggers re-render
  memoryRoute={...}         // Changing this triggers re-render
/>
```

#### 3. Unmount Still Cleans Up

```tsx
// When component unmounts, state is cleaned up
// Next mount will be treated as first render
{showRemote && <RemoteApp disableRerender={true} />}
// If showRemote becomes false then true, remote app re-renders
```

## Debugging

### Enable Debug Logs

```typescript
import { LoggerInstance } from '@module-federation/bridge-react';

// Enable all debug logs
LoggerInstance.enable();
```

### Expected Log Flow

#### First Render (disableRerender=true)

```
1. RemoteAppWrapper useEffect triggered >>> 
   { initialized: true, hasRenderedRef: false, disableRerender: true }

2. RemoteAppWrapper mark as rendered (disableRerender=true, hasRenderedRef set to true) >>>

3. bridge-base mark as rendered (disableRerender=true) >>>
```

#### Subsequent Host Updates

```
1. RemoteAppWrapper React.memo preventing re-render (disableRerender=true) >>>
   { propsChanged: ['count', 'otherProp'] }

// Component function doesn't execute
// useEffect doesn't run
// Bridge render not called
```

#### If React.memo is Bypassed

```
1. RemoteAppWrapper useEffect triggered >>>
   { initialized: true, hasRenderedRef: true, disableRerender: true }

2. RemoteAppWrapper skip re-render (disableRerender=true, hasRenderedRef=true) >>>

// Bridge render not called
```

#### If useEffect Calls Bridge Render

```
1. bridge-base skip render (disableRerender=true, hasRendered=true) >>>

// root.render() not called
// No new components created
```

## Performance Comparison

### Before (disableRerender=false)

```
Host count++ → RemoteAppWrapper re-renders → useEffect runs → 
providerInfo.render() → BridgeWrapper created → 
root.render() → Remote app re-renders
```

**Cost:** Full component tree re-render + reconciliation

### After (disableRerender=true)

```
Host count++ → React.memo blocks re-render → 
Remote app stays unchanged
```

**Cost:** Shallow prop comparison only

### Benchmark Example

```tsx
// Without disableRerender
Host updates 100 times → Remote app renders 100 times
Total time: ~500ms (5ms per render)

// With disableRerender
Host updates 100 times → Remote app renders 1 time
Total time: ~50ms (5ms first render + 0.5ms × 99 memo checks)

Improvement: 10x faster
```

## Common Pitfalls

### 1. Expecting Props to Update

```tsx
const [userId, setUserId] = useState(1);

<RemoteApp 
  disableRerender={true}
  userId={userId}  // ⚠️ Remote app won't see userId changes!
/>

<button onClick={() => setUserId(2)}>Change User</button>
```

**Solution:** If you need props to update, don't use `disableRerender`, or handle updates inside the remote app (e.g., via events, context, or URL params).

### 2. Inline Functions in Routes

```tsx
// ❌ This negates disableRerender benefits
<Route path="/*" Component={() => <RemoteApp disableRerender={true} />} />
```

**Solution:** Always extract to named components.

### 3. Conditional Rendering

```tsx
// ⚠️ This unmounts and remounts the component
{condition && <RemoteApp disableRerender={true} />}
```

**Impact:** Each remount is treated as a first render. If you need conditional rendering, consider using CSS visibility instead:

```tsx
<div style={{ display: condition ? 'block' : 'none' }}>
  <RemoteApp disableRerender={true} />
</div>
```

### 4. Changing Essential Props

```tsx
const [basename, setBasename] = useState('/app');

<RemoteApp 
  disableRerender={true}
  basename={basename}  // Changing this WILL re-render
/>
```

**Behavior:** This is intentional - routing props must be responsive.

## Advanced Patterns

### Pattern 1: Event-Based Communication

```tsx
// Host
const eventBus = new EventEmitter();

<RemoteApp 
  disableRerender={true}
  eventBus={eventBus}  // Passed once
/>

// Later
eventBus.emit('userChanged', { userId: 2 });

// Remote app listens to events internally
useEffect(() => {
  const handler = (data) => setUserId(data.userId);
  eventBus.on('userChanged', handler);
  return () => eventBus.off('userChanged', handler);
}, []);
```

### Pattern 2: URL-Based State

```tsx
// Host
<RemoteApp 
  disableRerender={true}
  basename="/remote"
/>

// Update state via URL
navigate('/remote?userId=2&theme=dark');

// Remote app reads from URL
const params = useSearchParams();
const userId = params.get('userId');
```

### Pattern 3: Shared Context (Same React Version)

```tsx
// Create shared context
export const AppContext = createContext();

// Host
const [state, setState] = useState({ userId: 1 });

<AppContext.Provider value={{ state, setState }}>
  <RemoteApp disableRerender={true} />
</AppContext.Provider>

// Remote app (must use same React instance)
const { state } = useContext(AppContext);
```

## TypeScript Support

```typescript
import type { RemoteComponentProps } from '@module-federation/bridge-react';

interface MyRemoteProps extends RemoteComponentProps {
  userId?: number;
  theme?: string;
}

const RemoteApp = createRemoteAppComponent<MyRemoteProps>({
  loader: () => loadRemote('remote1/export-app'),
});

// Type-safe usage
<RemoteApp 
  disableRerender={true}
  userId={123}
  theme="dark"
/>
```

## Testing

### Unit Tests

```tsx
import { render } from '@testing-library/react';

it('should not re-render when disableRerender is true', () => {
  const { rerender } = render(
    <RemoteApp disableRerender={true} count={1} />
  );
  
  const renderCount = getRemoteAppRenderCount();
  
  rerender(<RemoteApp disableRerender={true} count={2} />);
  
  expect(getRemoteAppRenderCount()).toBe(renderCount); // Same count
});
```

### Integration Tests

```tsx
it('should maintain state across host updates', async () => {
  render(<HostApp />);
  
  // Interact with remote app
  await userEvent.click(screen.getByText('Remote Button'));
  expect(screen.getByText('Remote Count: 1')).toBeInTheDocument();
  
  // Update host
  await userEvent.click(screen.getByText('Host Button'));
  
  // Remote app state unchanged
  expect(screen.getByText('Remote Count: 1')).toBeInTheDocument();
});
```

## Migration Checklist

- [ ] Identify remote apps that don't need host prop updates
- [ ] Add `disableRerender={true}` to those components
- [ ] Extract any inline route components to named components
- [ ] Test that remote apps still display correctly
- [ ] Test that remote app functionality works
- [ ] Verify performance improvements with React DevTools Profiler
- [ ] Update any integration tests
- [ ] Document the change for your team

## FAQ

**Q: Does this work with all React versions?**  
A: Yes, `React.memo` is available since React 16.6.

**Q: Can I use this with Vue/Angular remotes?**  
A: This feature is specific to `bridge-react`. Other bridges may have similar features.

**Q: Does this affect dev tools?**  
A: No, React DevTools will still show the component, but it won't highlight on updates.

**Q: Can I toggle `disableRerender` dynamically?**  
A: Yes, but changing it from `true` to `false` will cause a re-render.

**Q: What about React 18 concurrent features?**  
A: Compatible with Suspense, concurrent rendering, and automatic batching.

**Q: Does this work with SSR?**  
A: Yes, but it only affects client-side re-renders.

## Support

For issues or questions:
- GitHub Issues: https://github.com/module-federation/core/issues
- Documentation: https://module-federation.io
- Discord: https://discord.gg/module-federation
