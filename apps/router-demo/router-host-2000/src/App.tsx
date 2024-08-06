import { useRef, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { loadRemote } from '@module-federation/enhanced/runtime';
import { createRemoteComponent } from '@module-federation/bridge-react';
import { withErrorBoundary } from 'react-error-boundary';
import Navigation from './navigation';
import Detail from './pages/Detail';
import Home from './pages/Home';
import styles from './index.module.less';
import './App.css';

const FallbackErrorComp = (info: any) => {
  return (
    <div>
      {info?.error?.message}
      <button onClick={() => info.resetErrorBoundary()}>
        resetErrorBoundary
      </button>
    </div>
  );
};

const FallbackComp = <div>loading</div>;

const Remote1App = createRemoteComponent({
  loader: () => loadRemote('remote1/export-app'),
  fallback: FallbackErrorComp,
  loading: FallbackComp,
});

const ComponentWithErrorBoundary = withErrorBoundary(Remote1App, {
  fallback: <div>Something went wrong</div>,
  onError(error, info) {
    console.log('Caught an error!', error, info);
  },
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
          <Remote3App memoryRoute={{ entryPath: '/detail' }} />
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
        ref.current.style.border = '2px solid';
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
            <ComponentWithErrorBoundary
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
      </Routes>
    </div>
  );
};

export default App;
