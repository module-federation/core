import React from 'react';
import Button from 'antd/lib/button';
import {
  registerRemotes,
  loadRemote,
  createRemoteSSRComponent,
} from '@modern-js/runtime/mf';
import stuff from './stuff.module.css';

registerRemotes([
  {
    name: 'dynamic_remote',
    entry: 'http://localhost:3053/mf-manifest.json',
  },
]);

const RemoteSSRComponent = createRemoteSSRComponent({
  loader: () => loadRemote('dynamic_remote/Image'),
  loading: 'loading...',
  fallback: ({ error }) => {
    if (error instanceof Error && error.message.includes('not exist')) {
      return <div>fallback - not existed id</div>;
    }
    return <div>fallback</div>;
  },
});

const LazyButton2 = React.lazy(() =>
  import('./Button2').then((m) => {
    return new Promise<typeof import('./Button2')>((resolve) => {
      setTimeout(() => resolve(m), 2000);
    });
  }),
);

const LazyButton1 = React.lazy(() =>
  import('./Button').then((m) => {
    return new Promise<typeof import('./Button')>((resolve) => {
      setTimeout(() => resolve(m), 1000);
    });
  }),
);

export default (): JSX.Element => (
  <div
    id="nested-dynamic-remote-components"
    style={{
      backgroundColor: '#e9541e',
      color: 'lightgrey',
      padding: '1rem',
    }}
  >
    <h2>
      <strong>dynamic nested remote</strong>
    </h2>
    <Button
      id="nested-dynamic-remote-components-button"
      className={stuff['test-remote2']}
      onClick={() =>
        alert(
          '[nested-dynamic-remote-components] Client side Javascript works!',
        )
      }
    >
      Click me to test <strong>dynamic nested remote</strong> interactive!
    </Button>

    <RemoteSSRComponent text={'xxxx'} />

    <React.Suspense fallback="loading btn 1000ms">
      <LazyButton1 />
    </React.Suspense>
    <React.Suspense fallback="loading btn 2000ms">
      <LazyButton2 />
    </React.Suspense>
  </div>
);
