import React from 'react';
import Comp from 'nested_remote/Content';

const Index = (): JSX.Element => {
  return (
    <div>
      <h1>Static Nested Remote</h1>
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
              This component is from a remote(localhost:3052) which nest a
              static remote
            </td>
            <td>
              <button
                id="nested-remote-local-button"
                style={{ marginBottom: '1rem' }}
                onClick={() =>
                  alert('[Nested Remote Page] Client side Javascript works!')
                }
              >
                Click me to test host interactive!
              </button>
            </td>
            <td>
              <Comp />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Index;
