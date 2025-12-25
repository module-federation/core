const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { PassThrough } = require('stream');

// Use the BUNDLED server output - no node-register or --conditions needed!
const bundlePath = path.resolve(__dirname, '../../app1/build/server.rsc.js');
const manifestPath = path.resolve(
  __dirname,
  '../../app1/build/react-client-manifest.json',
);
const app2BuildDir = path.resolve(__dirname, '../../app2/build');

function readJsonFromApp2Build(fileName) {
  return JSON.parse(fs.readFileSync(path.join(app2BuildDir, fileName), 'utf8'));
}

function installStubs() {
  // Stub fetch so Note.js can load a note without hitting the network.
  const note = {
    id: 1,
    title: 'Test Note',
    body: 'Hello from test',
    updated_at: new Date().toISOString(),
  };

  const realFetch = global.fetch;
  const makeJsonResponse = (data) => ({
    ok: true,
    status: 200,
    json: async () => data,
    headers: { get: () => 'application/json' },
    clone: () => makeJsonResponse(data),
  });

  const makeTextResponse = (text) => ({
    ok: true,
    status: 200,
    headers: { get: () => 'application/javascript' },
    text: async () => text,
    arrayBuffer: async () => Buffer.from(text, 'utf8'),
    clone: () => makeTextResponse(text),
  });

  global.fetch = async (input, init) => {
    const url =
      typeof input === 'string'
        ? input
        : input && typeof input.url === 'string'
          ? input.url
          : String(input || '');

    // Local app data fetch (Note.js)
    if (url.includes('/notes/')) {
      return makeJsonResponse(note);
    }

    // When server-side federation uses manifest-based remotes, the runtime may
    // fetch app2 manifests during render. Serve the built JSON from disk so the
    // smoke test stays offline/deterministic.
    try {
      const pathname = new URL(url).pathname;
      if (pathname === '/mf-manifest.server.json') {
        return makeJsonResponse(
          readJsonFromApp2Build('mf-manifest.server.json'),
        );
      }
      if (pathname === '/mf-manifest.server-stats.json') {
        return makeJsonResponse(
          readJsonFromApp2Build('mf-manifest.server-stats.json'),
        );
      }
      if (pathname === '/react-server-actions-manifest.json') {
        return makeJsonResponse(
          readJsonFromApp2Build('react-server-actions-manifest.json'),
        );
      }
      if (pathname === '/react-client-manifest.json') {
        return makeJsonResponse(
          readJsonFromApp2Build('react-client-manifest.json'),
        );
      }

      // Serve built JS files from disk so MF can load app2's remote container
      // without starting an HTTP server.
      const buildFile = pathname.replace(/^\//, '');
      const onDiskPath = path.join(app2BuildDir, buildFile);
      if (fs.existsSync(onDiskPath) && fs.statSync(onDiskPath).isFile()) {
        return makeTextResponse(fs.readFileSync(onDiskPath, 'utf8'));
      }
    } catch (_e) {
      // ignore URL parse failures and fall through
    }

    return realFetch(input, init);
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

test('RSC render smoke (built output)', async (t) => {
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
  assert.match(output, /Hello from test/, 'renders note body');
  assert.match(
    output,
    /Remote server component rendered from app2/,
    'renders a federated server component from app2',
  );
});

test('RSC includes client component payloads (editing state)', async (t) => {
  if (!fs.existsSync(bundlePath)) {
    t.skip('Build output missing. Run `pnpm run build` first.');
  }

  installStubs();
  const output = await renderFlight({
    selectedId: 1,
    isEditing: true,
    searchText: 'Test',
  });

  // Assert client references made it into the flight payload (module IDs/chunks).
  // With webpack layers, module IDs may have (client) prefix
  assert.match(output, /NoteEditor\.js/, 'NoteEditor client ref present');
  assert.match(output, /EditButton\.js/, 'EditButton client ref present');
  assert.match(output, /client\d+\.js/, 'client chunk referenced');
  assert.match(output, /Test Note/, 'server note title still present');
});
