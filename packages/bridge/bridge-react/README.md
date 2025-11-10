# React Bridge

React bridge is used to load the routing module in mf, so that the routing module can work properly with the host environment.

> When to use

- Load the route module
- Load across the front end framework

## How to use

# 1. Install the react bridge library

```bash
pnpm add @module-federation/bridge-react
```

# 2. Configure the react bridge library

> Use createBridgeComponent create component provider

```jsx
// ./src/index.tsx
import { createBridgeComponent } from '@module-federation/bridge-react';

function App() {
  return ( <BrowserRouter basename="/">
    <Routes>
      <Route path="/" Component={()=> <div>Home page</div>}>
      <Route path="/detail" Component={()=> <div>Detail page</div>}>
    </Routes>
  </BrowserRouter>)
}

export default createBridgeComponent({
  rootComponent: App
});
```

> set alias to proxy

```js
//rsbuild.config.ts
export default defineConfig({
  source: {
    alias: {
      'react-router-dom$': path.resolve(
        __dirname,
        'node_modules/@module-federation/bridge-react/dist/router.es.js',
      ),
    },
  },
  server: {
    port: 2001,
    host: 'localhost',
  },
  dev: {
    assetPrefix: 'http://localhost:2001',
  },
  tools: {
    rspack: (config, { appendPlugins }) => {
      delete config.optimization?.splitChunks;
      config.output!.uniqueName = 'remote1';
      appendPlugins([
        new ModuleFederationPlugin({
          name: 'remote1',
          exposes: {
            './export-app': './src/index.tsx',
          }
        }),
      ]);
    },
  },
});
```

# 3. Load the module with routing

```js
//rsbuild.config.ts
export default defineConfig({
  tools: {
    rspack: (config, { appendPlugins }) => {
      config.output!.uniqueName = 'host';
      appendPlugins([
        new ModuleFederationPlugin({
          name: 'host',
          remotes: {
            remote1: 'remote1@http://localhost:2001/mf-manifest.json',
          },
        }),
      ]);
    },
  },
});
```

> Use the module

```jsx
// ./src/index.tsx
import { createBridgeComponent } from '@module-federation/bridge-react';

const Remote1 = createBridgeComponent(()=> import('remote1/export-app'));

function App() {
  return ( <BrowserRouter basename="/">
    <ul>
      <li>
        <Link to="/">
          Home
        </Link>
      </li>
      <li>
        <Link to="/remote1">
          Remote1
        </Link>
      </li>
    </ul>
    <Routes>
      <Route path="/" Component={()=> <div>Home page</div>}>
      <Route path="/remote1" Component={()=> <Remote1 />}>
    </Routes>
  </BrowserRouter>)
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
    <App />
);
```

## Advanced Features

### Performance Optimization: `disableRerender`

The `disableRerender` prop provides fine-grained control over when remote components re-render, enabling significant performance optimizations.

#### Three Usage Modes

##### 1. 🚫 Complete Disable (Boolean `true`)

Prevents all re-renders except when essential props change.

```jsx
<Remote1 
  disableRerender={true}
  name="Ming" 
  age={12} 
  count={count}  // Changes won't trigger re-render
/>
```

**Behavior:**
- ✅ Renders once (initial render)
- ❌ Parent prop changes won't trigger re-renders
- ⚠️ Essential props still trigger re-render: `moduleName`, `basename`, `memoryRoute`

**Use Case:** Static remote apps that don't need to respond to parent updates.

---

##### 2. 🎯 Watch Specific Props (Array)

Only re-renders when specified props change - perfect for selective optimization!

```jsx
<Remote1 
  disableRerender={['userId', 'theme']}
  userId={userId}        // ✅ Watched - will trigger re-render
  theme={theme}          // ✅ Watched - will trigger re-render
  count={count}          // ❌ Unwatched - won't trigger re-render
  timestamp={timestamp}  // ❌ Unwatched - won't trigger re-render
/>
```

**Behavior:**
- ✅ Re-renders when `userId` or `theme` changes
- ❌ Other prop changes are ignored
- ⚠️ Essential props always trigger re-render

**Use Case:** Remote apps that only care about specific data (user info, theme, language, etc.)

---

##### 3. ✨ Normal Behavior (Default / `false`)

Standard React behavior - re-renders on every prop change.

```jsx
<Remote1 name="Ming" age={12} count={count} />
// or explicitly
<Remote1 disableRerender={false} name="Ming" age={12} count={count} />
```

---

#### Real-World Example: E-commerce Dashboard

