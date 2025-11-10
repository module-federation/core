import React, {
  useState,
  useRef,
  useEffect,
  ForwardRefExoticComponent,
  Suspense,
} from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import {
  loadRemote,
  createInstance,
} from '@module-federation/enhanced/runtime';
import { RetryPlugin } from '@module-federation/retry-plugin';
import { createRemoteAppComponent } from '@module-federation/bridge-react';
import Navigation from './navigation';
import Detail from './pages/Detail';
import Home from './pages/Home';
import './App.css';
import BridgeReactPlugin from '@module-federation/bridge-react/plugin';
import { ErrorBoundary } from 'react-error-boundary';
import Remote1AppNew from 'remote1/app';
import type { ModuleFederationRuntimePlugin } from '@module-federation/enhanced/runtime';
import { Spin } from 'antd';

const fallbackPlugin: () => ModuleFederationRuntimePlugin = function () {
  return {
    name: 'fallback-plugin',
    errorLoadRemote(args) {
      return { default: () => <div> fallback component </div> };
    },
  };
};

const mf = createInstance({
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

const Remote1App = createRemoteAppComponent({
  loader: () => loadRemote('remote1/export-app'),
  fallback: FallbackErrorComp,
  loading: FallbackComp,
});

const Remote5App = createRemoteAppComponent({
  loader: () => loadRemote('remote5/export-app'),
  fallback: FallbackErrorComp,
  loading: FallbackComp,
});
const Remote6App = createRemoteAppComponent({
  loader: () => loadRemote('remote6/export-app'),
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

const Remote2App = createRemoteAppComponent({
  loader: () => import('remote2/export-app'),
  export: 'provider',
  fallback: FallbackErrorComp,
  loading: FallbackComp,
});

const Remote3App = createRemoteAppComponent({
  loader: () => loadRemote('remote3/export-app'),
  fallback: FallbackErrorComp,
  loading: FallbackComp,
});

const RemoteRenderErrorApp = createRemoteAppComponent({
  loader: () => loadRemote('remote-render-error/export-app'),
  fallback: FallbackErrorComp,
  loading: FallbackComp,
}) as ForwardRefExoticComponent<unknown>;

const RemoteResourceErrorApp = createRemoteAppComponent({
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

// Extract Remote1 route component to avoid recreating on every render
const Remote1Route = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);
  const [disableRerender, setDisableRerender] = useState(false);

  console.log(
    '🏠 [Host] Remote1Route render, count:',
    count,
    'disableRerender:',
    disableRerender,
  );

  return (
    <div
      style={{
        padding: '20px',
        border: '2px solid #1890ff',
        borderRadius: '8px',
      }}
    >
      <div
        style={{
          background: '#e6f7ff',
          padding: '16px',
          marginBottom: '16px',
          borderRadius: '4px',
        }}
      >
        <h3 style={{ margin: '0 0 12px 0', color: '#1890ff' }}>🔬 测试面板</h3>
        <div
          style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            marginBottom: '12px',
          }}
        >
          <button
            onClick={() => setCount((s) => s + 1)}
            style={{
              padding: '8px 16px',
              fontSize: '16px',
              background: '#1890ff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            点击增加 Count: {count}
          </button>
          <span style={{ fontSize: '14px', color: '#666' }}>
            👉 点击按钮观察远程应用是否重新渲染
          </span>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={disableRerender}
              onChange={(e) => setDisableRerender(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
              启用 disableRerender（防止重新渲染）
            </span>
          </label>
          <span
            style={{
              fontSize: '12px',
              padding: '4px 8px',
              background: disableRerender ? '#52c41a' : '#ff4d4f',
              color: 'white',
              borderRadius: '4px',
            }}
          >
            {disableRerender ? '✅ 已启用' : '❌ 已禁用'}
          </span>
        </div>
        <div style={{ marginTop: '12px', fontSize: '13px', color: '#666' }}>
          <p style={{ margin: '4px 0' }}>
            📊 <strong>观察方式：</strong>打开浏览器控制台查看日志
          </p>
          <p style={{ margin: '4px 0' }}>
            🔍 <strong>预期行为：</strong>
          </p>
          <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
            <li>禁用时：每次点击都会看到 "🔄 [Remote1] App render" 日志</li>
            <li>
              启用时：只有首次加载会看到 "🔄 [Remote1] App render"
              日志，后续点击不会重新渲染
            </li>
          </ul>
        </div>
      </div>
      <Remote1App
        count={count}
        name={'Ming'}
        age={12}
        ref={ref}
        basename="/remote1"
        disableRerender={disableRerender}
      />
    </div>
  );
};

// Extract Remote2 route component to avoid recreating on every render
const Remote2Route = () => {
  return (
    <Remote2App
      style={{ padding: '20px' }}
      disableRerender={true}
      rootOptions={{
        identifierPrefix: 'remote2-instance-',
        onRecoverableError: (error: Error) => {
          console.error('[Host] Remote2 React 18 recoverable error:', error);
        },
      }}
    />
  );
};

const App = () => {
  const location = useLocation();
  const ref = useRef<HTMLElement>(null);
  const [count, setCount] = useState(0);

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
      <div
        data-testid="host-app-counter"
        style={{
          padding: '12px 20px',
          background: '#fff7e6',
          border: '2px solid #ffa940',
          borderRadius: '8px',
          margin: '16px 0',
          display: 'inline-block',
        }}
      >
        <div
          style={{ marginBottom: '8px', fontWeight: 'bold', color: '#d46b08' }}
        >
          🏠 宿主应用全局计数器
        </div>
        <button
          data-testid="host-count-button"
          onClick={() => setCount((s) => s + 1)}
          style={{
            padding: '8px 16px',
            fontSize: '16px',
            background: '#fa8c16',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          全局 Count: <span data-testid="host-count-value">{count}</span>
        </button>
        <div style={{ marginTop: '8px', fontSize: '12px', color: '#8c8c8c' }}>
          💡 此计数器在所有路由页面可见，用于测试跨页面状态
        </div>
      </div>
      <Routes>
        <Route path="/" Component={Home} />
        <Route path="/detail/*" Component={Detail} />
        <Route path="/remote1/*" Component={Remote1Route} />
        <Route path="/remote2/*" Component={Remote2Route} />
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
        <Route
          path="/remote5/*"
          Component={() => (
            <Remote5App
              rootOptions={{
                identifierPrefix: 'remote5-instance-',
                onRecoverableError: (error: Error) => {
                  console.error('[Host] Remote5 recoverable error:', error);
                },
              }}
            />
          )}
        />
        <Route
          path="/remote6/*"
          Component={() => (
            <Remote6App
              rootOptions={{
                identifierPrefix: 'remote6-instance-',
                onRecoverableError: (error: Error) => {
                  console.error('[Host] Remote6 recoverable error:', error);
                },
              }}
            />
          )}
        />
      </Routes>
    </div>
  );
};

export default App;
