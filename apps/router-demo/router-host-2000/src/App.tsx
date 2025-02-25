import React, {
  useRef,
  useEffect,
  ForwardRefExoticComponent,
  Suspense,
} from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { init, loadRemote } from '@module-federation/enhanced/runtime';
import { RetryPlugin } from '@module-federation/retry-plugin';
import { createRemoteComponent } from '@module-federation/bridge-react';
import Navigation from './navigation';
import Detail from './pages/Detail';
import Home from './pages/Home';
import './App.css';
import BridgeReactPlugin from '@module-federation/bridge-react/plugin';
import { ErrorBoundary } from 'react-error-boundary';
import Remote1AppNew from 'remote1/app';
import type { FederationRuntimePlugin } from '@module-federation/enhanced/runtime';
import { Spin } from 'antd';

const fallbackPlugin: () => FederationRuntimePlugin = function () {
  return {
    name: 'fallback-plugin',
    errorLoadRemote(args) {
      return { default: () => <div> fallback component </div> };
    },
  };
};

init({
  name: 'federation_consumer',
  remotes: [],
  plugins: [
    BridgeReactPlugin(),
    // RetryPlugin({
    //   fetch: {
    //     url: 'http://localhost:2008/not-exist-mf-manifest.json',
    //     fallback: () => 'http://localhost:2001/mf-manifest.json',
    //   },
    //   script: {
    //     retryTimes: 3,
    //     retryDelay: 1000,
    //     moduleName: ['remote1'],
    //     cb: (resolve, error) => {
    //       return setTimeout(() => {
    //         resolve(error);
    //       }, 1000);
    //     },
    //   },
    // }),
    // fallbackPlugin(),
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

const Remote1App = createRemoteComponent({
  loader: () => loadRemote('remote1/export-app'),
  fallback: FallbackErrorComp,
  loading: FallbackComp,
});

const Remote1AppWithLoadRemote = React.lazy(
  () =>
    new Promise((resolve) => {
      // delay 2000ms to show suspense effects
      setTimeout(() => {
        resolve(loadRemote('remote1/app'));
      }, 2000);
    }),
);

const LoadingFallback = () => (
  <div
    style={{
      padding: '50px',
      textAlign: 'center',
      background: '#f5f5f5',
      border: '1px solid #d9d9d9',
      borderRadius: '4px',
      marginTop: '20px',
    }}
  >
    <Spin size="large" />
    <div
      style={{
        marginTop: '16px',
        color: '#1677ff',
        fontSize: '16px',
      }}
    >
      Loading Remote1 App...
    </div>
  </div>
);

const Remote1AppWithErrorBoundary = React.forwardRef<any, any>((props, ref) => (
  <ErrorBoundary
    fallback={
      <div
        style={{
          padding: '20px',
          background: '#fff2f0',
          border: '1px solid #ffccc7',
          borderRadius: '4px',
          color: '#cf1322',
          marginTop: '20px',
        }}
      >
        Error loading Remote1App. Please try again later.
      </div>
    }
  >
    <Suspense fallback={<LoadingFallback />}>
      <Remote1AppWithLoadRemote {...props} ref={ref} />
    </Suspense>
  </ErrorBoundary>
));

const Remote2App = createRemoteComponent({
  loader: () => import('remote2/export-app'),
  export: 'provider',
  fallback: FallbackErrorComp,
  loading: FallbackComp,
});

const Remote3App = createRemoteComponent({
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
          Component={() => (
            <Remote1App name={'Ming'} age={12} ref={ref} basename="/remote1" />
          )}
        />
        <Route
          path="/remote2/*"
          Component={() => <Remote2App style={{ padding: '20px' }} />}
        />
        <Route path="/remote3/*" Component={() => <Remote3App test="123" />} />
        <Route path="/memory-router/*" Component={() => <Wraper3 />} />
        <Route
          path="/remote-render-error/*"
          Component={() => <RemoteRenderErrorApp />}
        />
        <Route
          path="/remote-resource-error/*"
          Component={() => <RemoteResourceErrorApp />}
        />
        <Route
          path="/error-load-with-hook/*"
          Component={() => (
            <Remote1AppNew name={'Ming'} age={12} />
            // <React.Suspense fallback={<div> Loading Remote1App...</div>}>
            //   <Remote1AppWithLoadRemote name={'Ming'} age={12} />
            // </React.Suspense>
          )}
        />

        <Route
          path="/error-load-with-error-boundary/*"
          Component={() => (
            <Remote1AppWithErrorBoundary
              name={'Ming'}
              age={12}
              ref={ref}
              basename="/remote1"
            />
          )}
        />
      </Routes>
    </div>
  );
};

export default App;
