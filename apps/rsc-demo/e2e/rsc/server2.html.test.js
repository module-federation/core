const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');
const supertest = require('supertest');

const app2Root = path.dirname(require.resolve('app2/package.json'));
const buildIndex = path.join(app2Root, 'build/index.html');

function installPgStub() {
  const pgPath = require.resolve('pg');
  const mockPool = { query: async () => ({ rows: [] }) };
  require.cache[pgPath] = {
    id: pgPath,
    filename: pgPath,
    loaded: true,
    exports: {
      Pool: function Pool() {
        return mockPool;
      },
    },
  };
}

function installFetchStub() {
  global.fetch = async () => ({ json: async () => ({}) });
}

function requireApp() {
  installPgStub();
  installFetchStub();
  process.env.RSC_TEST_MODE = '1';
  delete require.cache[require.resolve('app2/server/api.server')];
  return require('app2/server/api.server');
}

test('APP2: GET / returns built shell html with main.js', async (t) => {
  if (!fs.existsSync(buildIndex)) {
    t.skip('Build output missing. Run `pnpm run build` first.');
    return;
  }

  const app = requireApp();
  const res = await supertest(app).get('/').expect(200);

  assert.match(res.text, /<script[^>]+main\.js/, 'response references main.js');
  assert.match(res.text, /<div id="root">/, 'root container present');
});
