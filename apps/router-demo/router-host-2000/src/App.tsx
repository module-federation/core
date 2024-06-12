import { useMemo, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import Navigation from './navigation';
import Detail from './pages/Detail';
import Home from './pages/Home';
import { withErrorBoundary } from 'react-error-boundary';
import { loadRemote } from '@module-federation/enhanced/runtime';
import { createRemoteComponent } from '@module-federation/bridge-react';

const Remote1App = createRemoteComponent(() =>
  loadRemote('remote1/export-app'),
);

const Remote2App = createRemoteComponent(
  () => loadRemote('remote2/export-app'),
  { export: 'provider' },
);
const Remote3App = createRemoteComponent(() =>
  loadRemote('remote3/export-app'),
);

const FallbackComp = <div>loading</div>;
const FallbackErrorComp = (info: any) => {
  console.log('error', info);
  return <div>{info.error.message}</div>;
};

function Wraper3() {
  return (
    <>
      <div className="flex flex-row">
        <div className="grow">
          <h2>Remote1</h2>
          <Remote1App
            memoryRoute={{ entryPath: '/' }}
            loading={FallbackComp}
            errorBoundary={FallbackErrorComp}
          />
        </div>
        <div className="grow">
          <h2>Remote2</h2>
          <Remote2App
            memoryRoute={{ entryPath: '/detail' }}
            loading={FallbackComp}
            errorBoundary={FallbackErrorComp}
          />
        </div>
        <div className="grow">
          <h2>Remote3</h2>
          <Remote3App
            memoryRoute={{ entryPath: '/detail' }}
            loading={FallbackComp}
            errorBoundary={FallbackErrorComp}
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
        <Route path="/detail" Component={Detail} />
        <Route
          path="/remote1/*"
          Component={() => (
            <Remote1App
              loading={FallbackComp}
              errorBoundary={FallbackErrorComp}
            />
          )}
        />
        <Route
          path="/remote2/*"
          Component={() => (
            <Remote2App
              loading={FallbackComp}
              errorBoundary={FallbackErrorComp}
            />
          )}
        />
        <Route
          path="/remote3/*"
          Component={() => (
            <Remote3App
              loading={FallbackComp}
              errorBoundary={FallbackErrorComp}
            />
          )}
        />
        <Route path="/memory-router/*" Component={() => <Wraper3 />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
