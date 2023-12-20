import React from 'react';
import ReactDOM from 'react-dom';
import { init, loadRemote } from '@module-federation/runtime';
import LocalButton from './Button';
import customPlugin from './runtimePlugin';

init({
  name: 'app1',
  remotes: [
    {
      name: 'runtime_remote1',
      alias: 'app2',
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
    //@ts-ignore
    const Button = await loadRemote('app2/Button');
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
    <h1>Bi-Directional</h1>
    <h2>App 1</h2>
    <LocalButton />
    <React.Suspense fallback="Loading Button">
      <RemoteButton />
    </React.Suspense>
  </div>
);

export default App;
