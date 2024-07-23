import React from 'react';
import { loadRemote, registerRemotes } from '@modern-js/runtime/mf';

registerRemotes([
  {
    name: 'dynamic_nested_remote',
    entry: 'http://localhost:3054/mf-manifest.json',
  },
]);

const DynamicNestedRemote = React.lazy(() =>
  loadRemote('dynamic_nested_remote/Content').then((m) => {
    return m;
  }),
);

const Index = (): JSX.Element => {
  return (
    <div>
      <h1>Dynamic Nested Remote</h1>
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
            <td>
              This component is from a dynamic remote(localhost:3054) which nest
              a dynamic remote
            </td>
            <td>
              <button
                id="nested-dynamic-remote-local-button"
                style={{ marginBottom: '1rem' }}
                onClick={() =>
                  alert(
                    '[Nested Dynamic Remote Page] Client side Javascript works!',
                  )
                }
              >
                Click me to test host interactive!
              </button>
            </td>
            <td>
              <DynamicNestedRemote />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Index;
