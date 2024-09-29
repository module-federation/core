import React, { Suspense, lazy } from 'react';
// @ts-ignore
import ReactComponent from 'modern-js-provider/react-component';
import TestRemoteHook from './test-remote-hook';
import { loadRemote } from '@module-federation/runtime';
import LocalBtn from './components/ButtonOldAnt';
import WebpackPng from './webpack.png';
import WebpackSvg from './webpack.svg';

function DynamicRemoteButton() {
  // @ts-ignore ignore
  const Comp = React.lazy(async () => {
    //@ts-ignore
    const Button = await loadRemote('dynamic-remote/ButtonOldAnt');
    console.log('BUTTON');
    console.log(Button);
    return Button;
  });
  console.log('loadManifestProvider');
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
    <ReactComponent />
    <h2>Manifest Basic Usage</h2>
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
          <td>Test hook from remote localhost:3009</td>
          <td>
            <div>
              Page with custom remote hook. You must see text in red box below:
              <div style={{ border: '1px solid red', padding: 5 }}>
                Custom hook from localhost:3009 works!
              </div>
            </div>
          </td>
          <td>
            <TestRemoteHook />
          </td>
        </tr>
        <tr>
          <td>✅</td>
          <td>
            Loading remote component with PNG image from localhost:3009
            <br />
            <blockquote>(check publicPath fix in image-loader)</blockquote>
          </td>
          <td>
            <img className="home-webpack-png" src={WebpackPng} />
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
            Loading remote component with SVG from localhost:3009
            <br />
            <blockquote>(check publicPath fix in url-loader)</blockquote>
          </td>
          <td>
            <img className="home-webpack-svg" src={WebpackSvg} />
          </td>
          <td>
            <Suspense fallback="loading WebpackSvgRemote">
              <WebpackSvgRemote />
            </Suspense>
          </td>
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
          <td>Loading dynamic remote Button from localhost:3010</td>
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
