import React, { useState, Suspense } from 'react';
import {
  loadRemote,
  registerRemotes,
  createRemoteSSRComponent,
} from '@modern-js/runtime/mf';

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
          entry: 'http://localhost:3056/mf-manifest.json',
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
            <td>This component is from a dynamic remote(localhost:3053)</td>
            <td>
              <button
                id="dynamic-remote-local-button"
                style={{ marginBottom: '1rem' }}
                onClick={() =>
                  alert('[Dynamic Remote Page] Client side Javascript works!')
                }
              >
                Click me to test host interactive!
              </button>
            </td>
            <td>
              <RemoteSSRComponent text={'host render'} />
            </td>
          </tr>

          {/* replace remote */}
          <tr>
            <td>✅</td>
            <td>click button to replace new remote </td>
            <td>
              <button
                id="dynamic-remote-replace-button"
                style={{ marginBottom: '1rem' }}
                onClick={replaceRemote}
              >
                replace new remote
              </button>
            </td>
            <td>
              <Suspense fallback={<div>Loading...</div>}>
                {showComponent && <NewRemoteCom text="" />}
              </Suspense>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Index;
