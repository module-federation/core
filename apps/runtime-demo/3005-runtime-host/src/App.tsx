import React from 'react';
import { Link, Routes, Route, BrowserRouter } from 'react-router-dom';
import DiagnosticsDemo from './DiagnosticsDemo';
import Root from './Root';
import Remote1 from './Remote1';
import Remote2 from './Remote2';

const App = () => (
  <BrowserRouter>
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
        <Link to={'/diagnostics'}>diagnostics</Link>
      </li>
    </ul>
    <Routes>
      <Route path="/" element={<Root />} />
      <Route path="/remote1" element={<Remote1 />} />
      <Route path="/remote2" element={<Remote2 />} />
      <Route path="/diagnostics" element={<DiagnosticsDemo />} />
    </Routes>
  </BrowserRouter>
);

export default App;
