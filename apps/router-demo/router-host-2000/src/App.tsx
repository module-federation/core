import { useRef, useEffect, ForwardRefExoticComponent } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import {
  init,
  loadRemote,
  getInstance,
} from '@module-federation/enhanced/runtime';
import { RetryPlugin } from '@module-federation/retry-plugin';
import {
  createRemoteComponent,
  BridgeReactPlugin,
} from '@module-federation/bridge-react';
import Navigation from './navigation';
import Detail from './pages/Detail';
import Home from './pages/Home';
import './App.css';
import { registerPlugins } from '@module-federation/enhanced/runtime';

const hostInstance = getInstance();
// registerPlugins([BridgeReactPlugin()]);

init({
  name: 'federation_consumer',
  remotes: [],
  plugins: [
    BridgeReactPlugin(),
    RetryPlugin({
      fetch: {
        url: 'http://localhost:2008/not-exist-mf-manifest.json',
        fallback: () => 'http://localhost:2001/mf-manifest.json',
      },
      script: {
        retryTimes: 3,
        retryDelay: 1000,
        moduleName: ['remote1'],
        cb: (resolve, error) => {
          return setTimeout(() => {
            resolve(error);
          }, 1000);
        },
      },
    }),
  ],
});

const FallbackErrorComp = (info: any) => {
  return (
    <div>
      <h2>This is ErrorBoundary Component</h2>
      <p>Something went wrong:</p>
      <pre style={{ color: 'red' }}>{info?.error.message}</pre>
      <button onClick={() => info.resetErrorBoundary()}>
        resetErrorBoundary(try again)
      </button>
    </div>
  );
};

const FallbackComp = <div data-test-id="loading">loading...</div>;

// @ts-ignore
const Remote1App = hostInstance.createRemoteComponent({
  loader: () => loadRemote('remote1/export-app'),
  fallback: FallbackErrorComp,
  loading: FallbackComp,
});

// @ts-ignore
const Remote2App = hostInstance.createRemoteComponent({
  loader: () => import('remote2/export-app'),
  export: 'provider',
  fallback: FallbackErrorComp,
  loading: FallbackComp,
});

// @ts-ignore
const Remote3App = hostInstance.createRemoteComponent({
  loader: () => loadRemote('remote3/export-app'),
  fallback: FallbackErrorComp,
  loading: FallbackComp,
});

const RemoteRenderErrorApp = createRemoteComponent({
  loader: () => loadRemote('remote-render-error/export-app'),
  fallback: FallbackErrorComp,
  loading: FallbackComp,
}) as ForwardRefExoticComponent<unknown>;

const RemoteResourceErrorApp = createRemoteComponent({
  loader: () => loadRemote('remote-resource-error/export-app'),
  fallback: FallbackErrorComp,
  loading: FallbackComp,
}) as ForwardRefExoticComponent<unknown>;

function Wraper3() {
  return (
    <>
      <div className="flex flex-row">
        <div className="grow">
          <h2>Remote1</h2>
          <Remote1App name={'Ming'} age={12} memoryRoute={{ entryPath: '/' }} />
        </div>
        <div className="grow">
          <h2>Remote2</h2>
          <Remote2App memoryRoute={{ entryPath: '/detail' }} />
        </div>
        <div className="grow">
          <h2>Remote3</h2>
          <Remote3App />
        </div>
      </div>
    </>
  );
}

const App = () => {
  const location = useLocation();
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const refTimeout = setTimeout(() => {
      if (ref && ref.current) {
        const div = document.createElement('h4');
        div.append('Some text');
        ref.current.append(div);
      }
    }, 1000);
    return () => {
      if (!location.pathname.includes('remote1')) {
        clearTimeout(refTimeout);
      }
    };
  }, [location.pathname]);

  return (
    <div>
      <Navigation />
      <Routes>
        <Route path="/" Component={Home} />
        <Route path="/detail/*" Component={Detail} />
        <Route
          path="/remote1/*"
          Component={() => <Remote1App name={'Ming'} age={12} ref={ref} />}
        />
        <Route
          path="/remote2/*"
          Component={() => <Remote2App style={{ padding: '20px' }} />}
        />
        <Route path="/remote3/*" Component={() => <Remote3App />} />
        <Route path="/memory-router/*" Component={() => <Wraper3 />} />
        <Route
          path="/remote-render-error/*"
          Component={() => <RemoteRenderErrorApp />}
        />
        <Route
          path="/remote-resource-error/*"
          Component={() => <RemoteResourceErrorApp />}
        />
      </Routes>
    </div>
  );
};

export default App;
