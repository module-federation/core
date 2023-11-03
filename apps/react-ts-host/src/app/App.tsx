import * as React from 'react';
import NxWelcome from './nx-welcome';
import { Link, Route, Routes } from 'react-router-dom';
import useDynamicModule from './useDynamicRemote';

const ReactTsRemote = React.lazy(() => import('react_ts_remote/Module'));

const DynamicReactTsRemote = React.lazy(() =>
  useDynamicModule({
    name: 'react_ts_remote',
    url: 'http://localhost:3004/remoteEntry.js',
    modulePath: './Module',
  }),
);

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
          <Link to="/dynamic-react-ts-remote">DynamicReactTsRemote</Link>
        </li>
      </ul>
      <Routes>
        <Route path="/" element={<NxWelcome title="react-ts-host" />} />
        <Route path="/react-ts-remote" element={<ReactTsRemote />} />
        <Route
          path="/dynamic-react-ts-remote"
          element={
            <React.Suspense>
              <DynamicReactTsRemote />
            </React.Suspense>
          }
        />
      </Routes>
    </React.Suspense>
  );
}

export default App;
