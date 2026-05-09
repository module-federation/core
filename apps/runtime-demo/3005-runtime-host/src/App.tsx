import React from 'react';
import {
  Link,
  Routes,
  Route,
  BrowserRouter,
  useLocation,
} from 'react-router-dom';
import ObservabilityDemo from './ObservabilityDemo';
import ObservabilityShowcase from './ObservabilityShowcase';
import Root from './Root';
import Remote1 from './Remote1';
import Remote2 from './Remote2';

const AppRoutes = () => {
  const location = useLocation();
  const isShowcase = location.pathname.startsWith('/observability-showcase');

  return (
    <>
      {!isShowcase ? (
        <>
          <h1>Runtime Demo</h1>
          <ul>
            <li>
              <Link to={'/'}>Home</Link>
            </li>
            <li>
              <Link to={'/remote1'}>remote1</Link>
            </li>
            <li>
              <Link to={'/remote2'}>remote2</Link>
            </li>
            <li>
              <Link to={'/observability'}>observability</Link>
            </li>
            <li>
              <Link to={'/observability-showcase'}>observability showcase</Link>
            </li>
          </ul>
        </>
      ) : null}
      <Routes>
        <Route path="/" element={<Root />} />
        <Route path="/remote1" element={<Remote1 />} />
        <Route path="/remote2" element={<Remote2 />} />
        <Route path="/observability" element={<ObservabilityDemo />} />
        <Route
          path="/observability-showcase/*"
          element={<ObservabilityShowcase />}
        />
      </Routes>
    </>
  );
};

const App = () => (
  <BrowserRouter>
    <AppRoutes />
  </BrowserRouter>
);

export default App;
