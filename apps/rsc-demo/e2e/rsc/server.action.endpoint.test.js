const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');
const supertest = require('supertest');
const {
  makeJsonResponse,
  maybeHandleManifestFetch,
} = require('./fetch-helpers');

const app1Root = path.dirname(require.resolve('app1/package.json'));
const buildIndex = path.join(app1Root, 'build/index.html');
const actionsManifest = path.join(
  app1Root,
  'build/react-server-actions-manifest.json',
);

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
              body: 'Hello',
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
    title: 'Test Note',
    body: 'Hello',
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
  delete require.cache[require.resolve('app1/server/api.server')];
  // Also clear the server-actions module to reset action count
  const serverActionsPath = require.resolve('app1/src/server-actions.js');
  delete require.cache[serverActionsPath];
  return require('app1/server/api.server');
}

function buildLocation(selectedId = null, isEditing = false, searchText = '') {
  return encodeURIComponent(
    JSON.stringify({ selectedId, isEditing, searchText }),
  );
}

test('POST /react without RSC-Action header returns 400', async (t) => {
  if (!fs.existsSync(buildIndex)) {
    t.skip('Build output missing. Run `pnpm run build` first.');
    return;
  }

  const app = requireApp();
  const res = await supertest(app).post('/react').send('').expect(400);

  assert.match(res.text, /Missing RSC-Action header/);
});

test('POST /react with unknown action ID returns 404', async (t) => {
  if (!fs.existsSync(buildIndex) || !fs.existsSync(actionsManifest)) {
    t.skip('Build output missing. Run `pnpm run build` first.');
    return;
  }

  const app = requireApp();
  const res = await supertest(app)
    .post('/react')
    .set('RSC-Action', 'file:///unknown/action.js#nonexistent')
    .send('')
    .expect(404);

  assert.match(res.text, /not found/);
});

test('POST /react with valid action ID executes incrementCount', async (t) => {
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

  // First call - should return 1
  const res1 = await supertest(app)
    .post(`/react?location=${buildLocation()}`)
    .set('RSC-Action', incrementActionId)
    .set('Content-Type', 'text/plain')
    .send('[]') // Empty args array encoded as Flight Reply
    .expect(200);

  assert.match(res1.headers['content-type'], /text\/x-component/);
  // Action result should be in X-Action-Result header
  assert.ok(
    res1.headers['x-action-result'],
    'X-Action-Result header should be present',
  );
  const result1 = JSON.parse(res1.headers['x-action-result']);
  assert.equal(result1, 1, 'First increment should return 1');

  // Second call - should return 2
  const res2 = await supertest(app)
    .post(`/react?location=${buildLocation()}`)
    .set('RSC-Action', incrementActionId)
    .set('Content-Type', 'text/plain')
    .send('[]')
    .expect(200);

  const result2 = JSON.parse(res2.headers['x-action-result']);
  assert.equal(result2, 2, 'Second increment should return 2');
});

test('POST /react with valid action ID executes getCount', async (t) => {
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
    .set('RSC-Action', getCountActionId)
    .set('Content-Type', 'text/plain')
    .send('[]')
    .expect(200);

  assert.match(res.headers['content-type'], /text\/x-component/);
  assert.ok(
    res.headers['x-action-result'],
    'X-Action-Result header should be present',
  );
  // getCount returns the current count (starts at 0 in fresh module)
  const result = JSON.parse(res.headers['x-action-result']);
  assert.equal(typeof result, 'number', 'getCount should return a number');
});

// --- Bug regression tests ---

