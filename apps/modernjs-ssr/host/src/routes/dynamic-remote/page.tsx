import React, { useState, Suspense } from 'react';
import { loadRemote, registerRemotes } from '@modern-js/runtime/mf';

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

const NewRemoteCom = React.lazy(() =>
  loadRemote('dynamic_remote/Image').then((m) => {
    console.log('加载');
    return m;
  }),
);
const Index = (): JSX.Element => {
  const [showComponent, setShowComponent] = useState(false);
  const replaceRemote = () => {
    console.log('replaceRemote click');
    registerRemotes(
      [
        {
          name: 'dynamic_remote',
          entry: 'http://localhost:3011/mf-manifest.json',
        },
      ],
      { force: true },
    );

    setShowComponent(true);
  };

  return (
    <div>
      <h1>Dynamic Remote</h1>
      <table border={1} cellPadding={5}>
        <thead>
          <tr>
            <td></td>
            <td>Desc</td>
            <td>Host component</td>
            <td>Remote component</td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>✅</td>
            <td>This component is from a dynamic remote(localhost:3008)</td>
            <td>
              <button
                style={{ marginBottom: '1rem' }}
                onClick={() => alert('Client side Javascript works!')}
              >
                Click me to test host interactive!
              </button>
            </td>
            <td>
              <DynamicRemote />
            </td>
          </tr>

          {/* replace remote */}
          <tr>
            <td>✅</td>
            <td>click button to replace new remote </td>
            <td>
              <button style={{ marginBottom: '1rem' }} onClick={replaceRemote}>
                replace new remote
              </button>
            </td>
            <td>
              <Suspense fallback={<div>Loading...</div>}>
                {showComponent && <NewRemoteCom />}
              </Suspense>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Index;
