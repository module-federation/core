import { useRef, useMemo, useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { loadRemote } from '@module-federation/enhanced/runtime';
import { createRemoteComponent } from '@module-federation/bridge-react';
import Navigation from './navigation';
import Detail from './pages/Detail';
import Home from './pages/Home';
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
          <Remote1App memoryRoute={{ entryPath: '/' }} />
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
  const [initialEntrie, setInitialEntrie] = useState('/');
  const [abc, setAbc] = useState(5555);
  useEffect(() => {
    const refTimeout = setTimeout(() => {
      if (ref && ref.current) {
        ref.current.style.backgroundColor = 'salmon';
      }
    }, 2000)
    return () => {
      if (!location.pathname.includes('remote1')) {
        clearTimeout(refTimeout);
      }
    }
  }, [location.pathname])
  return (
    <div>
      <Navigation setInitialEntrie={setInitialEntrie} setAbc={setAbc} />
      <Routes>
        <Route path="/" Component={Home} />
        <Route path="/detail/*" Component={Detail} />
        <Route path="/remote1/*" Component={() => <Remote1App ref={ref} />} />
        <Route path="/remote2/*" Component={() => <Remote2App />} />
        <Route path="/remote3/*" Component={() => <Remote3App />} />
        <Route path="/memory-router/*" Component={() => <Wraper3 />} />
      </Routes>
    </div>
  );
};

export default App;
