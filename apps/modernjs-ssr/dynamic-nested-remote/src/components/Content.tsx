import React from 'react';
import Button from 'antd/lib/button';
import { registerRemotes, MFReactComponent } from '@modern-js/runtime/mf';
import stuff from './stuff.module.css';
import { component$ } from '@builder.io/qwik';

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

    <MFReactComponent
      id="wrong_id_dynamic_remote/Image"
      loading={'loading...'}
      fallback={({ error }) => {
        console.log(error);
        return (
          <MFReactComponent
            id="dynamic_remote/Image"
            loading={'loading...'}
            fallback={() => <div>fallback component$</div>}
          />
        );
      }}
    />

    <React.Suspense fallback="loading btn 1000ms">
      <LazyButton1 />
    </React.Suspense>
    <React.Suspense fallback="loading btn 2000ms">
      <LazyButton2 />
    </React.Suspense>
  </div>
);
