import React, { Suspense, lazy } from 'react';
// import ReactDOM from 'react-dom';
import { init, loadRemote } from '@module-federation/runtime';
// import Remote2Btn from 'remote2/Button'
import TestRemoteHook from './test-remote-hook';
import LocalBtn from './components/ButtonOldAnt';
import WebpackPng from './webpack.png';
import WebpackSvg from './webpack.svg';

function DynamicRemoteButton() {
  // @ts-ignore ignore
  const Comp = React.lazy(async () => {
    //@ts-ignore
    const Button = await loadRemote('dynamic-remote/ButtonOldAnt');
    return Button;
  });
  return (
    <React.Suspense fallback="Loading Button">
      <Comp />
    </React.Suspense>
  );
}

const WebpackSvgRemote = lazy(() =>
  import('remote1/WebpackSvg').then((m) => {
    return m;
  }),
);

const WebpackPngRemote = lazy(() => import('remote1/WebpackPng'));

const App = () => (
  <div>
    <h1>Runtime Demo</h1>
    <h2>Host</h2>
    <h3>check static remote</h3>
    <table border={1} cellPadding={5}>
      <thead>
        <tr>
          <td></td>
          <td>Test case</td>
          <td>Expected</td>
          <td>Actual</td>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>✅</td>
          <td>Test hook from remote localhost:3006</td>
          <td>
            <div>
              Page with custom remote hook. You must see text in red box below:
              <div style={{ border: '1px solid red', padding: 5 }}>
                Custom hook from localhost:3006 works!
              </div>
            </div>
          </td>
          <td>
            <React.Suspense fallback="Loading Button">
              <TestRemoteHook />
            </React.Suspense>
          </td>
        </tr>
        <tr>
          <td>✅</td>
          <td>
            Loading remote component with PNG image from localhost:3006
            <br />
            <blockquote>(check publicPath fix in image-loader)</blockquote>
          </td>
          <td>
            <img src={WebpackPng} />
          </td>
          <td>
            <Suspense fallback="loading WebpackPngRemote">
              <WebpackPngRemote />
            </Suspense>
          </td>
        </tr>
        <tr>
          <td>✅</td>
          <td>
            Loading remote component with SVG from localhost:3006
            <br />
            <blockquote>(check publicPath fix in url-loader)</blockquote>
          </td>
          <td>
            <img src={WebpackSvg} />
          </td>
          <td>
            <Suspense fallback="loading WebpackSvgRemote">
              <WebpackSvgRemote />
            </Suspense>
          </td>{' '}
        </tr>
      </tbody>
    </table>

    <h3>check dynamic remote</h3>
    <table border={1} cellPadding={5}>
      <thead>
        <tr>
          <td></td>
          <td>Test case</td>
          <td>Expected</td>
          <td>Actual</td>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>✅</td>
          <td>Loading dynamic remote Button from localhost:3007</td>
          <td>
            <LocalBtn />
          </td>
          <td>
            <DynamicRemoteButton />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
);

export default App;
