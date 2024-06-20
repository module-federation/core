import { useMemo, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import Navigation from './navigation';
import Detail from './pages/Detail';
import Home from './pages/Home';
import { loadRemote } from '@module-federation/enhanced/runtime';
import { createRemoteComponent } from '@module-federation/bridge-react';
import { ErrorBoundary, withErrorBoundary } from 'react-error-boundary';

const FallbackErrorComp = (info: any) => {
  return <div>{info?.error?.message}</div>;
};

const Remote1App = withErrorBoundary(
  createRemoteComponent(() => loadRemote('remote1/export-app')),
  {
    FallbackComponent: FallbackErrorComp,
  },
);

const Remote2App = createRemoteComponent(
  () => loadRemote('remote2/export-app'),
  { export: 'provider' },
);
const Remote3App = createRemoteComponent(() =>
  loadRemote('remote3/export-app'),
) as (info: any) => React.JSX.Element;

const FallbackComp = <div>loading</div>;

function Wraper3() {
  return (
    <>
      <div className="flex flex-row">
        <div className="grow">
          <h2>Remote1</h2>
          <Remote1App
            memoryRoute={{ entryPath: '/' }}
            fallback={FallbackComp}
            errorBoundary={FallbackErrorComp}
          />
        </div>
        <div className="grow">
          <h2>Remote2</h2>
          <Remote2App
            memoryRoute={{ entryPath: '/detail' }}
            fallback={FallbackComp}
          />
        </div>
        <div className="grow">
          <h2>Remote3</h2>
          <Remote3App
            memoryRoute={{ entryPath: '/detail' }}
            fallback={FallbackComp}
          />
        </div>
      </div>
    </>
  );
}

const App = () => {
  const [initialEntrie, setInitialEntrie] = useState('/');
  const [abc, setAbc] = useState(5555);

  return (
    <BrowserRouter basename="/">
      <Navigation setInitialEntrie={setInitialEntrie} setAbc={setAbc} />
      <Routes>
        <Route path="/" Component={Home} />
        <Route path="/detail/*" Component={Detail} />
        <Route
          path="/remote1/*"
          Component={() => <Remote1App fallback={FallbackComp} />}
        />
        <Route
          path="/remote2/*"
          Component={() => <Remote2App fallback={FallbackComp} />}
        />
        <Route
          path="/remote3/*"
          Component={() => <Remote3App fallback={FallbackComp} />}
        />
        <Route path="/memory-router/*" Component={() => <Wraper3 />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
