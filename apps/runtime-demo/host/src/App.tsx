import React from 'react';
import ReactDOM from 'react-dom';
import { init, loadRemote } from '@module-federation/runtime';
import Remote2Button from 'remote2/Button';
import LocalButton from './Button';
import customPlugin from './runtimePlugin';

init({
  // must the same as module-federation.config's name
  name: 'runtime_demo_host',
  remotes: [
    {
      name: 'runtime_demo_remote1',
      alias: 'remote1',
      entry: 'http://localhost:3006/remoteEntry.js',
    },
  ],
  shared: {
    react: {
      version: '18.2.0',
      scope: 'default',
      lib: () => React,
      shareConfig: {
        singleton: true,
        requiredVersion: '>17',
      },
    },
    'react-dom': {
      version: '18.2.0',
      scope: 'default',
      lib: () => ReactDOM,
      shareConfig: {
        singleton: true,
        requiredVersion: '>17',
      },
    },
  },
  plugins: [customPlugin()],
});

function RemoteButton() {
  // @ts-ignore ignore
  const Comp = React.lazy(async () => {
    const Button = await loadRemote('remote1/Button');
    return Button;
  });
  return (
    <React.Suspense fallback="Loading Button">
      <Comp />
    </React.Suspense>
  );
}

const App = () => (
  <div>
    <h2>host</h2>
    <LocalButton />
    <React.Suspense fallback="Loading Button">
      <RemoteButton />
    </React.Suspense>
    <Remote2Button />
  </div>
);

export default App;
