const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { PassThrough } = require('stream');
const {
  makeJsonResponse,
  maybeHandleManifestFetch,
} = require('./fetch-helpers');

const app2Root = path.dirname(require.resolve('app2/package.json'));

// Use the BUNDLED server output - no node-register or --conditions needed!
const bundlePath = path.join(app2Root, 'build/server.rsc.js');
const manifestPath = path.join(app2Root, 'build/react-client-manifest.json');

function installStubs() {
  // Stub fetch so Note.js can load a note without hitting the network.
  const note = {
    id: 1,
    title: 'Test Note (app2)',
    body: 'Hello from test app2',
    updated_at: new Date().toISOString(),
  };

  global.fetch = async (url) => {
    const manifestResponse = maybeHandleManifestFetch(url);
    if (manifestResponse) return manifestResponse;
    return makeJsonResponse(note);
  };
}

async function renderFlight(props) {
  // Load the bundled RSC server (webpack already resolved react-server condition)
  // With asyncStartup: true, the module returns a promise
  const server = await Promise.resolve(require(bundlePath));
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  const chunks = [];
  await new Promise((resolve, reject) => {
    const { pipe } = server.renderApp(props, manifest);
    const sink = new PassThrough();
    sink.on('data', (c) => chunks.push(c));
    sink.on('end', resolve);
    sink.on('error', reject);
    pipe(sink);
  });
  return Buffer.concat(chunks).toString('utf8');
}

test('APP2: RSC render smoke (built output)', async (t) => {
  if (!fs.existsSync(bundlePath)) {
    t.skip('Build output missing. Run `pnpm run build` first.');
  }

  installStubs();
  const output = await renderFlight({
    selectedId: 1,
    isEditing: false,
    searchText: '',
  });
  assert.match(output, /Test Note/, 'renders note title');
  assert.match(output, /Hello from test app2/, 'renders note body');
});

test('APP2: RSC includes client component payloads (editing state)', async (t) => {
  if (!fs.existsSync(bundlePath)) {
    t.skip('Build output missing. Run `pnpm run build` first.');
  }

  installStubs();
  const output = await renderFlight({
    selectedId: 1,
    isEditing: true,
    searchText: 'Test',
  });

  assert.match(output, /NoteEditor\.js/, 'NoteEditor client ref present');
  assert.match(output, /EditButton\.js/, 'EditButton client ref present');
  assert.match(output, /client\d+\.js/, 'client chunk referenced');
  assert.match(output, /Test Note/, 'server note title still present');
});
