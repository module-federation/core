import React, { useState, Suspense } from 'react';
import Comp from 'remote/Image';
import { registerRemotes, loadRemote } from '@modern-js/runtime/mf';

const NewRemoteCom = React.lazy(() =>
  loadRemote('remote/Image').then((m) => {
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
          name: 'remote',
          entry: 'http://localhost:3055/mf-manifest.json',
        },
      ],
      { force: true },
    );

    setShowComponent(true);
  };

  return (
    <div>
      <h1>Static Remote</h1>
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
            <td>This component is from a remote(localhost:3051)</td>
            <td>
              <button
                id="remote-local-button"
                style={{ marginBottom: '1rem' }}
                onClick={() =>
                  alert('[Remote Page] Client side Javascript works!')
                }
              >
                Click me to test host interactive!
              </button>
            </td>
            <td>
              <Comp />
            </td>
          </tr>
          {/* replace remote */}
          <tr>
            <td>✅</td>
            <td>click button to replace new remote </td>
            <td>
              <button
                id="remote-replace-button"
                style={{ marginBottom: '1rem' }}
                onClick={replaceRemote}
              >
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
