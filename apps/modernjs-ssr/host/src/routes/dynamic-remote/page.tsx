import React from 'react';
import { loadRemote, registerRemotes } from '@modern-js/runtime/mf';
import { useNavigate } from '@modern-js/runtime/router';
import './index.css';

registerRemotes([
  {
    name: 'dynamic_remote',
    entry: 'http://localhost:3008/mf-manifest.json',
  },
]);

const DynamicRemote = React.lazy(() =>
  loadRemote('dynamic_remote/Image').then((m) => {
    return m;
  }),
);

const Index = (): JSX.Element => {
  const navi = useNavigate();

  return (
    <div className="container-box">
      host page , router: dynamic-remote
      <button
        style={{ marginBottom: '1rem' }}
        onClick={() => alert('Client side Javascript works!')}
      >
        Click me to test host interactive!
      </button>
      <DynamicRemote />
    </div>
  );
};

export default Index;
