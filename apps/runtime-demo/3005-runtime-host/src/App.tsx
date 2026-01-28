import React, { lazy } from 'react';
import { loadRemote } from '@module-federation/runtime';
import { Link, Routes, Route, BrowserRouter } from 'react-router-dom';
import Root from './Root';
import Remote1 from './Remote1';
import Remote2 from './Remote2';

const RouterBrowser = BrowserRouter as React.ComponentType<any>;
const RouterLink = Link as React.ComponentType<any>;
const RouterRoutes = Routes as React.ComponentType<any>;
const RouterRoute = Route as React.ComponentType<any>;

const App = () => (
  <RouterBrowser>
    <h1>Runtime Demo</h1>
    <ul>
      <li>
        <RouterLink to={'/'}>Home</RouterLink>
      </li>
      <li>
        <RouterLink to={'/remote1'}>remote1</RouterLink>
      </li>
      <li>
        <RouterLink to={'/remote2'}>remote2</RouterLink>
      </li>
    </ul>
    <RouterRoutes>
      <RouterRoute path="/" element={<Root />} />
      <RouterRoute path="/remote1" element={<Remote1 />} />
      <RouterRoute path="/remote2" element={<Remote2 />} />
    </RouterRoutes>
  </RouterBrowser>
);

export default App;
