import React, { Suspense, lazy } from 'react';
import TestRemoteHook from './test-remote-hook';
import LocalBtn from './components/ButtonOldAnt';
import WebpackPng from './webpack.png';
import WebpackSvg from './webpack.svg';
import { WebpackPngRemote, WebpackSvgRemote } from './Remote1';
import Remote2 from './Remote2';

const Root = () => (
  <div>
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
            <TestRemoteHook />
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
            <img className="home-webpack-png" src={WebpackPng} />
          </td>
          <td>
            <WebpackPngRemote />
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
            <img className="home-webpack-svg" src={WebpackSvg} />
          </td>
          <td>
            <WebpackSvgRemote />
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
          <td>Loading dynamic remote Button from localhost:3007</td>
          <td>
            <LocalBtn />
          </td>
          <td>
            <Remote2 />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
);

export default Root;
