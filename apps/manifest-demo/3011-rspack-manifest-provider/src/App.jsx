import React, { Suspense, lazy, useEffect, useState } from 'react';
import * as _ from 'lodash';
import * as antd from 'antd';

const AsyncFile = lazy(() =>
  import('./asyncFile').then((m) => {
    return { default: () => <div>{m.default}</div> };
  }),
);

function App() {
  return (
    <div
      id="3011-rspack-manifest-provider"
      style={{
        height: 300,
        overflow: 'scroll',
        width: 300,
      }}
    >
      <h2>lodash apis:</h2>
      <nav>
        {Object.keys(_).map((key, index) => {
          return <li key={index}>{key}</li>;
        })}
      </nav>
      <h2>antd components:</h2>
      <nav>
        {Object.keys(antd).map((key, index) => {
          return <li key={index}>{key}</li>;
        })}
      </nav>
      <h2>async file</h2>
      <Suspense fallback="loading AsyncFile">
        <AsyncFile />
      </Suspense>
    </div>
  );
}

export default App;
