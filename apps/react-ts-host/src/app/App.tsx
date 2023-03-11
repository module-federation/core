import * as React from 'react';
import NxWelcome from './nx-welcome';
import { Link, Route, Routes } from 'react-router-dom';

const ReactTsRemote = React.lazy(() => import('react-ts-remote/Module'));

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
        <Route path="/react-ts-remote" element={<ReactTsRemote />} />
      </Routes>
    </React.Suspense>
  );
}

export default App;
