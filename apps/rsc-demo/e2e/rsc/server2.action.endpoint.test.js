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
const actionsManifest = path.join(
  app2Root,
  'build/react-server-actions-manifest.json',
);
const ACTION_HEADER = 'Next-Action';
const ACTION_HEADER_FALLBACK = 'RSC-Action';
const ROUTER_STATE_HEADER = 'Next-Router-State-Tree';

function setActionHeaders(
  request,
  actionId,
  { includePrimary = true, includeFallback = true } = {},
) {
  if (includePrimary) {
    request.set(ACTION_HEADER, actionId);
  }
  if (includeFallback) {
    request.set(ACTION_HEADER_FALLBACK, actionId);
  }
  return request;
}

// Replace pg Pool with a stub so server routes work without Postgres.
function installPgStub() {
  const pgPath = require.resolve('pg');
  const mockPool = {
    query: async (sql, params) => {
      if (/select \* from notes/.test(sql)) {
        return {
          rows: [
            {
              id: 1,
              title: 'Test Note',
              body: 'Hello (app2)',
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
    body: 'Hello from app2',
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
  // Clear module cache to get fresh state
  delete require.cache[require.resolve('app2/server/api.server')];
  const serverActionsPath = require.resolve('app2/src/server-actions.js');
  delete require.cache[serverActionsPath];
  return require('app2/server/api.server');
}

function buildLocation(selectedId = null, isEditing = false, searchText = '') {
  return encodeURIComponent(
    JSON.stringify({ selectedId, isEditing, searchText }),
  );
}

test('APP2: POST /react without action header returns 400', async (t) => {
  if (!fs.existsSync(buildIndex)) {
    t.skip('Build output missing. Run `pnpm run build` first.');
    return;
  }

  const app = requireApp();
  const res = await supertest(app).post('/react').send('').expect(400);

  assert.match(res.text, /Missing (action|RSC-Action) header/i);
});

test('APP2: POST /react with unknown action ID via fallback header returns 404', async (t) => {
  if (!fs.existsSync(buildIndex) || !fs.existsSync(actionsManifest)) {
    t.skip('Build output missing. Run `pnpm run build` first.');
    return;
  }

  const app = requireApp();
  const res = await setActionHeaders(
    supertest(app).post('/react'),
    'file:///unknown/action.js#nonexistent',
    { includePrimary: false },
  )
    .send('')
    .expect(404);

  assert.match(res.text, /not found/);
});

test('APP2: POST /react with valid action ID executes incrementCount', async (t) => {
  if (!fs.existsSync(buildIndex) || !fs.existsSync(actionsManifest)) {
    t.skip('Build output missing. Run `pnpm run build` first.');
    return;
  }

  const manifest = JSON.parse(fs.readFileSync(actionsManifest, 'utf8'));
  const incrementActionId = Object.keys(manifest).find((k) =>
    k.includes('incrementCount'),
  );

  if (!incrementActionId) {
    t.skip('incrementCount action not found in manifest');
    return;
  }

  const app = requireApp();

  const res1 = await supertest(app)
    .post(`/react?location=${buildLocation()}`)
    .set(ACTION_HEADER, incrementActionId)
    .set('Content-Type', 'text/plain')
    .send('[]')
    .expect(200);

  assert.match(res1.headers['content-type'], /text\/x-component/);
  assert.ok(res1.headers['x-action-result']);
  const result1 = JSON.parse(res1.headers['x-action-result']);
  assert.equal(result1, 1);

  const res2 = await supertest(app)
    .post(`/react?location=${buildLocation()}`)
    .set(ACTION_HEADER, incrementActionId)
    .set('Content-Type', 'text/plain')
    .send('[]')
    .expect(200);

  const result2 = JSON.parse(res2.headers['x-action-result']);
  assert.equal(result2, 2);
});

test('APP2: POST /react with valid action ID executes getCount', async (t) => {
  if (!fs.existsSync(buildIndex) || !fs.existsSync(actionsManifest)) {
    t.skip('Build output missing. Run `pnpm run build` first.');
    return;
  }

  const manifest = JSON.parse(fs.readFileSync(actionsManifest, 'utf8'));
  const getCountActionId = Object.keys(manifest).find((k) =>
    k.includes('getCount'),
  );

  if (!getCountActionId) {
    t.skip('getCount action not found in manifest');
    return;
  }

  const app = requireApp();

  const res = await supertest(app)
    .post(`/react?location=${buildLocation()}`)
    .set(ACTION_HEADER, getCountActionId)
    .set('Content-Type', 'text/plain')
    .send('[]')
    .expect(200);

  assert.match(res.headers['content-type'], /text\/x-component/);
  assert.ok(res.headers['x-action-result']);
  const result = JSON.parse(res.headers['x-action-result']);
  assert.equal(typeof result, 'number');
});

test('APP2: POST /react accepts router-state header for location', async (t) => {
  if (!fs.existsSync(buildIndex) || !fs.existsSync(actionsManifest)) {
    t.skip('Build output missing. Run `pnpm run build` first.');
    return;
  }

  const manifest = JSON.parse(fs.readFileSync(actionsManifest, 'utf8'));
  const actionId = Object.keys(manifest).find((k) => k.includes('getCount'));

  if (!actionId) {
    t.skip('getCount action not found in manifest');
    return;
  }

  const app = requireApp();
  const routerState = { selectedId: 7, isEditing: true, searchText: 'header' };

  const res = await setActionHeaders(supertest(app).post('/react'), actionId, {
    includeFallback: false,
  })
    .set(ROUTER_STATE_HEADER, JSON.stringify(routerState))
    .set('Content-Type', 'text/plain')
    .send('[]')
    .expect(200);

  assert.match(res.headers['content-type'], /text\/x-component/);
  assert.ok(res.headers['x-action-result']);
});