test('[P1] Default-exported server actions should work', async (t) => {
  // This tests for the bug where default exports use inconsistent action IDs
  // Loader generates: file:///path#default
  // Plugin was generating: file:///path (without #default)

  if (!fs.existsSync(actionsManifest)) {
    t.skip('Build output missing. Run `pnpm run build` first.');
    return;
  }

  const manifest = JSON.parse(fs.readFileSync(actionsManifest, 'utf8'));

  // Check that all action IDs in manifest use consistent format with #name suffix
  const actionIds = Object.keys(manifest);
  for (const actionId of actionIds) {
    const entry = manifest[actionId];
    if (entry.name === 'default') {
      // For default exports, the actionId should include #default
      assert.match(
        actionId,
        /#default$/,
        `Default export action ID should end with #default, got: ${actionId}`,
      );
    } else {
      // For named exports, the actionId should include #exportName
      assert.match(
        actionId,
        new RegExp(`#${entry.name}$`),
        `Named export action ID should end with #${entry.name}, got: ${actionId}`,
      );
    }
  }
});

test('[P1] Default-exported server action can be executed', async (t) => {
  // This tests that default exports can actually be invoked, not just that the manifest is correct

  if (!fs.existsSync(buildIndex) || !fs.existsSync(actionsManifest)) {
    t.skip('Build output missing. Run `pnpm run build` first.');
    return;
  }

  const manifest = JSON.parse(fs.readFileSync(actionsManifest, 'utf8'));
  const defaultActionId = Object.keys(manifest).find((k) =>
    k.includes('#default'),
  );

  if (!defaultActionId) {
    t.skip('No default-exported action found in manifest');
    return;
  }

  const app = requireApp();

  const res = await supertest(app)
    .post(`/react?location=${buildLocation()}`)
    .set('RSC-Action', defaultActionId)
    .set('Content-Type', 'text/plain')
    .send('["test-value"]') // Pass a string argument
    .expect(200);

  assert.ok(
    res.headers['x-action-result'],
    'X-Action-Result header should be present',
  );
  const result = JSON.parse(res.headers['x-action-result']);
  assert.equal(
    result.received,
    'test-value',
    'Default action should receive and return argument',
  );
  assert.ok(result.timestamp, 'Default action should return timestamp');
});

test('[P2] Server action handler accepts JSON-encoded args', async (t) => {
  // This tests that simple scalar arguments work with the current implementation
  // More complex args (FormData, File) require multipart handling which is a separate fix

  if (!fs.existsSync(buildIndex) || !fs.existsSync(actionsManifest)) {
    t.skip('Build output missing. Run `pnpm run build` first.');
    return;
  }

  const manifest = JSON.parse(fs.readFileSync(actionsManifest, 'utf8'));
  const actionId = Object.keys(manifest).find((k) =>
    k.includes('incrementCount'),
  );

  if (!actionId) {
    t.skip('incrementCount action not found in manifest');
    return;
  }

  const app = requireApp();

  // Test with empty array (simple case)
  const res = await supertest(app)
    .post(`/react?location=${buildLocation()}`)
    .set('RSC-Action', actionId)
    .set('Content-Type', 'text/plain')
    .send('[]')
    .expect(200);

  assert.ok(
    res.headers['x-action-result'],
    'Should handle simple JSON array args',
  );
});

test('POST /react returns RSC flight stream body', async (t) => {
  if (!fs.existsSync(buildIndex) || !fs.existsSync(actionsManifest)) {
    t.skip('Build output missing. Run `pnpm run build` first.');
    return;
  }

  const manifest = JSON.parse(fs.readFileSync(actionsManifest, 'utf8'));
  const actionId = Object.keys(manifest)[0];

  if (!actionId) {
    t.skip('No actions found in manifest');
    return;
  }

  const app = requireApp();

  const res = await supertest(app)
    .post(`/react?location=${buildLocation(1, false, '')}`)
    .set('RSC-Action', actionId)
    .set('Content-Type', 'text/plain')
    .send('[]')
    .expect(200);

  // Response body should be RSC flight format
  assert.ok(res.text.length > 0, 'Response body should not be empty');
  // Flight format includes $L for lazy references and module refs
  assert.match(res.text, /\$/, 'RSC flight format contains $ references');
});
