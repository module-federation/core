import React, { Suspense, lazy } from 'react';
import Head from 'next/head';
import CheckoutTitle from 'checkout/CheckoutTitle';
import ButtonOldAnt from 'checkout/ButtonOldAnt';
// const CheckoutTitle = lazy(() => import('checkout/CheckoutTitle'));
// const ButtonOldAnt = lazy(() => import('checkout/ButtonOldAnt'));
const WebpackSvgRemote = lazy(() =>
  import('shop/WebpackSvg').then((m) => {
    return m;
  }),
);
const WebpackPngRemote = lazy(() => import('shop/WebpackPng'));

// Server-side render counter (resets on each server restart/HMR)
let serverRenderCount = 0;

const Home = ({ renderCount, renderTime }) => {
  return (
    <>
      <Head>
        <title>Home</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div
        style={{
          padding: '15px',
          marginBottom: '20px',
          backgroundColor: '#f0f8ff',
          border: '2px solid #1890ff',
          borderRadius: '8px',
          fontFamily: 'monospace',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#1890ff',
            marginBottom: '12px',
          }}
        >
          🔥 Server Render Counter
        </div>
        <div
          style={{
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#52c41a',
            marginBottom: '8px',
          }}
          data-testid="render-counter"
        >
          {renderCount || 0}
        </div>
        <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
          Route: <span style={{ color: '#fa8c16', fontWeight: 'bold' }}>/</span>
        </div>
        {renderTime && (
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
            Last render: {new Date(renderTime).toLocaleTimeString()}
          </div>
        )}
        <div style={{ fontSize: '12px', color: '#999', fontStyle: 'italic' }}>
          💡 After HMR (?hotReloadAll=true), count should reset to 1 on next
          page reload
        </div>
      </div>

      <h1 style={{ fontSize: '2em' }}>
        This is SPA combined from 3 different nextjs applications.
      </h1>
      <p className="description">
        They utilize omnidirectional routing and pages or components are able to
        be federated between applications.
      </p>
      <p>You may open any application by clicking on the links below:</p>
      <ul>
        <li>
          <a
            href="#reloadPage"
            onClick={() => (window.location.href = 'http://localhost:3000')}
          >
            localhost:3000
          </a>
          {' – '}
          <b>home</b>
        </li>
        <li>
          <a
            href="#reloadPage"
            onClick={() => (window.location.href = 'http://localhost:3001')}
          >
            localhost:3001
          </a>
          {' – '}
          <b>shop</b>
        </li>
        <li>
          <a
            href="#reloadPage"
            onClick={() => (window.location.href = 'http://localhost:3002')}
          >
            localhost:3002
          </a>
          {' – '}
          <b>checkout</b>
        </li>
      </ul>
      <h2 style={{ marginTop: '30px' }}>Federation test cases</h2>
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
            <td>
              Loading remote component (CheckoutTitle) from localhost:3002
              <br />
              <blockquote>
                lazy(()=&gt;import(&apos;checkout/CheckoutTitle&apos;))
              </blockquote>
            </td>
            <td>
              <h3>This title came from checkout with hooks data!!!</h3>
            </td>
            <td>
              <Suspense fallback="loading CheckoutTitle">
                <CheckoutTitle />
              </Suspense>
            </td>
          </tr>
          <tr>
            <td>✅</td>
            <td>
              Load federated component from checkout with old antd version
            </td>
            <td>[Button from antd@5.18.3]</td>
            <td>
              <Suspense fallback="loading ButtonOldAnt">
                <ButtonOldAnt />
              </Suspense>
            </td>
          </tr>
          <tr>
            <td>✅</td>
            <td>
              Loading remote component with PNG image from localhost:3001
              <br />
              <blockquote>(check publicPath fix in image-loader)</blockquote>
            </td>
            <td>
              <img className="home-webpack-png" src="./webpack.png" />
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
              Loading remote component with SVG from localhost:3001
              <br />
              <blockquote>(check publicPath fix in url-loader)</blockquote>
            </td>
            <td>
              <img src="./webpack.svg" />
            </td>
            <td>
              <Suspense fallback="loading WebpackSvgRemote">
                <WebpackSvgRemote />
              </Suspense>
            </td>
          </tr>
        </tbody>
      </table>

      <h2 style={{ marginTop: '30px' }}>Other problems to fix:</h2>
      <ul>
        <li>
          🐞 Incorrectly exposed modules in next.config.js (e.g. typo in path)
          do not throw an error in console
        </li>
        <li>
          📝 Try to introduce a remote entry loading according to prefix path.
          It will be nice runtime improvement if you have eg 20 apps and load
          just one remoteEntry instead of all of them.
        </li>
        <li>
          📝 It will be nice to regenerate remoteEntry if new page was added in
          remote app.
        </li>
        <li>
          📝 Remote components do not regenerate chunks if they were changed.
        </li>
      </ul>
    </>
  );
};

export async function getServerSideProps() {
  // Increment server render count
  serverRenderCount++;
  console.log(
    '[HMR Home] Server getServerSideProps called, count:',
    serverRenderCount,
  );

  return {
    props: {
      renderCount: serverRenderCount,
      renderTime: new Date().toISOString(),
    },
  };
}

export default Home;
