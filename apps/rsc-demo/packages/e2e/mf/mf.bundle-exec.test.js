const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');
const React = require('react');
const ReactDOMServer = require('react-dom/server');

const app2Dist = path.resolve(__dirname, '../../app2/dist/server');

function loadContainer() {
  const remoteEntryPath = path.resolve(app2Dist, 'app2-remote.js');
  // Clear any cache to pick up fresh build
  delete require.cache[remoteEntryPath];
  return require(remoteEntryPath);
}

test('app2 Button loads from remoteEntry and renders with shared React', async (t) => {
  if (!fs.existsSync(path.join(app2Dist, 'app2-remote.js'))) {
    t.skip('Build app2 first with pnpm run build:mf');
    return;
  }

  const container = loadContainer();

  const shareScope = {
    default: {
      react: {
        get: () => () => React,
        from: 'host',
        eager: false,
        loaded: true,
        version: React.version,
      },
      'react-dom': {
        get: () => () => ReactDOMServer,
        from: 'host',
        eager: false,
        loaded: true,
        version: React.version,
      },
    },
  };

  await container.init(shareScope);
  const modFactory = await container.get('./Button');
  const mod = modFactory();
  const RemoteButton = mod?.default || mod;

  assert.equal(typeof RemoteButton, 'function', 'Remote Button is a component');
  const html = ReactDOMServer.renderToStaticMarkup(
    React.createElement(RemoteButton),
  );
  assert.match(html, /Remote Button/i, 'Button SSR renders with shared React');
});