```jsx
function Dashboard() {
  const [time, setTime] = useState(Date.now());
  const [userId, setUserId] = useState(1);
  const [theme, setTheme] = useState('light');
  const [cartCount, setCartCount] = useState(0);
  
  // Timer updates every second
  useEffect(() => {
    const timer = setInterval(() => setTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  return (
    <div>
      <div>Time: {new Date(time).toLocaleTimeString()}</div>
      
      {/* UserProfile only cares about userId and theme */}
      <UserProfileRemote 
        disableRerender={['userId', 'theme']}
        userId={userId}
        theme={theme}
        time={time}       // Won't cause re-render ✅
        cartCount={cartCount}  // Won't cause re-render ✅
      />
      
      {/* CartWidget only cares about cartCount */}
      <CartWidgetRemote 
        disableRerender={['cartCount']}
        cartCount={cartCount}
        userId={userId}    // Won't cause re-render ✅
        theme={theme}      // Won't cause re-render ✅
        time={time}        // Won't cause re-render ✅
      />
      
      {/* StaticSidebar never needs updates */}
      <SidebarRemote 
        disableRerender={true}
        userId={userId}
        theme={theme}
        time={time}
      />
    </div>
  );
}
```

---

#### Performance Comparison

**Scenario:** Parent counter increments 100 times

| Mode | Configuration | Re-renders | Performance |
|------|---------------|------------|-------------|
| Default | No optimization | 100 | ~500ms ❌ |
| Boolean | `disableRerender={true}` | 1 | ~5ms ✅ **99% faster** |
| Array | `disableRerender={['userId']}` | 1* | ~5ms ✅ **Selective control** |

*Only when `userId` changes

---

#### When to Use Each Mode

##### ✅ Use `disableRerender={true}` when:
- Remote app is completely static
- No props affect the UI
- Maximum performance optimization needed
- Example: Static sidebar, footer, headers

##### ✅ Use `disableRerender={['prop1', 'prop2']}` when:
- Remote app responds to specific props only
- Some props change frequently but aren't relevant
- Need fine-grained optimization
- Example: User profiles (userId, theme), dashboards (specific metrics)

##### ❌ Don't use when:
- Remote app needs all prop updates
- Real-time data synchronization required
- Props contain critical state that must update immediately

---

#### TypeScript Support

Full type safety for watched props:

```typescript
import { createRemoteAppComponent } from '@module-federation/bridge-react';

interface RemoteProps {
  userId: number;
  theme: 'light' | 'dark';
  count: number;
  data: any[];
}

const Remote1 = createRemoteAppComponent<RemoteProps>({
  loader: () => loadRemote('remote1/export-app'),
  fallback: ErrorComponent,
  loading: LoadingComponent,
});

// Type-safe usage
<Remote1 
  disableRerender={['userId', 'theme']}  // ✅ Type-checked
  // disableRerender={['invalid']}       // ❌ TypeScript error
  userId={1}
  theme="dark"
  count={100}
  data={[]}
/>
```

---

#### Implementation Details

**Three-Layer Protection:**

1. **React.memo**: Prevents component re-rendering at React reconciliation level
2. **useEffect dependencies**: Optimizes effect re-execution based on watched props
3. **Bridge-level tracking**: Prevents redundant `root.render()` calls

**Essential Props (Always Trigger Re-render):**
- `moduleName` - Different remote module loaded
- `basename` - Router base path changed
- `memoryRoute.entryPath` - Initial route changed

---

#### Debug and Observe

Enable debug logging to see optimization in action:

```jsx
// In browser console, you'll see:
// ✅ With disableRerender={true}
// "RemoteAppWrapper React.memo preventing re-render (disableRerender=true)"

// ✅ With disableRerender={['userId', 'theme']}
// "RemoteAppWrapper React.memo preventing re-render (watched props unchanged)"
// "bridge-base skip render (watched props unchanged)"

// When userId changes:
// "RemoteAppWrapper React.memo allowing re-render (watched props changed)"
// "bridge-base proceeding with render (watched props changed)"
```

---

#### Migration Guide

Existing code continues to work without changes:

```jsx
// Before (still works)
<Remote1 name="Ming" age={12} />

// Optimize step 1: Disable all re-renders
<Remote1 disableRerender={true} name="Ming" age={12} />

// Optimize step 2: Fine-tune with array mode
<Remote1 disableRerender={['name', 'age']} name="Ming" age={12} />
```

No breaking changes - fully backward compatible! 🎉

````
```
