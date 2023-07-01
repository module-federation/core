import * as React from 'react';
import NxWelcome from './nx-welcome';
import { Link, Route, Routes } from 'react-router-dom';

const ReactTsRemote = React.lazy(() => import('react_ts_remote/Module'));

const DynamicReactTsRemote = React.lazy(() => { 

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
      </ul>
      <Routes>
        <Route path="/" element={<NxWelcome title="react-ts-host" />} />
        <Route
          path="/react-ts-remote"
          element={
            <React.Suspense>
              <ReactTsRemote />
            </React.Suspense>
          }
        />
      </Routes>
    </React.Suspense>
  );
}

export default App;
