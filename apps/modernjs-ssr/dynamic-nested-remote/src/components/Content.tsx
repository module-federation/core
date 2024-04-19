import React from 'react';
import Button from 'antd/lib/button';
import { loadRemote, registerRemotes } from '@modern-js/runtime/mf';
import stuff from './stuff.module.css';

const isServer = typeof window === 'undefined';
registerRemotes([
  {
    name: 'dynamic_remote',
    entry: 'http://localhost:3008/mf-manifest.json',
  },
]);

const Comp = React.lazy(() =>
  loadRemote('dynamic_remote/Image').then((m) => {
    return {
      default: () => (
        <div>
          <link
            href="http://localhost:3008/static/css/async/__federation_expose_Image.css"
            rel="stylesheet"
            type="text/css"
          />
          <span>11</span>
          <m.default />
        </div>
      ),
    };
  }),
);

const LazyButton = React.lazy(() =>
  import('./Button').then((m) => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(m), 0);
    });
  }),
);

const LazyButton2 = React.lazy(() =>
  import('./Button').then((m) => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(m), 0);
    });
  }),
);

export default (): JSX.Element => (
  <div className="testlll">
    <h2 onClick={() => alert('Client side Javascript works!')}>
      <strong>dynamic nested remote</strong>
    </h2>
    <Button
      className={stuff['test-remote2']}
      onClick={() => alert('Client side Javascript works!')}
    >
      Click me to test <strong>dynamic nested remote</strong> interactive!
    </Button>

    <React.Suspense fallback="loading">
      <Comp />
    </React.Suspense>
    <React.Suspense fallback="loading btn">
      <LazyButton />
    </React.Suspense>
    <React.Suspense fallback="loading btn2">
      <LazyButton2 />
    </React.Suspense>
  </div>
);
