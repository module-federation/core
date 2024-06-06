import React from 'react';
import Button from 'antd/lib/button';
import { registerRemotes, MFReactComponent } from '@modern-js/runtime/mf';
import stuff from './stuff.module.css';

registerRemotes([
  {
    name: 'dynamic_remote',
    entry: 'http://localhost:3008/mf-manifest.json',
  },
]);

const LazyButton2 = React.lazy(() =>
  import('./Button2').then((m) => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(m), 2000);
    });
  }),
);

const LazyButton1 = React.lazy(() =>
  import('./Button').then((m) => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(m), 1000);
    });
  }),
);

export default (): JSX.Element => (
  <div className="testlll">
    <h2>
      <strong>dynamic nested remote</strong>
    </h2>
    <Button
      className={stuff['test-remote2']}
      onClick={() => alert('Client side Javascript works!')}
    >
      Click me to test <strong>dynamic nested remote</strong> interactive!
    </Button>

    <MFReactComponent id="dynamic_remote/Image" />
    <React.Suspense fallback="loading btn 1000ms">
      <LazyButton1 />
    </React.Suspense>
    <React.Suspense fallback="loading btn 2000ms">
      <LazyButton2 />
    </React.Suspense>
  </div>
);
