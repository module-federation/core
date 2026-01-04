const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');
const supertest = require('supertest');

const app1Root = path.dirname(require.resolve('app1/package.json'));
const buildIndex = path.join(app1Root, 'build/index.html');
const manifest = path.join(app1Root, 'build/react-client-manifest.json');

// Replace pg Pool with a stub so server routes work without Postgres.
function installPgStub() {
  const pgPath = require.resolve('pg');
  const mockPool = {
    query: async (sql, params) => {
      if (/select \* from notes where id/.test(sql)) {
        return {
          rows: [
            {
              id: 1,
              title: 'Test Note',
              body: 'Hello from endpoint',
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
              title: 'Test Note',
              body: 'Hello from endpoint',
              updated_at: new Date().toISOString(),
            },
          ],
        };
      }
      if (/insert into notes/.test(sql)) {
        return { rows: [{ id: 2 }] };
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

function requireApp() {
  installFetchStub();
  installPgStub();
  process.env.RSC_TEST_MODE = '1';
  delete require.cache[require.resolve('app1/server/api.server')];
  return require('app1/server/api.server');
}

function installFetchStub() {
  const note = {
    id: 1,
    title: 'Test Note',
    body: 'Hello from endpoint',
    updated_at: new Date().toISOString(),
  };
  global.fetch = async () => ({
    json: async () => note,
    ok: true,
    status: 200,
    clone() {
      return this;
    },
  });
}

function buildLocation(selectedId, isEditing, searchText) {
  return encodeURIComponent(
    JSON.stringify({ selectedId, isEditing, searchText }),
  );
}

test('HTTP /react returns RSC flight with client refs', async (t) => {
  if (!fs.existsSync(buildIndex) || !fs.existsSync(manifest)) {
    t.skip('Build output missing. Run `pnpm run build` first.');
  }

  const app = requireApp();
  const request = supertest(app);
  const res = await request
    .get(`/react?location=${buildLocation(1, true, 'Test')}`)
    .expect(200);

  // X-Location header echoes location.
  const loc = JSON.parse(res.headers['x-location']);
  assert.equal(loc.selectedId, 1);
  assert.equal(loc.isEditing, true);

  const body = res.text;
  assert.match(body, /Test Note/, 'note data present');
  assert.match(body, /NoteEditor\.js/, 'client module ref present');
  assert.match(body, /client\d+\.js/, 'client chunk referenced');
});
