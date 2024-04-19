import React from 'react';
import {
  loadRemote,
  registerRemotes,
} from '@module-federation/enhanced/runtime';
import { useNavigate } from '@modern-js/runtime/router';
import './index.css';

registerRemotes([
  {
    name: 'dynamic_nested_remote',
    entry: 'http://localhost:3009/mf-manifest.json',
  },
]);

const DynamicNestedRemote = React.lazy(() =>
  loadRemote('dynamic_nested_remote/Content').then((m) => {
    return m;
  }),
);

const Index = (): JSX.Element => {
  const navi = useNavigate();

  return (
    <div className="container-box">
      host page , router: dynamic-nested-remote
      <button
        style={{ marginBottom: '1rem' }}
        onClick={() => alert('Client side Javascript works!')}
      >
        Click me to test host interactive!
      </button>
      <button style={{ marginBottom: '1rem' }} onClick={() => navi('/user')}>
        Click to jump router!
      </button>
      <DynamicNestedRemote />
    </div>
  );
};

export default Index;
