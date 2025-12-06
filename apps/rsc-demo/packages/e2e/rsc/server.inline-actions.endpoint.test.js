const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');
const supertest = require('supertest');

const buildIndex = path.resolve(__dirname, '../../app1/build/index.html');
const actionsManifestPath = path.resolve(
  __dirname,
  '../../app1/build/react-server-actions-manifest.json'
);

function installPgStub() {
  const pgPath = require.resolve('pg');
  const mockPool = {
    query: async () => ({rows: []}),
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
    title: 'Test Note',
    body: 'Hello',
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

function requireApp() {
  installFetchStub();
  installPgStub();
  process.env.RSC_TEST_MODE = '1';
  delete require.cache[require.resolve('../../app1/server/api.server')];
  return require('../../app1/server/api.server');
}

function buildLocation(selectedId = null, isEditing = false, searchText = '') {
  return encodeURIComponent(
    JSON.stringify({selectedId, isEditing, searchText})
  );
}

test('APP1 inline actions: clear → add → add → getCount yields 2', async (t) => {
  if (!fs.existsSync(buildIndex) || !fs.existsSync(actionsManifestPath)) {
    t.skip('Build output missing. Run `pnpm run build` first.');
    return;
  }

  const manifest = JSON.parse(fs.readFileSync(actionsManifestPath, 'utf8'));
  const clearId = Object.keys(manifest).find((k) =>
    k.includes('inline-actions.server.js#clearMessages')
  );
  const addId = Object.keys(manifest).find((k) =>
    k.includes('inline-actions.server.js#addMessage')
  );
  const getId = Object.keys(manifest).find((k) =>
    k.includes('inline-actions.server.js#getMessageCount')
  );

  if (!clearId || !addId || !getId) {
    t.skip('Inline actions not present in manifest');
    return;
  }

  const app = requireApp();

  // Clear first
  const resClear = await supertest(app)
    .post(`/react?location=${buildLocation()}`)
    .set('RSC-Action', clearId)
    .set('Content-Type', 'text/plain')
    .send('[]')
    .expect(200);

  const clearResult = JSON.parse(resClear.headers['x-action-result']);
  assert.equal(clearResult, 0, 'clearMessages should return 0');

  // Add two messages
  const resAdd1 = await supertest(app)
    .post(`/react?location=${buildLocation()}`)
    .set('RSC-Action', addId)
    .set('Content-Type', 'text/plain')
    .send('["One"]')
    .expect(200);
  const add1 = JSON.parse(resAdd1.headers['x-action-result']);

  const resAdd2 = await supertest(app)
    .post(`/react?location=${buildLocation()}`)
    .set('RSC-Action', addId)
    .set('Content-Type', 'text/plain')
    .send('["Two"]')
    .expect(200);
  const add2 = JSON.parse(resAdd2.headers['x-action-result']);

  // Sanity: intermediate counts should be >= 1
  assert.ok(typeof add1 === 'number');
  assert.ok(typeof add2 === 'number');

  // Final get count
  const resGet = await supertest(app)
    .post(`/react?location=${buildLocation()}`)
    .set('RSC-Action', getId)
    .set('Content-Type', 'text/plain')
    .send('[]')
    .expect(200);

  const finalCount = JSON.parse(resGet.headers['x-action-result']);
  assert.equal(finalCount, 2, 'getMessageCount after two adds should be 2');
});
