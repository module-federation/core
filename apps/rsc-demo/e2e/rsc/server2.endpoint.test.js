const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');
const supertest = require('supertest');
const {
  makeJsonResponse,
  maybeHandleManifestFetch,
} = require('./fetch-helpers');

const app2Root = path.dirname(require.resolve('app2/package.json'));
const buildIndex = path.join(app2Root, 'build/index.html');
const manifest = path.join(app2Root, 'build/react-client-manifest.json');

function installPgStub() {
  const pgPath = require.resolve('pg');
  const mockPool = {
    query: async (sql, params) => {
      if (/select \* from notes where id/.test(sql)) {
        return {
          rows: [
            {
              id: 1,
              title: 'Test Note (app2)',
              body: 'Hello from endpoint app2',
              updated_at: new Date().toISOString(),
            },
          ],
        };
      }
      if (/select \* from notes order by/.test(sql)) {
        return {
          rows: [
            {
              id: 1,
              title: 'Test Note (app2)',
              body: 'Hello from endpoint app2',
              updated_at: new Date().toISOString(),
            },
          ],
        };
      }
      return { rows: [] };
    },
  };
  const stub = {
    Pool: function Pool() {
      return mockPool;
    },
  };
  require.cache[pgPath] = {
    id: pgPath,
    filename: pgPath,
    loaded: true,
    exports: stub,
  };
}

function installFetchStub() {
  const note = {
    id: 1,
    title: 'Test Note (app2)',
    body: 'Hello from endpoint app2',
    updated_at: new Date().toISOString(),
  };
  global.fetch = async (url) => {
    const manifestResponse = maybeHandleManifestFetch(url);
    if (manifestResponse) return manifestResponse;
    return makeJsonResponse(note);
  };
}

function requireApp() {
  installFetchStub();
  installPgStub();
  process.env.RSC_TEST_MODE = '1';
  delete require.cache[require.resolve('app2/server/api.server')];
  return require('app2/server/api.server');
}

function buildLocation(selectedId, isEditing, searchText) {
  return encodeURIComponent(
    JSON.stringify({ selectedId, isEditing, searchText }),
  );
}

test('APP2: HTTP /react returns RSC flight with client refs', async (t) => {
  if (!fs.existsSync(buildIndex) || !fs.existsSync(manifest)) {
    t.skip('Build output missing. Run `pnpm run build` first.');
  }

  const app = requireApp();
  const request = supertest(app);
  const res = await request
    .get(`/react?location=${buildLocation(1, true, 'Test')}`)
    .expect(200);

  const loc = JSON.parse(res.headers['x-location']);
  assert.equal(loc.selectedId, 1);
  assert.equal(loc.isEditing, true);

  const body = res.text;
  assert.match(body, /Test Note/, 'note data present');
  assert.match(body, /NoteEditor\.js/, 'client module ref present');
  assert.match(body, /client\d+\.js/, 'client chunk referenced');
});
