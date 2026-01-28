import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';

const RouterOutlet = Outlet as React.ComponentType<any>;

const Root = () => {
  return (
    <div>
      <h1>Manifest Demo</h1>
      <nav>
        <ul>
          <li>
            <a href={`/preload`}>preload</a>
          </li>
          <li>
            <a href={`/basic`}>basic usage</a>
          </li>
        </ul>
      </nav>
      <RouterOutlet />
    </div>
  );
};

export default Root;
