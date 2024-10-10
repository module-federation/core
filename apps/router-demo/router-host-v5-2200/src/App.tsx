import { Suspense, useMemo, useState } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import './App.css';
import Navigation from './navigation';
import Home from './pages/Home';
import { loadRemote } from '@module-federation/enhanced/runtime';
import { createRemoteComponent } from '@module-federation/bridge-react';

const FallbackErrorComp = (info: any) => {
  return <div>{info?.error?.message}</div>;
};

const FallbackComp = <div>loading</div>;

const Remote1App = createRemoteComponent({
  loader: () => loadRemote('remote1/export-app'),
  fallback: FallbackErrorComp,
  loading: FallbackComp,
});

const Remote2App = createRemoteComponent({
  // @ts-ignore
  loader: () => import('remote2/export-app'),
  export: 'provider',
  fallback: FallbackErrorComp,
  loading: FallbackComp,
});

const Remote3App = createRemoteComponent({
  loader: () => loadRemote('remote3/export-app'),
  fallback: FallbackErrorComp,
  loading: FallbackComp,
}) as (info: any) => React.JSX.Element;

const App = () => {
  const [initialEntrie, setInitialEntrie] = useState('/');
  const [abc, setAbc] = useState(5555);
  return (
    <BrowserRouter basename="/test">
      <Navigation setInitialEntrie={setInitialEntrie} setAbc={setAbc} />
      <Route exact path="/">
        <Home />
      </Route>
      <Route
        path="/remote1"
        render={() => (
          <Suspense fallback={FallbackComp}>
            <Remote1App />
          </Suspense>
        )}
      />
      <Route
        path="/remote2"
        render={() => (
          <Suspense fallback={FallbackComp}>
            <Remote2App />
          </Suspense>
        )}
      />
      <Route
        path="/remote3"
        render={() => (
          <Suspense fallback={FallbackComp}>
            <Remote3App />
          </Suspense>
        )}
      />
    </BrowserRouter>
  );
};
export default App;
