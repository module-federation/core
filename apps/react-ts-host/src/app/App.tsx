import * as React from 'react';
import NxWelcome from './nx-welcome';
import { Link, Route, Routes } from 'react-router-dom';
import useDynamicModule from './useDynamicModule';
import type RemoteModule from 'react_ts_remote/Module';

const ReactTsRemote = React.lazy(() => import('react_ts_remote/Module'));

type RemoteComponent = React.ComponentType<any> & typeof RemoteModule;

const Module = React.lazy(() =>
  useDynamicModule<{ default: RemoteComponent }>({
    name: 'react_ts_remote',
    url: 'http://localhost:3004',
    modulePath: './Module',
  })
);

// const Module = React.lazy(() =>
//   importRemote({
//     url: 'http://localhost:3004',
//     scope: 'react_ts_remote',
//     module: 'Module',
//   })
// );

export function App() {
  return (
    <React.Suspense fallback={null}>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/react-ts-remote">ReactTsRemote</Link>
        </li>
        <li>
          <Link to="/dynamic-remote">DynamicReactTsRemote</Link>
        </li>
      </ul>
      <Routes>
        <Route path="/" element={<NxWelcome title="react-ts-host" />} />
        <Route path="/react-ts-remote" element={<ReactTsRemote />} />
        <Route
          path="/dynamic-remote"
          element={
            <React.Suspense fallback={<div>Loading...</div>}>
              <Module />
            </React.Suspense>
          }
        />
      </Routes>
    </React.Suspense>
  );
}

export default App;
