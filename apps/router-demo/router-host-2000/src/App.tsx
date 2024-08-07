import { useRef, useEffect, ForwardRefExoticComponent } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { loadRemote } from '@module-federation/enhanced/runtime';
import { createRemoteComponent } from '@module-federation/bridge-react';
import Navigation from './navigation';
import Detail from './pages/Detail';
import Home from './pages/Home';
import styles from './index.module.less';
import './App.css';

const FallbackErrorComp = (info: any) => {
  return (
    <div>
      <p>Something went wrong:</p>
      <pre style={{ color: 'red' }}>{info?.error.message}</pre>
      <button onClick={() => info.resetErrorBoundary()}>
        resetErrorBoundary(try again)
      </button>
    </div>
  );
};

const FallbackComp = <div>loading...</div>;

const Remote1App = createRemoteComponent({
  loader: () => loadRemote('remote1/export-app'),
  fallback: FallbackErrorComp,
  loading: FallbackComp,
});

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

const RemoteErrorApp = createRemoteComponent({
  loader: () => loadRemote('remote_error/export-app'),
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
        <div className="grow">
          <h2>Remote Error </h2>
          <RemoteErrorApp />
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
            <Remote1App
              className={styles.remote1}
              name={'Ming'}
              age={12}
              ref={ref}
            />
          )}
        />
        <Route
          path="/remote2/*"
          Component={() => <Remote2App style={{ padding: '20px' }} />}
        />
        <Route path="/remote3/*" Component={() => <Remote3App />} />
        <Route path="/memory-router/*" Component={() => <Wraper3 />} />
        <Route path="/remote-error/*" Component={() => <RemoteErrorApp />} />
      </Routes>
    </div>
  );
};

export default App;
