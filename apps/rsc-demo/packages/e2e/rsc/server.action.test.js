const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const {PassThrough} = require('stream');

// Use the BUNDLED server output - no node-register or --conditions needed!
const bundlePath = path.resolve(__dirname, '../../app1/build/server.rsc.js');
const manifestPath = path.resolve(
  __dirname,
  '../../app1/build/react-client-manifest.json'
);

function stubFetch(count) {
  global.fetch = async (url, opts = {}) => {
    if (url.endsWith('/action/incrementCount')) {
      return {json: async () => ({result: count + 1})};
    }
    if (/\/notes\//.test(url)) {
      return {
        json: async () => ({
          id: 1,
          title: 'Test Note',
          body: 'Hello from action test',
          updated_at: new Date().toISOString(),
        }),
      };
    }
    if (url.endsWith('/notes')) {
      return {json: async () => []};
    }
    throw new Error('Unexpected fetch ' + url);
  };
}

async function renderFlight(props) {
  // Load the bundled RSC server (webpack already resolved react-server condition)
  // With asyncStartup: true, the module returns a promise
  const server = await Promise.resolve(require(bundlePath));
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  const chunks = [];
  await new Promise((resolve, reject) => {
    const {pipe} = server.renderApp(props, manifest);
    const sink = new PassThrough();
    sink.on('data', (c) => chunks.push(c));
    sink.on('end', resolve);
    sink.on('error', reject);
    pipe(sink);
  });
  return Buffer.concat(chunks).toString('utf8');
}

test('server action reference is present in flight payload', async (t) => {
  if (!fs.existsSync(bundlePath)) {
    t.skip('Build output missing. Run `pnpm run build` first.');
  }

  stubFetch(5);
  const out = await renderFlight({
    selectedId: 1,
    isEditing: false,
    searchText: '',
  });

  assert.match(out, /DemoCounterButton/);
  // Ensure client reference for the demo counter is present
  assert.match(out, /\.\/src\/DemoCounterButton\.js/);
});
