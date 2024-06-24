import { useMemo, useState } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import './App.css';
import Navigation from './navigation';
import Home from './pages/Home';
import { loadRemote } from '@module-federation/enhanced/runtime';
import { createRemoteComponent } from '@module-federation/bridge-react';
import { withErrorBoundary } from 'react-error-boundary';

const FallbackErrorComp = (info: any) => {
  return <div>{info?.error?.message}</div>;
};

const Remote1App = withErrorBoundary(
  createRemoteComponent(() => loadRemote('remote1/export-app')),
  {
    FallbackComponent: FallbackErrorComp,
  },
);

const FallbackComp = <div>loading</div>;

const App = () => {
  const [initialEntrie, setInitialEntrie] = useState('/');
  const [abc, setAbc] = useState(5555);
  return (
    <BrowserRouter basename="/test">
      <Navigation setInitialEntrie={setInitialEntrie} setAbc={setAbc} />
      <Route exact path="/">
        <Home />
      </Route>
      <Route path="/remote1">
        <Remote1App fallback={FallbackComp} />
      </Route>
    </BrowserRouter>
  );
};
export default App;
