import React from 'react';
import Button from 'antd/lib/button';
import {
  loadRemote,
  registerRemotes,
} from '@module-federation/enhanced/runtime';
import stuff from './stuff.module.css';

const isServer = typeof window === 'undefined';
registerRemotes([
  {
    name: 'dynamic_remote',
    entry: isServer
      ? 'http://localhost:3008/bundles/bundles/remoteEntry.js'
      : 'http://localhost:3008/remoteEntry.js',
  },
]);

const Comp = React.lazy(() =>
  loadRemote('dynamic_remote/Image').then((m) => {
    return m;
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

    <Comp />
  </div>
);
